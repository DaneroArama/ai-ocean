/**
 * Role Discovery Questions — hybrid engine, bilingual, shuffled options
 * New Feature §6-8: 20-30 casual scenario questions, scoringSignals hidden, shuffle identity-preserving
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { requireAdmin, shuffle } from "./helpers";

export const getRoleDiscoveryActiveQuestions = query({
  args: {
    version: v.optional(v.string()),
    phase: v.optional(v.union(v.literal("pre-event"), v.literal("main-event"))),
  },
  handler: async (ctx, args) => {
    const { version, phase } = args;
    let q;
    if (phase) {
      q = await ctx.db.query("roleDiscoveryQuestions").withIndex("by_phase", (b) => b.eq("phase", phase)).collect();
      if (version) q = q.filter((r) => r.version === version && r.isActive);
      else q = q.filter((r) => r.isActive);
    } else if (version) {
      q = await ctx.db.query("roleDiscoveryQuestions").withIndex("by_version_and_active", (b) => b.eq("version", version).eq("isActive", true)).collect();
    } else {
      q = await ctx.db.query("roleDiscoveryQuestions").withIndex("by_active", (b) => b.eq("isActive", true)).collect();
    }
    const sorted = q.sort((a, b) => a.order - b.order);
    return sorted.map((qq) => ({ ...qq, options: shuffle(qq.options) }));
  },
});

export const listRoleDiscoveryQuestions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("roleDiscoveryQuestions").withIndex("by_order", (q) => q.eq("order", 0)).collect().then(async (r) => {
      if (r.length === 0) return await ctx.db.query("roleDiscoveryQuestions").collect().then((a) => a.sort((x, y) => x.order - y.order));
      const all = await ctx.db.query("roleDiscoveryQuestions").collect();
      return all.sort((a, b) => a.order - b.order);
    });
  },
});

export const createRoleDiscoveryQuestion = mutation({
  args: {
    phase: v.union(v.literal("pre-event"), v.literal("main-event")),
    category: v.string(),
    type: v.union(
      v.literal("single"),
      v.literal("multiple"),
      v.literal("scenario"),
      v.literal("scale"),
      v.literal("longtext"),
      v.literal("yesno"),
      v.literal("single-with-text")
    ),
    textEn: v.string(), textMy: v.string(),
    options: v.array(v.object({ id: v.string(), labelEn: v.string(), labelMy: v.string() })),
    multiTextCount: v.optional(v.number()),
    multiTextPlaceholders: v.optional(v.array(v.string())),
    required: v.boolean(),
    scoringSignals: v.array(v.object({ optionId: v.string(), roleId: v.id("buildathonRoles"), weight: v.number() })),
    order: v.number(),
    version: v.string(),
    allowNotSure: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.textEn.trim() || !args.textMy.trim()) throw new Error("Bilingual text required");
    const now = Date.now();
    const id = await ctx.db.insert("roleDiscoveryQuestions", { ...args, isActive: true, createdAt: now, updatedAt: now });
    await ctx.db.insert("auditLog", { adminId: admin._id, action: "CREATE_ROLE_QUESTION", targetType: "roleDiscoveryQuestion", targetId: id, newValue: args, timestamp: now });
    return { questionId: id };
  },
});

export const updateRoleDiscoveryQuestion = mutation({
  args: {
    questionId: v.id("roleDiscoveryQuestions"),
    phase: v.optional(v.union(v.literal("pre-event"), v.literal("main-event"))),
    textEn: v.optional(v.string()), textMy: v.optional(v.string()),
    options: v.optional(v.array(v.object({ id: v.string(), labelEn: v.string(), labelMy: v.string() }))),
    multiTextCount: v.optional(v.number()),
    multiTextPlaceholders: v.optional(v.array(v.string())),
    scoringSignals: v.optional(v.array(v.object({ optionId: v.string(), roleId: v.id("buildathonRoles"), weight: v.number() }))),
    order: v.optional(v.number()), isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { questionId, ...rest } = args;
    const ex = await ctx.db.get(questionId);
    if (!ex) throw new Error("Not found");
    const patch: Partial<Doc<"roleDiscoveryQuestions">> = { updatedAt: Date.now() };
    if (rest.phase !== undefined) patch.phase = rest.phase;
    if (rest.textEn !== undefined) patch.textEn = rest.textEn;
    if (rest.textMy !== undefined) patch.textMy = rest.textMy;
    if (rest.options !== undefined) patch.options = rest.options;
    if (rest.multiTextCount !== undefined) patch.multiTextCount = rest.multiTextCount;
    if (rest.multiTextPlaceholders !== undefined) patch.multiTextPlaceholders = rest.multiTextPlaceholders;
    if (rest.scoringSignals !== undefined) patch.scoringSignals = rest.scoringSignals;
    if (rest.order !== undefined) patch.order = rest.order;
    if (rest.isActive !== undefined) patch.isActive = rest.isActive;
    await ctx.db.patch(questionId, patch);
    return { success: true };
  },
});

export const reorderRoleDiscoveryQuestions = mutation({
  args: { orders: v.array(v.object({ questionId: v.id("roleDiscoveryQuestions"), order: v.number() })) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const o of args.orders) await ctx.db.patch(o.questionId, { order: o.order, updatedAt: Date.now() });
    return { success: true };
  },
});
