/**
 * Seed project submissions onto the buildathon teams.
 *
 * Source: data/teamProjects.ts (edited from AI_OCEAN_Submissions_2026-10-30.xlsx).
 * Teams are matched by roster code, with a team-name fallback for rows that
 * have no code set yet. Existing names/members are never touched.
 *
 * Run per deployment (idempotent — re-runs only patch changed rows):
 *   npx convex run seedTeamProjects:seed
 *   npx convex run --prod seedTeamProjects:seed
 *
 * Note: this writes the canonical submission text from the data file, so it
 * overwrites later admin edits to a team's project name/description.
 *
 * internalMutation on purpose: bulk writes must not be publicly callable.
 */
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "./_generated/server";
import { TEAM_PROJECTS } from "../data/teamProjects";

const MAX_TEAMS_SCANNED = 200;

async function findTeam(
  ctx: MutationCtx,
  project: (typeof TEAM_PROJECTS)[number],
) {
  const byCode = await ctx.db
    .query("teams")
    .withIndex("by_code", (q) => q.eq("code", project.code))
    .first();
  if (byCode) return byCode;

  const teams = await ctx.db.query("teams").take(MAX_TEAMS_SCANNED);
  const name = project.teamName.trim().toLowerCase();
  return teams.find((team) => team.name?.trim().toLowerCase() === name) ?? null;
}

export const seed = internalMutation({
  args: {},
  returns: v.object({
    updated: v.number(),
    unchanged: v.number(),
    missing: v.array(v.string()),
  }),
  handler: async (ctx) => {
    let updated = 0;
    let unchanged = 0;
    const missing: string[] = [];
    const now = Date.now();

    for (const project of TEAM_PROJECTS) {
      const team = await findTeam(ctx, project);
      if (!team) {
        missing.push(`${project.code} — ${project.teamName}`);
        continue;
      }

      const projectName = project.projectName.trim();
      const projectDescription = project.description.trim() || undefined;

      if (
        team.projectName === projectName &&
        (team.projectDescription ?? undefined) === projectDescription
      ) {
        unchanged++;
        continue;
      }

      await ctx.db.patch(team._id, {
        projectName,
        projectDescription,
        updatedAt: now,
      });
      updated++;
    }

    return { updated, unchanged, missing };
  },
});
