/**
 * Admin helpers — live stats for dashboard
 * All queries require admin role (checked via participants.isAdmin)
 */
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getParticipantByIdentity } from "./helpers";

async function assertAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const p = await getParticipantByIdentity(ctx, identity);
  if (!p || p.role !== "admin") throw new Error("Admin required");
  return p;
}

export const listParticipants = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const all = await ctx.db.query("participants").collect();
    const lim = args.limit ?? 100;
    return all.slice(0, lim);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    const participants = await ctx.db.query("participants").collect();
    const regs = await ctx.db.query("registrations").collect();
    const bRegs = await ctx.db.query("buildathonRegistrations").collect();
    const roles = await ctx.db.query("buildathonRoles").collect();
    const qs = await ctx.db.query("roleDiscoveryQuestions").collect();
    return {
      participants: participants.length,
      registrations: regs.length,
      buildathonRegistrations: bRegs.length,
      roles: roles.length,
      questions: qs.length,
    };
  },
});
