import { createAccount } from "@convex-dev/auth/server";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { ATTENDANCE_SESSIONS } from "../lib/attendance";
import { isLocalAttendance } from "./attendance";
function localOnly() {
  if (!isLocalAttendance())
    throw new Error(
      "Attendance demo seeds are restricted to the local backend.",
    );
}
const email = "demo.admin@example.com";
export const hasAdminAccount = internalQuery({
  args: {},
  handler: async (ctx) => {
    localOnly();
    return !!(await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "password"),
          q.eq(q.field("providerAccountId"), email),
        ),
      )
      .first());
  },
});
export const seed = internalAction({
  args: {},
  handler: async (ctx): Promise<{ participants: number; demo: boolean }> => {
    localOnly();
    if (!(await ctx.runQuery(internal.seedAttendanceDemo.hasAdminAccount, {})))
      await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: "OceanAdmin!2026" },
        profile: { email, name: "Demo Event Admin" },
      });
    return ctx.runMutation(internal.seedAttendanceDemo.seedData, {});
  },
});
export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    localOnly();
    const now = Date.now();
    const existingAdmin = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    const adminId =
      existingAdmin?._id ||
      (await ctx.db.insert("participants", {
        email,
        name: "Demo Event Admin",
        role: "admin",
        preferredLanguage: "en",
        createdAt: now,
      }));
    if (existingAdmin)
      await ctx.db.patch("participants", adminId, { role: "admin" });
    const demos = [
      {
        email: "demo.participant@example.com",
        name: "Demo Participant",
        days: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        email: "mira.demo@example.com",
        name: "Mira Thant",
        days: [0, 2, 3, 4, 5, 6, 7, 8],
      },
      { email: "theo.demo@example.com", name: "Theo Lin", days: [0, 1, 2, 3] },
      { email: "nora.demo@example.com", name: "Nora Win", days: [] },
    ];
    const memberIds = [];
    for (const demo of demos) {
      const existing = await ctx.db
        .query("participants")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .first();
      const id =
        existing?._id ||
        (await ctx.db.insert("participants", {
          email: demo.email,
          name: demo.name,
          role: "participant",
          preferredLanguage: "en",
          createdAt: now,
        }));
      memberIds.push(id);
      for (const [index, session] of ATTENDANCE_SESSIONS.entries()) {
        const record = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_participantId_and_sessionId", (q) =>
            q.eq("participantId", id).eq("sessionId", session.id),
          )
          .unique();
        // Preserve edits when the seed is rerun.
        if (!record)
          await ctx.db.insert("attendanceRecords", {
            participantId: id,
            sessionId: session.id,
            status: demo.days.includes(index)
              ? "present"
              : demo.days.length
                ? "absent"
                : "unrecorded",
            note: "Local demo sample attendance",
            updatedAt: now,
            updatedBy: adminId,
          });
      }
    }
    const team = await ctx.db
      .query("teams")
      .withIndex("by_code", (q) => q.eq("code", "DEMO01"))
      .first();
    if (team)
      await ctx.db.patch("teams", team._id, {
        memberIds: Array.from(new Set([...team.memberIds, ...memberIds])),
        updatedAt: now,
      });
    const config = await ctx.db
      .query("attendanceSettings")
      .withIndex("by_key", (q) => q.eq("key", "buildathon-2026"))
      .unique();
    if (config)
      await ctx.db.patch("attendanceSettings", config._id, {
        demoEnabled: true,
      });
    else
      await ctx.db.insert("attendanceSettings", {
        key: "buildathon-2026",
        revision: 1,
        demoEnabled: true,
      });
    return { participants: demos.length, demo: true };
  },
});
