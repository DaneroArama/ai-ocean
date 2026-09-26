/**
 * Teams — manage buildathon teams
 */
import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { getParticipantByIdentity } from "./helpers";
import type { Id } from "./_generated/dataModel";

const MAX_AUTO_PLACEMENTS_PER_RUN = 300;

export const createTeam = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    
    await ctx.db.patch(args.teamId, patch);
    return { success: true };
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    // Remove team from all registrations
    const regs = await ctx.db.query("buildathonRegistrations")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
    
    for (const reg of regs) {
      await ctx.db.patch(reg._id, { teamId: undefined, updatedAt: Date.now() });
    }
    
    await ctx.db.delete(args.teamId);
    return { success: true };
  },
});

export const addMemberToTeam = mutation({
  args: {
    teamId: v.id("teams"),
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
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
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
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
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    const teams = await ctx.db.query("teams").collect();
    const results = await Promise.all(
      teams.map(async (team) => {
        const members = await Promise.all(
          team.memberIds.map(async (pid) => {
            const p = await ctx.db.get(pid);
            return { id: pid, name: p?.name ?? "—", email: p?.email ?? "—" };
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
    
    if (!reg?.teamId) return null;
    
    const team = await ctx.db.get(reg.teamId);
    if (!team) return null;
    
    const members = await Promise.all(
      team.memberIds.map(async (pid) => {
        const member = await ctx.db.get(pid);
        return { id: pid, name: member?.name ?? "—", email: member?.email ?? "—" };
      })
    );
    
    return { ...team, members };
  },
});

export const listUnassignedParticipants = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    // Get all registrations without teamId
    const regs = await ctx.db.query("buildathonRegistrations")
      .filter((q) => q.eq(q.field("teamId"), undefined))
      .collect();
    
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
