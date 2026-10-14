/**
 * Seed the teamPositions catalog (admin team-member dropdown).
 * Idempotent — matches by name; re-runs skip existing rows.
 *   npx convex run seedTeamPositions:seed
 *   npx convex run --prod seedTeamPositions:seed
 */
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

type SeedPosition = {
  name: string;
  abbrev?: string;
  category: "engineering" | "design" | "product" | "business" | "team";
  priority: number;
};

const SEED_POSITIONS: SeedPosition[] = [
  // Engineering
  { name: "Full Stack Developer", abbrev: "FSD", category: "engineering", priority: 1 },
  { name: "Frontend Developer", abbrev: "FE", category: "engineering", priority: 2 },
  { name: "Backend Developer", abbrev: "BE", category: "engineering", priority: 3 },
  { name: "AI/ML Engineer", abbrev: "AIML", category: "engineering", priority: 4 },
  { name: "DevOps Engineer", abbrev: "DEVOPS", category: "engineering", priority: 5 },
  { name: "QA/Tester", abbrev: "QA", category: "engineering", priority: 6 },

  // Design
  { name: "Product Designer", abbrev: "PD", category: "design", priority: 10 },
  { name: "UI Designer", abbrev: "UI", category: "design", priority: 11 },
  { name: "UX Designer", abbrev: "UX", category: "design", priority: 12 },
  { name: "UX Researcher", abbrev: "UXR", category: "design", priority: 13 },

  // Product
  { name: "Product Manager", abbrev: "PM", category: "product", priority: 20 },
  { name: "Product Owner", abbrev: "PO", category: "product", priority: 21 },

  // Business
  { name: "Business Analyst", abbrev: "BA", category: "business", priority: 30 },
  { name: "Business Owner", abbrev: "BO", category: "business", priority: 31 },
  { name: "Entrepreneur", abbrev: "ENT", category: "business", priority: 32 },
  { name: "Marketing", abbrev: "MKT", category: "business", priority: 33 },
  { name: "Content Strategist", abbrev: "CS", category: "business", priority: 34 },

  // Team
  { name: "Project Manager", abbrev: "PM", category: "team", priority: 40 },
];

export const seed = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    let created = 0;
    let skipped = 0;
    const now = Date.now();

    for (const p of SEED_POSITIONS) {
      const existing = await ctx.db
        .query("teamPositions")
        .withIndex("by_name", (q) => q.eq("name", p.name))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("teamPositions", {
        name: p.name,
        abbrev: p.abbrev,
        category: p.category,
        priority: p.priority,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped };
  },
});
