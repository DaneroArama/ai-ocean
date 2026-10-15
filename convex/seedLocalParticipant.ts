/** Local-only demo participant. Run with `npx convex run seedLocalParticipant:seed`. */
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const email = "demo.participant@example.com";

function requireLocal() {
  const url = new URL(process.env.CONVEX_SITE_URL ?? "https://invalid");
  if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Demo seeding is restricted to a local Convex backend.");
  }
}

export const seed = internalAction({
  args: {},
  handler: async (ctx): Promise<{ email: string; team: string }> => {
    requireLocal();
    const account = { id: email, secret: "OceanDemo!2026" };
    const existing: boolean = await ctx.runQuery(internal.seedLocalParticipant.hasAccount, {});
    if (!existing) {
      await createAccount(ctx, {
        provider: "password",
        account,
        profile: { email, name: "Demo Participant" },
      });
    } else {
      await retrieveAccount(ctx, { provider: "password", account });
    }
    return await ctx.runMutation(internal.seedLocalParticipant.seedTeam, {});
  },
});

export const hasAccount = internalQuery({
  args: {},
  handler: async (ctx) => {
    requireLocal();
    return !!await ctx.db.query("authAccounts").filter(q => q.and(
      q.eq(q.field("provider"), "password"), q.eq(q.field("providerAccountId"), email),
    )).first();
  },
});

export const seedTeam = internalMutation({
  args: {},
  handler: async (ctx) => {
    requireLocal();
    const now = Date.now();
    const existing = await ctx.db.query("participants")
      .withIndex("by_email", q => q.eq("email", email)).first();
    const participantId = existing?._id ?? await ctx.db.insert("participants", {
      email, name: "Demo Participant", position: "Frontend Developer",
      preferredLanguage: "en", role: "participant", createdAt: now,
    });
    const team = await ctx.db.query("teams")
      .withIndex("by_code", q => q.eq("code", "DEMO01")).first();
    const teamId = team?._id ?? await ctx.db.insert("teams", {
      name: "Ocean Explorers", code: "DEMO01", description: "Local demo team",
      track: "online", memberIds: [participantId], createdBy: participantId,
      createdAt: now, updatedAt: now,
    });
    if (team && !team.memberIds.includes(participantId)) {
      await ctx.db.patch("teams", teamId, {
        memberIds: [...team.memberIds, participantId], updatedAt: now,
      });
    }
    const registration = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", q => q.eq("participantId", participantId)).first();
    if (!registration) {
      await ctx.db.insert("buildathonRegistrations", {
        participantId, teamId, state: "submitted",
        basicInfo: { name: "Demo Participant", email, phone: "09000000000" },
        roleInfo: { positionCategory: "development", subRole: "Frontend Developer", experienceYears: "1_to_3" },
        eventPreferences: { preferredTrack: "online", bringLaptop: true, attendanceCommitment: true },
        createdAt: now, updatedAt: now,
      });
    } else {
      await ctx.db.patch("buildathonRegistrations", registration._id, { teamId, updatedAt: now });
    }
    return { email, team: "Ocean Explorers" };
  },
});
