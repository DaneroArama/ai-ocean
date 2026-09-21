/**
 * Teams — manage buildathon teams
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getParticipantByIdentity } from "./helpers";

export const createTeam = mutation({
  args: {
    name: v.string(),
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
