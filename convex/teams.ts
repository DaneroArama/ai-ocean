/**
 * Teams — manage buildathon teams
 */
import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { getParticipantByIdentity, requireAdmin } from "./helpers";
import type { Doc, Id } from "./_generated/dataModel";

const MAX_AUTO_PLACEMENTS_PER_RUN = 300;
const MAX_TEAMS_LISTED = 200;
const MAX_MEMBERS_PER_TEAM = 50;

type AdminCtx = QueryCtx | MutationCtx;

async function getTeamOrThrow(ctx: AdminCtx, teamId: Id<"teams">) {
  const team = await ctx.db.get(teamId);
  if (!team) throw new Error("Team not found");
  return team;
}

/** Public member shape — names/positions only, never emails. */
type PublicMember = { name: string; position: string | null };

/**
 * Public roster for the team modal — no auth, no emails.
 * Named teams only (auto-generated unnamed teams stay private until named).
 */
export const listPublicTeams = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teams"),
      code: v.union(v.string(), v.null()),
      name: v.string(),
      badge: v.union(v.string(), v.null()),
      members: v.array(v.object({ name: v.string(), position: v.union(v.string(), v.null()) })),
    })
  ),
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").take(MAX_TEAMS_LISTED);
    const named = teams.filter((t): t is Doc<"teams"> & { name: string } => !!t.name);
    named.sort((a, b) => {
      const ac = a.code ?? "";
      const bc = b.code ?? "";
      if (ac !== bc) return ac.localeCompare(bc);
      return a.name.localeCompare(b.name);
    });

    const results = await Promise.all(
      named.map(async (team): Promise<{ _id: Id<"teams">; code: string | null; name: string; badge: string | null; members: PublicMember[] }> => {
        const members: PublicMember[] = [];
        for (const pid of team.memberIds.slice(0, MAX_MEMBERS_PER_TEAM)) {
          const p = await ctx.db.get(pid);
          if (!p) continue;
          members.push({
            name: p.name ?? p.firstName ?? "Team Member",
            position: p.position ?? null,
          });
        }
        return {
          _id: team._id,
          code: team.code ?? null,
          name: team.name,
          badge: team.badge ?? null,
          members,
        };
      })
    );
    return results;
  },
});

export const createTeam = mutation({
  args: {
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    badge: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.object({ teamId: v.id("teams") }),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const now = Date.now();
    const code = args.code?.trim() || undefined;
    if (code) {
      const existing = await ctx.db
        .query("teams")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (existing) throw new Error(`Team code ${code} is already in use`);
    }
    const teamId = await ctx.db.insert("teams", {
      name: args.name?.trim() || undefined,
      code,
      badge: args.badge?.trim() || undefined,
      description: args.description,
      memberIds: [],
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });
    return { teamId };
  },
});

/**
 * Registrations eligible for automatic team placement:
 * submitted, payment verified, and not yet on a team.
 */
type AutoCandidate = {
  regId: Id<"buildathonRegistrations">;
  participantId: Id<"participants">;
  track: "in_person" | "online" | undefined;
  category: string;
};

async function loadAutoTeamCandidates(ctx: QueryCtx) {
  const candidates: AutoCandidate[] = [];

  for await (const reg of ctx.db.query("buildathonRegistrations")) {
    if (reg.state !== "submitted") continue;
    if (reg.paymentStatus !== "verified") continue;
    if (reg.teamId !== undefined) continue;
    candidates.push({
      regId: reg._id,
      participantId: reg.participantId,
      track: reg.eventPreferences?.preferredTrack,
      category: reg.roleInfo?.positionCategory ?? "other",
    });
    if (candidates.length >= MAX_AUTO_PLACEMENTS_PER_RUN) break;
  }
  return candidates;
}

const TRACK_LABEL: Record<string, string> = {
  in_person: "In-Person",
  online: "Online",
};

export const countAutoTeamCandidates = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");

    const candidates = await loadAutoTeamCandidates(ctx);
    const byTrack: Record<string, number> = {};
    for (const c of candidates) {
      const key = c.track ?? "unspecified";
      byTrack[key] = (byTrack[key] ?? 0) + 1;
    }
    return { total: candidates.length, byTrack, capped: candidates.length >= MAX_AUTO_PLACEMENTS_PER_RUN };
  },
});

/**
 * Group eligible registrations into new teams:
 * split by preferred track, balanced so each team has an even head count
 * and a spread of positionCategory. New teams are created unnamed — the
 * admin names them later from the Teams page.
 */
