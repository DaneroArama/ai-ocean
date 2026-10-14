/**
 * Team Positions — lightweight catalog powering the admin team-member dropdown.
 * Separate from buildathonRoles (which powers the role-discovery assessment).
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./helpers";

const MAX_POSITIONS = 100;

export const CATEGORY = v.union(
  v.literal("engineering"),
  v.literal("design"),
  v.literal("product"),
  v.literal("business"),
  v.literal("team")
);

/** Admin list — all positions, ordered by priority. */
export const listPositions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teamPositions"),
      name: v.string(),
      abbrev: v.union(v.string(), v.null()),
      category: CATEGORY,
      priority: v.number(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const positions = await ctx.db.query("teamPositions").take(MAX_POSITIONS);
    return positions
      .map((p) => ({
        _id: p._id,
        name: p.name,
        abbrev: p.abbrev ?? null,
        category: p.category,
        priority: p.priority,
        isActive: p.isActive,
      }))
      .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  },
});

/** Public active list — unauthenticated, for the team modal pill abbrevs. */
export const listActivePositions = query({
  args: {},
  returns: v.array(
    v.object({
      name: v.string(),
      abbrev: v.union(v.string(), v.null()),
      category: CATEGORY,
    })
  ),
  handler: async (ctx) => {
    const positions = await ctx.db
      .query("teamPositions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(MAX_POSITIONS);
    return positions.map((p) => ({
      name: p.name,
      abbrev: p.abbrev ?? null,
      category: p.category,
    }));
  },
});

export const createPosition = mutation({
  args: {
    name: v.string(),
    abbrev: v.optional(v.string()),
    category: CATEGORY,
    priority: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.object({ positionId: v.id("teamPositions") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");

    const existing = await ctx.db
      .query("teamPositions")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    if (existing) throw new Error(`Position "${name}" already exists`);

    const now = Date.now();
    const positionId = await ctx.db.insert("teamPositions", {
      name,
      abbrev: args.abbrev?.trim() || undefined,
      category: args.category,
      priority: args.priority ?? 99,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return { positionId };
  },
});

export const updatePosition = mutation({
  args: {
    positionId: v.id("teamPositions"),
    name: v.optional(v.string()),
    abbrev: v.optional(v.string()),
    category: v.optional(CATEGORY),
    priority: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { positionId, ...rest } = args;
    const existing = await ctx.db.get(positionId);
    if (!existing) throw new Error("Position not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (rest.name !== undefined) {
      const name = rest.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      updates.name = name;
    }
    if (rest.abbrev !== undefined) updates.abbrev = rest.abbrev.trim() || undefined;
    if (rest.category !== undefined) updates.category = rest.category;
    if (rest.priority !== undefined) updates.priority = rest.priority;
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;

    await ctx.db.patch(positionId, updates);
    return { success: true };
  },
});

export const deletePosition = mutation({
  args: { positionId: v.id("teamPositions") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.positionId);
    if (!existing) throw new Error("Position not found");
    await ctx.db.delete(args.positionId);
    return { success: true };
  },
});
