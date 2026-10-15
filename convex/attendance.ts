import { v } from "convex/values";
import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { getParticipantByIdentity, requireAdmin } from "./helpers";
import {
  ATTENDANCE_SESSIONS,
  ATTENDANCE_THRESHOLD,
  CERTIFICATE_AVAILABLE_AT,
  attendanceScore,
  certificateState,
  CERTIFICATE_EXPIRES_AT,
} from "../lib/attendance";
import type { Doc, Id } from "./_generated/dataModel";

const status = v.union(
  v.literal("present"),
  v.literal("absent"),
  v.literal("pending"),
  v.literal("unrecorded"),
);
const importRow = v.object({
  participantId: v.string(),
  email: v.string(),
  sessionId: v.string(),
  status,
  note: v.string(),
  row: v.number(),
});
type ImportRow = {
  participantId: string;
  email: string;
  sessionId: string;
  status: "present" | "absent" | "pending" | "unrecorded";
  note: string;
  row: number;
};
export function isLocalAttendance() {
  try {
    return ["localhost", "127.0.0.1"].includes(
      new URL(process.env.CONVEX_SITE_URL ?? "").hostname,
    );
  } catch {
    return false;
  }
}
async function settings(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("attendanceSettings")
    .withIndex("by_key", (q) => q.eq("key", "buildathon-2026"))
    .unique();
}
async function current(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Please sign in.");
  const participant = await getParticipantByIdentity(ctx, identity);
  if (!participant) throw new Error("Participant profile not found.");
  return participant;
}
async function recordsFor(
  ctx: QueryCtx | MutationCtx,
  participantId: Id<"participants">,
) {
  return ctx.db
    .query("attendanceRecords")
    .withIndex("by_participantId_and_sessionId", (q) =>
      q.eq("participantId", participantId),
    )
    .collect();
}
async function roster(ctx: QueryCtx | MutationCtx) {
  const participants = await ctx.db
    .query("participants")
    .withIndex("by_role", (q) => q.eq("role", "participant"))
    .take(2001);
  if (participants.length > 2000)
    throw new Error(
      "This event roster exceeds the 2,000-participant limit. Contact the platform team.",
    );
  const teams = await ctx.db.query("teams").take(2000);
  const teamMap = new Map(
    teams.flatMap((t) =>
      t.memberIds.map(
        (id) => [id, t.name || t.code || "Unnamed team"] as const,
      ),
    ),
  );
  return Promise.all(
    participants.map(async (p) => {
      const records = await recordsFor(ctx, p._id);
      return {
        id: p._id,
        name:
          p.name ||
          [p.firstName, p.lastName].filter(Boolean).join(" ") ||
          "Participant",
        email: p.email || "",
        team: teamMap.get(p._id) || "Unassigned",
        records,
        score: attendanceScore(records),
      };
    }),
  );
}
function sessionOrThrow(id: string) {
  const session = ATTENDANCE_SESSIONS.find((s) => s.id === id);
  if (!session) throw new Error("Unknown attendance session.");
  if (!isLocalAttendance() && Date.now() < Date.parse(`${id}T00:00:00+06:30`))
    throw new Error(
      "Attendance can only be recorded once the session day begins.",
    );
  return session;
}
async function audit(
  ctx: MutationCtx,
  actor: Doc<"participants">,
  values: Omit<
    Doc<"attendanceAudit">,
    "_id" | "_creationTime" | "actorId" | "actorName" | "createdAt"
  >,
) {
  await ctx.db.insert("attendanceAudit", {
    ...values,
    actorId: actor._id,
    actorName: actor.name || "Portal admin",
    createdAt: Date.now(),
  });
}
async function invalidate(ctx: MutationCtx) {
  const config = await settings(ctx);
  if (config)
    await ctx.db.patch("attendanceSettings", config._id, {
      revision: config.revision + 1,
    });
  else
    await ctx.db.insert("attendanceSettings", {
      key: "buildathon-2026",
      revision: 1,
    });
}

export const adminOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [participants, config, recent] = await Promise.all([
      roster(ctx),
      settings(ctx),
      ctx.db
        .query("attendanceAudit")
        .withIndex("by_createdAt")
        .order("desc")
        .take(30),
    ]);
    return {
      participants,
      config,
      recent: recent.map((entry) => ({
        ...entry,
        participantName: participants.find((p) => p.id === entry.participantId)
          ?.name,
      })),
      local: isLocalAttendance(),
      now: Date.now(),
    };
  },
});