export const autoCreateTeams = mutation({
  args: {
    teamSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");

    const teamSize = args.teamSize ?? 5;
    if (!Number.isInteger(teamSize) || teamSize < 2 || teamSize > 20) {
      throw new Error("Team size must be a whole number between 2 and 20");
    }

    const candidates = await loadAutoTeamCandidates(ctx);
    if (candidates.length === 0) {
      return { teamsCreated: 0, membersPlaced: 0, message: "No eligible registrations (submitted + payment verified) are waiting for a team." };
    }

    // Split by track: "in_person" | "online" | "unspecified"
    const buckets = new Map<string, AutoCandidate[]>();
    for (const c of candidates) {
      const key = c.track ?? "unspecified";
      const list = buckets.get(key) ?? [];
      list.push(c);
      buckets.set(key, list);
    }

    const now = Date.now();
    let teamsCreated = 0;
    let membersPlaced = 0;

    for (const [trackKey, members] of buckets) {
      // Group by category, then deal each category's members round-robin
      // across teams so every team ends up with a mix of roles.
      const byCategory = new Map<string, AutoCandidate[]>();
      for (const m of members) {
        const list = byCategory.get(m.category) ?? [];
        list.push(m);
        byCategory.set(m.category, list);
      }

      const teamCount = Math.ceil(members.length / teamSize);
      const teams: AutoCandidate[][] = Array.from({ length: teamCount }, () => []);
      const categoryCounts: Map<string, number>[] = Array.from(
        { length: teamCount },
        () => new Map<string, number>()
      );

      const place = (teamIndex: number, m: AutoCandidate) => {
        teams[teamIndex].push(m);
        const counts = categoryCounts[teamIndex];
        counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
      };

      let roundRobin = 0;
      for (const list of byCategory.values()) {
        for (const m of list) {
          // Prefer teams with room left; rotate starting index for even dealing.
          let placed = false;
          for (let n = 0; n < teams.length && !placed; n++) {
            const i = (roundRobin + n) % teams.length;
            if (teams[i].length < teamSize) {
              place(i, m);
              roundRobin = (i + 1) % teams.length;
              placed = true;
            }
          }
          if (!placed) {
            // Defensive fallback: every team is full (shouldn't happen given teamCount math).
            const i = teams.reduce((a, b) => (b.length < a.length ? b : a), teams[0]);
            place(teams.indexOf(i), m);
          }
        }
      }

      for (const team of teams) {
        if (team.length === 0) continue;
        const trackField = trackKey === "in_person" || trackKey === "online" ? trackKey : undefined;
        const teamId = await ctx.db.insert("teams", {
          memberIds: team.map((m) => m.participantId),
          description:
            trackKey === "unspecified"
              ? "Auto-generated • track not specified"
              : `Auto-generated • ${TRACK_LABEL[trackKey] ?? trackKey}`,
          track: trackField,
          createdBy: admin._id,
          createdAt: now,
          updatedAt: now,
        });
        teamsCreated++;
        for (const m of team) {
          await ctx.db.patch(m.regId, { teamId, updatedAt: now });
          membersPlaced++;
        }
      }
    }

    return {
      teamsCreated,
      membersPlaced,
      message: `Created ${teamsCreated} team(s) with ${membersPlaced} member(s). Names are yours to add.`,
    };
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    badge: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.code !== undefined) {
      const code = args.code.trim() || undefined;
      if (code) {
        const existing = await ctx.db
          .query("teams")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();
        if (existing && existing._id !== args.teamId) {
          throw new Error(`Team code ${code} is already in use`);
        }
      }
      patch.code = code;
    }
    if (args.badge !== undefined) patch.badge = args.badge.trim() || undefined;

    await ctx.db.patch(args.teamId, patch);
    return { success: true };
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Remove team from all registrations (bounded — registrations per team are small)
    const regs = await ctx.db.query("buildathonRegistrations")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .take(500);

    for (const reg of regs) {
      await ctx.db.patch(reg._id, { teamId: undefined, updatedAt: Date.now() });
    }

    await ctx.db.delete(args.teamId);
    return { success: true };
  },
});

/**
 * Manually add a person to a team from the admin dashboard.
 * Creates a participants row if the email is unknown, or reuses the existing
 * row (email-less roster members are allowed and auto-link on their first signup).
 */
