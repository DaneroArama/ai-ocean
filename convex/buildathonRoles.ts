/**
 * Buildathon Roles — CRUD for extensible role ecosystem
 * New Feature §9: Product/Design/Engineering/Data/Business/Team extensible
 */
import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const p = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", identity.email ?? "")).first();
  if (!p || p.role !== "admin") throw new Error("Admin required");
  return p;
}

export const listRoles = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.activeOnly) return await ctx.db.query("buildathonRoles").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    return await ctx.db.query("buildathonRoles").collect();
  },
});

export const getRoleById = query({
  args: { roleId: v.id("buildathonRoles") },
  handler: async (ctx, args) => await ctx.db.get(args.roleId),
});

export const createRole = mutation({
  args: {
    nameEn: v.string(), nameMy: v.string(),
    descriptionEn: v.string(), descriptionMy: v.string(),
    category: v.union(v.literal("product"), v.literal("design"), v.literal("engineering"), v.literal("data"), v.literal("business"), v.literal("team")),
    traitsEn: v.array(v.string()), traitsMy: v.array(v.string()),
    priority: v.number(), isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("buildathonRoles", { ...args, createdAt: now, updatedAt: now });
    await ctx.db.insert("auditLog", { adminId: admin._id, action: "CREATE_BUILDATHON_ROLE", targetType: "buildathonRole", targetId: id, newValue: args, timestamp: now });
    return { roleId: id };
  },
});

export const updateRole = mutation({
  args: {
    roleId: v.id("buildathonRoles"),
    nameEn: v.optional(v.string()), nameMy: v.optional(v.string()),
    descriptionEn: v.optional(v.string()), descriptionMy: v.optional(v.string()),
    traitsEn: v.optional(v.array(v.string())), traitsMy: v.optional(v.array(v.string())),
    priority: v.optional(v.number()), isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { roleId, ...rest } = args;
    const ex = await ctx.db.get(roleId);
    if (!ex) throw new Error("Role not found");
    const updates: Partial<Doc<"buildathonRoles">> = { updatedAt: Date.now() };
    if (rest.nameEn !== undefined) updates.nameEn = rest.nameEn;
    if (rest.nameMy !== undefined) updates.nameMy = rest.nameMy;
    if (rest.descriptionEn !== undefined) updates.descriptionEn = rest.descriptionEn;
    if (rest.descriptionMy !== undefined) updates.descriptionMy = rest.descriptionMy;
    if (rest.traitsEn !== undefined) updates.traitsEn = rest.traitsEn;
    if (rest.traitsMy !== undefined) updates.traitsMy = rest.traitsMy;
    if (rest.priority !== undefined) updates.priority = rest.priority;
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    await ctx.db.patch(roleId, updates);
    return { success: true };
  },
});
