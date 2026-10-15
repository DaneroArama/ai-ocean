import { v } from "convex/values";
import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { requireAdmin } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";
import {
  EMAIL_PATTERN,
  ROSTER_MAX_ROWS,
  normalizeRosterEmail,
  type RosterRole,
} from "../lib/roster-workbook";

const MAX_MEMBERS_PER_TEAM = 50;

const rosterRow = v.object({
  email: v.string(),
  name: v.string(),
  role: v.union(v.literal("participant"), v.literal("admin")),
  team: v.string(),
  position: v.string(),
  row: v.number(),
});

type RosterRow = {
  email: string;
  name: string;
  role: RosterRole;
  team: string;
  position: string;
  row: number;
};

async function settings(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("rosterSettings")
    .withIndex("by_key", (q) => q.eq("key", "roster"))
    .unique();
}

async function bumpRevision(ctx: MutationCtx) {
  const config = await settings(ctx);
  if (config) await ctx.db.patch(config._id, { revision: config.revision + 1 });
  else await ctx.db.insert("rosterSettings", { key: "roster", revision: 1 });
}

async function allParticipants(ctx: QueryCtx | MutationCtx) {
  const roster = await ctx.db
    .query("participants")
    .withIndex("by_role", (q) => q.eq("role", "participant"))
    .take(2000);
  const admins = await ctx.db
    .query("participants")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .take(500);
  return [...roster, ...admins];
}

async function allTeams(ctx: QueryCtx | MutationCtx) {
  return await ctx.db.query("teams").take(2000);
}

type Resolved = {
  row: RosterRow;
  participant?: Doc<"participants">;
  team?: Doc<"teams">;
  teamAttach: boolean;
};

async function validateRows(ctx: QueryCtx | MutationCtx, rows: RosterRow[]) {
  if (rows.length === 0 || rows.length > ROSTER_MAX_ROWS)
    throw new Error(`Import between 1 and ${ROSTER_MAX_ROWS} rows at a time.`);
  const participants = await allParticipants(ctx);
  const teams = await allTeams(ctx);
  const errors: string[] = [];
  const seen = new Set<string>();
  const resolved: Resolved[] = [];
  for (const row of rows) {
    const email = normalizeRosterEmail(row.email);
    let failed = false;
    if (!EMAIL_PATTERN.test(email)) {
      errors.push(`Row ${row.row}: enter a valid email address.`);
      failed = true;
    }
    if (seen.has(email)) {
      errors.push(`Row ${row.row}: duplicate email ${email}.`);
      failed = true;
    }
    seen.add(email);
    const name = row.name.trim();
    if (!name) {
      errors.push(`Row ${row.row}: name is required.`);
      failed = true;
    }
    if (name.length > 200) {
      errors.push(`Row ${row.row}: name is too long.`);
      failed = true;
    }
    const role: RosterRole = row.role === "admin" ? "admin" : "participant";
    const position = row.position.trim();
    if (position.length > 200) {
      errors.push(`Row ${row.row}: position is too long.`);
      failed = true;
    }
    const participant = participants.find((p) => p.email === email);
    const teamName = row.team.trim();
    let team: Doc<"teams"> | undefined;
    let teamAttach = false;
    if (teamName) {
      if (teamName.length > 200) {
        errors.push(`Row ${row.row}: team name is too long.`);
        failed = true;
      }
      const needle = teamName.toLowerCase();
      team = teams.find(
        (t) => t.name?.toLowerCase() === needle || t.code?.toLowerCase() === needle,
      );
      if (!team) {
        errors.push(`Row ${row.row}: no team named "${teamName}".`);
        failed = true;
      } else if (!team.memberIds.includes(participant?._id as Id<"participants">)) {
        if (team.memberIds.length >= MAX_MEMBERS_PER_TEAM) {
          errors.push(`Row ${row.row}: team "${teamName}" is full.`);
          failed = true;
        } else {
          teamAttach = true;
        }
      }
    }
    if (failed) continue;
    resolved.push({ row: { ...row, email, name, role, position }, participant, team, teamAttach });
  }
  return { errors, resolved };
}

export const previewRosterImport = query({
  args: { rows: v.array(rosterRow) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { errors, resolved } = await validateRows(ctx, args.rows);
    const config = await settings(ctx);
    return {
      errors,
      revision: config?.revision ?? 0,
      entries: resolved.map((entry) => {
        const existing = entry.participant;
        const nameChanges = !!existing && (existing.name ?? "") !== entry.row.name;
        const roleChanges =
          !!existing && existing.role !== entry.row.role && entry.row.role === "admin";
        const teamChanges = entry.teamAttach;
        const before = !existing
          ? ("new" as const)
          : nameChanges || roleChanges || teamChanges
            ? ("update" as const)
            : ("unchanged" as const);
        return {
          email: entry.row.email,
          name: entry.row.name,
          role: entry.row.role,
          before,
          team: entry.team?.name ?? null,
          upgradesAdmin: roleChanges,
        };
      }),
    };
  },
});

export const importRoster = mutation({
  args: {
    rows: v.array(rosterRow),
    filename: v.string(),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    if (!args.filename.trim() || args.filename.length > 200)
      throw new Error("Provide a filename of up to 200 characters.");
    if (((await settings(ctx))?.revision ?? 0) !== args.expectedRevision)
      throw new Error(
        "The roster changed after the preview. Preview the file again before importing.",
      );
    const { errors, resolved } = await validateRows(ctx, args.rows);
    if (errors.length) throw new Error(errors.slice(0, 5).join("\n"));
    const now = Date.now();
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    let promoted = 0;
    let attached = 0;
    for (const entry of resolved) {
      const { row, participant, team, teamAttach } = entry;
      let participantId: Id<"participants">;
      if (!participant) {
        participantId = await ctx.db.insert("participants", {
          email: row.email,
          name: row.name,
          position: row.position || undefined,
          preferredLanguage: "en",
          role: row.role,
          createdAt: now,
        });
        created += 1;
      } else {
        participantId = participant._id;
        const patch: Partial<Doc<"participants">> = {};
        if ((participant.name ?? "") !== row.name) patch.name = row.name;
        if (row.position && participant.position !== row.position)
          patch.position = row.position;
        // Never downgrade an admin via import; only promote.
        if (row.role === "admin" && participant.role !== "admin") {
          patch.role = "admin";
          promoted += 1;
        }
        if (Object.keys(patch).length) {
          await ctx.db.patch(participantId, patch);
          updated += 1;
        } else {
          unchanged += 1;
        }
      }
      if (team && teamAttach) {
        await ctx.db.patch(team._id, {
          memberIds: [...team.memberIds, participantId],
          updatedAt: now,
        });
        attached += 1;
      }
    }
    await bumpRevision(ctx);
    await ctx.db.insert("attendanceAudit", {
      actorId: actor._id,
      actorName: actor.name || "Portal admin",
      action: "Roster import",
      reason: args.filename,
      after: `${created} created · ${updated} updated · ${unchanged} unchanged · ${promoted} promoted · ${attached} team attaches`,
      createdAt: now,
    });
    return { created, updated, unchanged, promoted, attached };
  },
});