export const myProgress = query({
  args: {},
  handler: async (ctx) => {
    const participant = await current(ctx);
    const [records, config] = await Promise.all([
      recordsFor(ctx, participant._id),
      settings(ctx),
    ]);
    const score = attendanceScore(records);
    return {
      name: participant.name || "Participant",
      records: records.map((r) => ({
        sessionId: r.sessionId,
        status: r.status,
      })),
      score,
      state: certificateState(score, Date.now()),
      releasedAt: CERTIFICATE_AVAILABLE_AT,
      expiresAt: CERTIFICATE_EXPIRES_AT,
      demo: isLocalAttendance() && !!config?.demoEnabled,
      now: Date.now(),
    };
  },
});

export const publicProgress = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const search = args.search.trim().toLowerCase();
    if (search.length < 2 || search.length > 100) return [];
    const [participants, teams] = await Promise.all([
      ctx.db
        .query("participants")
        .withIndex("by_role", (q) => q.eq("role", "participant"))
        .take(2000),
      ctx.db.query("teams").take(2000),
    ]);
    const teamMap = new Map(
      teams.flatMap((team) =>
        team.memberIds.map(
          (id) => [id, team.name || team.code || "Unnamed team"] as const,
        ),
      ),
    );
    const matched = participants
      .map((p) => ({
        id: p._id,
        name:
          p.name ||
          [p.firstName, p.lastName].filter(Boolean).join(" ") ||
          "Participant",
        team: teamMap.get(p._id) || "Unassigned",
      }))
      .filter((p) => `${p.name} ${p.team}`.toLowerCase().includes(search))
      .slice(0, 50);
    return Promise.all(
      matched.map(async (person) => ({
        ...person,
        score: attendanceScore(await recordsFor(ctx, person.id)),
      })),
    );
  },
});

export const setRecord = mutation({
  args: {
    participantId: v.id("participants"),
    sessionId: v.string(),
    status,
    note: v.string(),
    expectedUpdatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    sessionOrThrow(args.sessionId);
    if (!args.note.trim() || args.note.length > 500)
      throw new Error("Add a correction reason (1–500 characters).");
    const participant = await ctx.db.get("participants", args.participantId);
    if (!participant || participant.role !== "participant")
      throw new Error("Participant not found.");
    const previous = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_participantId_and_sessionId", (q) =>
        q
          .eq("participantId", args.participantId)
          .eq("sessionId", args.sessionId),
      )
      .unique();
    if (previous?.updatedAt !== args.expectedUpdatedAt)
      throw new Error(
        "This record changed. Close the editor and try again with the latest version.",
      );
    if (previous?.status === args.status && previous.note === args.note.trim())
      return;
    const values = {
      participantId: args.participantId,
      sessionId: args.sessionId,
      status: args.status,
      note: args.note.trim(),
      updatedAt: Date.now(),
      updatedBy: actor._id,
    };
    if (previous) await ctx.db.patch("attendanceRecords", previous._id, values);
    else await ctx.db.insert("attendanceRecords", values);
    await audit(ctx, actor, {
      action: "Manual edit",
      participantId: args.participantId,
      sessionId: args.sessionId,
      before: previous?.status || "unrecorded",
      after: args.status,
      reason: args.note.trim(),
    });
    await invalidate(ctx);
  },
});