export const addManualMember = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    email: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), participantId: v.id("participants") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const team = await getTeamOrThrow(ctx, args.teamId);

    const name = args.name.trim();
    if (!name) throw new Error("Name is required");
    if (team.memberIds.length >= MAX_MEMBERS_PER_TEAM) throw new Error("Team is full");

    const email = args.email?.trim().toLowerCase() || undefined;
    const position = args.position?.trim() || undefined;
    const now = Date.now();

    let participantId: Id<"participants">;
    if (email) {
      const existing = await ctx.db
        .query("participants")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existing) {
        participantId = existing._id;
        if (team.memberIds.includes(participantId)) throw new Error("Already in this team");
        const patch: Record<string, unknown> = {};
        if (!existing.name) patch.name = name;
        if (position) patch.position = position;
        if (Object.keys(patch).length > 0) await ctx.db.patch(participantId, patch);
      } else {
        participantId = await ctx.db.insert("participants", {
          email,
          name,
          position,
          role: "participant",
          preferredLanguage: "en",
          createdAt: now,
        });
      }
    } else {
      participantId = await ctx.db.insert("participants", {
        name,
        position,
        role: "participant",
        preferredLanguage: "en",
        createdAt: now,
      });
    }

    if (team.memberIds.includes(participantId)) throw new Error("Already in this team");
    await ctx.db.patch(args.teamId, {
      memberIds: [...team.memberIds, participantId],
      updatedAt: now,
    });

    // Keep their registration (if any) pointing at this team
    const reg = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", participantId))
      .first();
    if (reg) await ctx.db.patch(reg._id, { teamId: args.teamId, updatedAt: now });

    return { success: true, participantId };
  },
});

/** Edit a team member's name and/or position from the admin dashboard. */
export const updateTeamMember = mutation({
  args: {
    participantId: v.id("participants"),
    name: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const p = await ctx.db.get(args.participantId);
    if (!p) throw new Error("Participant not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      patch.name = name;
    }
    if (args.position !== undefined) patch.position = args.position.trim() || undefined;

    await ctx.db.patch(args.participantId, patch);
    return { success: true };
  },
});

export const addMemberToTeam = mutation({
  args: {
    teamId: v.id("teams"),
    participantId: v.id("participants"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");
    
    if (team.memberIds.includes(args.participantId)) {
      throw new Error("Participant already in team");
    }
    
    await ctx.db.patch(args.teamId, {
      memberIds: [...team.memberIds, args.participantId],
      updatedAt: Date.now(),
    });
    
    // Update registration
    const reg = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", args.participantId))
      .first();
    
    if (reg) {
      await ctx.db.patch(reg._id, { teamId: args.teamId, updatedAt: Date.now() });
    }
    
    return { success: true };
  },
});

export const removeMemberFromTeam = mutation({
  args: {
    teamId: v.id("teams"),
    participantId: v.id("participants"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");
    
    await ctx.db.patch(args.teamId, {
      memberIds: team.memberIds.filter((id) => id !== args.participantId),
      updatedAt: Date.now(),
    });
    
    // Update registration
    const reg = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", args.participantId))
      .first();
    
    if (reg) {
      await ctx.db.patch(reg._id, { teamId: undefined, updatedAt: Date.now() });
    }
    
    return { success: true };
  },
});

export const listTeams = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const teams = await ctx.db.query("teams").take(MAX_TEAMS_LISTED);
    const results = await Promise.all(
      teams.map(async (team) => {
        const members = await Promise.all(
          team.memberIds.map(async (pid) => {
            const p = await ctx.db.get(pid);
            return {
              id: pid,
              name: p?.name ?? "—",
              email: p?.email ?? "—",
              position: p?.position ?? null,
            };
          })
        );
        return { ...team, members };
      })
    );
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMyTeam = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) return null;

    // Find registration with teamId
    const reg = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", p._id))
      .first();

    let team = reg?.teamId ? await ctx.db.get(reg.teamId) : null;

    // Seeded/manual roster members may have no registration — fall back to membership
    if (!team) {
      const teams = await ctx.db.query("teams").take(MAX_TEAMS_LISTED);
      team = teams.find((t) => t.memberIds.includes(p._id)) ?? null;
    }
    if (!team) return null;

    const members = await Promise.all(
      team.memberIds.map(async (pid) => {
        const member = await ctx.db.get(pid);
        return {
          id: pid,
          name: member?.name ?? "—",
          email: member?.email ?? "—",
          position: member?.position ?? null,
        };
      })
    );

    return { ...team, members };
  },
});

export const listUnassignedParticipants = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get registrations without teamId (bounded — active registration window is small)
    const regs = await ctx.db.query("buildathonRegistrations")
      .filter((q) => q.eq(q.field("teamId"), undefined))
      .take(500);
    
    const results = await Promise.all(
      regs.map(async (reg) => {
        const p = await ctx.db.get(reg.participantId);
        return {
          registrationId: reg._id,
          participantId: reg.participantId,
          name: p?.name ?? reg.basicInfo.name,
          email: p?.email ?? reg.basicInfo.email,
        };
      })
    );
    
    return results;
  },
});