async function validateRows(
  ctx: QueryCtx | MutationCtx,
  rows: ImportRow[],
  sessionId: string,
) {
  sessionOrThrow(sessionId);
  if (rows.length === 0 || rows.length > 500)
    throw new Error("Import between 1 and 500 rows at a time.");
  const participants = await ctx.db
    .query("participants")
    .withIndex("by_role", (q) => q.eq("role", "participant"))
    .take(2001);
  const errors: string[] = [];
  const seen = new Set<string>();
  const resolved: {
    participantId: Id<"participants">;
    name: string;
    status: ImportRow["status"];
    note: string;
    before: ImportRow["status"];
    previousId?: Id<"attendanceRecords">;
  }[] = [];
  for (const row of rows) {
    const participant = row.participantId
      ? participants.find((p) => p._id === row.participantId)
      : participants.find(
          (p) => p.email?.toLowerCase() === row.email.toLowerCase(),
        );
    if (!participant) {
      errors.push(
        `Row ${row.row}: unknown participant ID or registered email.`,
      );
      continue;
    }
    if (
      row.participantId &&
      row.email &&
      participant.email?.toLowerCase() !== row.email.toLowerCase()
    ) {
      errors.push(`Row ${row.row}: email does not match the participant ID.`);
      continue;
    }
    if (row.sessionId !== sessionId) {
      errors.push(`Row ${row.row}: session date must be ${sessionId}.`);
      continue;
    }
    if (seen.has(participant._id)) {
      errors.push(`Row ${row.row}: duplicate participant for this session.`);
      continue;
    }
    seen.add(participant._id);
    if (row.note.length > 500) {
      errors.push(`Row ${row.row}: note exceeds 500 characters.`);
      continue;
    }
    const previous = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_participantId_and_sessionId", (q) =>
        q.eq("participantId", participant._id).eq("sessionId", sessionId),
      )
      .unique();
    resolved.push({
      participantId: participant._id,
      name: participant.name || "Participant",
      status: row.status,
      note: row.note,
      before: previous?.status || "unrecorded",
      previousId: previous?._id,
    });
  }
  return { errors, resolved };
}
export const previewImport = query({
  args: { rows: v.array(importRow), sessionId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await validateRows(ctx, args.rows, args.sessionId);
    const config = await settings(ctx);
    return {
      errors: result.errors,
      revision: config?.revision || 0,
      rows: result.resolved.map((row) => ({
        name: row.name,
        before: row.before,
        after: row.status,
      })),
    };
  },
});

export const importRecords = mutation({
  args: {
    rows: v.array(importRow),
    sessionId: v.string(),
    filename: v.string(),
    expectedRevision: v.number(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    if (args.filename.length > 200) throw new Error("Filename is too long.");
    if (((await settings(ctx))?.revision || 0) !== args.expectedRevision)
      throw new Error(
        "Attendance changed after the preview. Preview the file again before importing.",
      );
    const { errors, resolved } = await validateRows(
      ctx,
      args.rows,
      args.sessionId,
    );
    if (errors.length) throw new Error(errors.slice(0, 5).join("\n"));
    for (const row of resolved) {
      const values = {
        participantId: row.participantId,
        sessionId: args.sessionId,
        status: row.status,
        note: row.note,
        updatedAt: Date.now(),
        updatedBy: actor._id,
      };
      if (row.previousId)
        await ctx.db.patch("attendanceRecords", row.previousId, values);
      else await ctx.db.insert("attendanceRecords", values);
      await audit(ctx, actor, {
        action: "Excel import",
        participantId: row.participantId,
        sessionId: args.sessionId,
        before: row.before,
        after: row.status,
        reason: `${args.filename}${row.note ? `: ${row.note}` : ""}`,
      });
    }
    await invalidate(ctx);
    return { accepted: resolved.length };
  },
});

export const issueCertificate = mutation({
  args: { demo: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const participant = await current(ctx);
    const [records, config] = await Promise.all([
      recordsFor(ctx, participant._id),
      settings(ctx),
    ]);
    const score = attendanceScore(records);
    const demo = args.demo === true;
    if (demo && !(isLocalAttendance() && config?.demoEnabled))
      throw new Error(
        "Certificate demos are available only on the isolated local backend.",
      );
    if (score < ATTENDANCE_THRESHOLD)
      throw new Error("At least 75% verified attendance is required.");
    if (
      !demo &&
      certificateState(score, Date.now()) !== "available"
    )
      throw new Error(
        "Your certificate is not available for download yet, or the download period has expired.",
      );
    const name =
      participant.name?.trim() ||
      [participant.firstName, participant.lastName].filter(Boolean).join(" ");
    if (!name)
      throw new Error("Please ask the event team to add your full name first.");
    let issue = await ctx.db
      .query("certificateIssues")
      .withIndex("by_participantId_and_demo", (q) =>
        q.eq("participantId", participant._id).eq("demo", demo),
      )
      .unique();
    if (!issue) {
      const id = await ctx.db.insert("certificateIssues", {
        participantId: participant._id,
        name,
        demo,
        serial: `AIO-2026-${participant._id.slice(-10).toUpperCase()}${demo ? "-DEMO" : ""}`,
        issuedAt: Date.now(),
      });
      issue = await ctx.db.get("certificateIssues", id);
    }
    return {
      name,
      serial: issue!.serial,
      issuedAt: issue!.issuedAt,
      score,
      demo,
    };
  },
});
