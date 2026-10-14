/**
 * Seed the official buildathon roster from Teams.md into the database.
 * Run once per deployment (idempotent — re-runs skip existing rows):
 *   npx convex run seedTeams:seed
 *   npx convex run --prod seedTeams:seed
 *
 * internalMutation on purpose: bulk writes must not be publicly callable.
 * No auth identity exists on the CLI, so an admin-gated mutation would throw.
 */
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SeedMember = { name: string; email: string; position?: string };
type SeedTeam = { code: string; name: string; badge?: string; members: SeedMember[] };

const SEED_TEAMS: SeedTeam[] = [
  {
    code: "AI01",
    name: "OnErrorResumeNext",
    badge: "Recent",
    members: [
      { name: "Thuriya Ye Naing", email: "thuriyayenaing@uit.edu.mm", position: "Full Stack Developer" },
      { name: "Wint Khant Lin", email: "wintkhantlin@gmail.com", position: "Product Designer" },
      { name: "Shoon Lae Moe Oo", email: "shunlae279@gmail.com", position: "Product Owner" },
      { name: "Moe Thura Aung", email: "mtya809@gmail.com" },
    ],
  },
  {
    code: "AI02",
    name: "Aquaholics",
    members: [
      { name: "Kaung Set Thar", email: "kaungsetthar06@gmail.com", position: "Full Stack Developer" },
      { name: "Pan Myo Phyu", email: "panmyophyu66@gmail.com", position: "Business Analyst, Product Designer" },
      { name: "Aye Nandar Win", email: "ayenandarwin301@gmail.com", position: "Business Analyst, UI Designer, UX Designer" },
      { name: "Ye Htet Naing", email: "yetizo273@gmail.com", position: "Frontend Developer, Product Manager" },
      { name: "Aung Khant Min", email: "aungkhantmin020@gmail.com", position: "Backend Developer" },
      { name: "Thaw Thaw Tun", email: "thawtunthaw252@gmail.com", position: "UI Designer, UX Designer" },
    ],
  },
  {
    code: "AI03",
    name: "Zero_Lag",
    members: [
      { name: "Zaw Lwin Htoo", email: "zawlwinhtoo@uit.edu.mm", position: "Full Stack Developer" },
      { name: "Min Kyi Sin Thant", email: "minkyisinthant@uit.edu.mm" },
      { name: "Yan Lin Naing", email: "yanlinnaing@uit.edu.mm" },
      { name: "Kyaw Bhone Htet", email: "kyawphonehtet@uit.edu.mm" },
      { name: "Bhone Myat Htut", email: "bhonemyathtut@uit.edu.mm" },
      { name: "Zin Min Htet", email: "zinminhtet_b10@uit.edu.mm" },
      { name: "Min Thant Tun", email: "minthanttun.mm@gmail.com" },
    ],
  },
  {
    code: "AI04",
    name: "CoralCode",
    members: [
      { name: "Thiri Thu", email: "thirithu261@gmail.com", position: "UX Designer" },
      { name: "Htet Shoon Lae Aung", email: "htetshoongrace@gmail.com", position: "Business Analyst" },
      { name: "Htet Yadanar Myo", email: "hydnmyo@gmail.com", position: "Product Manager" },
      { name: "Myat Phone Swe Han", email: "myatphoneswehan@gmail.com", position: "Business Analyst" },
      { name: "Phyo Khant Kywal", email: "phyokhantkywal@uit.edu.mm", position: "Full Stack Developer" },
    ],
  },
  {
    code: "AI05",
    name: "404",
    members: [
      { name: "Ant Maw Htut Khaung", email: "anntmawhtutkhaung@gmail.com", position: "Business Analyst" },
      { name: "Aung Thu Hein", email: "aungthuhein.ath05@gmail.com", position: "Full Stack Developer" },
      { name: "Aye Sandi Myint", email: "ayesandi123464@gmail.com", position: "UX Designer, Frontend Developer" },
      { name: "TOE HTET ARKAR", email: "toehtet.a68@rsu.ac.th", position: "Product Owner" },
      { name: "May Thet Htar Aung", email: "htar2593@gmail.com", position: "UX Designer" },
    ],
  },
  {
    code: "AI06",
    name: "F.O.M",
    members: [
      { name: "Hlaing Myint Myat", email: "hlaingmyintmyat@gmail.com", position: "Product Designer" },
      { name: "Thurein Hein", email: "mgthureinhein123@gmail.com", position: "Business Owner" },
      { name: "Nyein Zaw Lin", email: "nzaw39165@gmail.com", position: "Full Stack Developer" },
      { name: "P Sai Naung", email: "psainaung2009@gmail.com", position: "Project Manager" },
      { name: "Lin Khant Tun", email: "linzwe90@gmail.com", position: "Business Analyst" },
      { name: "Aung Kyaw Zaw Maung", email: "akzm3001@gmail.com", position: "UX Designer" },
    ],
  },
  {
    code: "AI07",
    name: "Four Hook",
    members: [
      { name: "Myat Hmue Hay Thi", email: "myathmwe888@gmail.com", position: "Product Owner, Entrepreneur" },
      { name: "Yoon Yati Linn", email: "yoon.yati.linn.2020.2021.fb@gmail.com", position: "Full Stack Developer" },
      { name: "Myint Mo Phoo", email: "mophuu33@gmail.com", position: "UX Designer" },
      { name: "Kyawt Swe Zin Thwin", email: "kyawtswezinthwin@gmail.com", position: "Project Manager" },
    ],
  },
  {
    code: "AI08",
    name: "Innov8",
    members: [
      { name: "Htoo Myat Min Eain", email: "htoomyatmin461@gmail.com", position: "Project Manager" },
      { name: "Pwint Wai Wai Tha", email: "pwintwaiwaitha@gmail.com", position: "Full Stack Developer" },
      { name: "Aye Chan Pyae Mon", email: "ayechanpyaemon3@gmail.com", position: "Backend Developer" },
      { name: "Han Nilar Tun", email: "thinei181125@gmail.com", position: "UI Designer, UX Designer" },
      { name: "Eaindra Kyaw Myat", email: "eaindrakyawmyat14@gmail.com", position: "Frontend Developer" },
      { name: "Phyu Thwe Khin", email: "zakarizhai562@gmail.com", position: "Product Designer" },
      { name: "Myint Myint Aye", email: "myintmyinta409@gmail.com", position: "Frontend Developer" },
      { name: "Yoon Lei Htike", email: "yoonleihtike712@gmail.com", position: "QA/Tester" },
    ],
  },
  {
    code: "AI09",
    name: "7Vyte",
    members: [
      { name: "May Yadanar Yin Soe", email: "mayjewel567@gmail.com", position: "Backend Developer" },
      { name: "Aye Kyawt Kyawt Hmue", email: "akyawt99@gmail.com", position: "UI Designer, Frontend Developer" },
      { name: "Moe Stheinkha", email: "moetheinkha@uit.edu.mm", position: "Business Analyst" },
      { name: "Kaung Htet Thar", email: "khthar@uit.edu.mm", position: "Full Stack Developer" },
      { name: "May Myat Noe Latt", email: "moonmia207@gmail.com", position: "Full Stack Developer" },
      { name: "Hsu Myat Shein", email: "hsumyatshein277@gmail.com", position: "Project Manager" },
      { name: "Yin Min Htike", email: "yinminhtike1116@gmail.com", position: "Business Analyst" },
    ],
  },
  {
    code: "AI10",
    name: "Sirens & Knights",
    members: [
      { name: "Kay Thari", email: "kaythari20102004@gmail.com" },
      { name: "Ye Htut", email: "yhtut7795@gmail.com" },
      { name: "Htet Aung Myin", email: "htetaungmyin16@gmail.com" },
      { name: "Linn Latt Eain", email: "linnlatteain04@gmail.com" },
      { name: "Chan Myae May", email: "chanm9088@gmail.com" },
      { name: "Wint Kyi Phyu Kyaw", email: "wintkyiphyukyaw@gmail.com" },
      { name: "Kyal Sin Su San", email: "kyalsinsusan348@gmail.com" },
    ],
  },
  {
    code: "AI11",
    name: "AquaMind",
    members: [
      { name: "Thaw Linn Htet", email: "thawlinnhtet52@gmail.com" },
      { name: "Kaung Htike San", email: "kaunghtikes726@gmail.com" },
      { name: "Kyaw Zin Hein", email: "kyawzinhein@uit.edu.mm" },
      { name: "Aung Kaung Myat", email: "aungkaungmyat@uit.edu.mm" },
      { name: "Myat Min Khant", email: "myatminkhant@uit.edu.mm" },
      { name: "Hsu Myat Noe Thant", email: "hmnthant@uit.edu.mm" },
      { name: "Thant Kyi Phyu Nwe", email: "thantkyiphyunwe@uit.edu.mm" },
    ],
  },
];

async function resolveCreator(ctx: MutationCtx): Promise<Id<"participants">> {
  const admin = await ctx.db
    .query("participants")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .first();
  if (admin) return admin._id;
  const any = await ctx.db.query("participants").take(1);
  if (any[0]) return any[0]._id;
  // No participants at all — insert a minimal owner row so teams can exist
  return await ctx.db.insert("participants", {
    name: "Buildathon",
    role: "admin",
    preferredLanguage: "en",
    createdAt: Date.now(),
  });
}

async function upsertMember(
  ctx: MutationCtx,
  member: SeedMember
): Promise<{ participantId: Id<"participants">; created: boolean }> {
  const email = member.email.trim().toLowerCase();
  const existing = await ctx.db
    .query("participants")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();

  if (existing) {
    // Never clobber admin edits — only fill blanks
    const patch: Record<string, unknown> = {};
    if (!existing.name) patch.name = member.name;
    if (!existing.position && member.position) patch.position = member.position;
    if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch);
    return { participantId: existing._id, created: false };
  }

  const participantId = await ctx.db.insert("participants", {
    email,
    name: member.name,
    position: member.position,
    role: "participant",
    preferredLanguage: "en",
    createdAt: Date.now(),
  });
  return { participantId, created: true };
}

async function ensureTeam(
  ctx: MutationCtx,
  team: SeedTeam,
  createdBy: Id<"participants">
): Promise<{ teamId: Id<"teams">; created: boolean }> {
  const existing = await ctx.db
    .query("teams")
    .withIndex("by_code", (q) => q.eq("code", team.code))
    .first();

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.name) patch.name = team.name;
    if (!existing.badge && team.badge) patch.badge = team.badge;
    if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch);
    return { teamId: existing._id, created: false };
  }

  const teamId = await ctx.db.insert("teams", {
    code: team.code,
    name: team.name,
    badge: team.badge,
    memberIds: [],
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return { teamId, created: true };
}

export const seed = internalMutation({
  args: {},
  returns: v.object({
    teamsCreated: v.number(),
    teamsExisting: v.number(),
    membersCreated: v.number(),
    membersExisting: v.number(),
    memberLinksAdded: v.number(),
  }),
  handler: async (ctx) => {
    const createdBy = await resolveCreator(ctx);

    let teamsCreated = 0;
    let teamsExisting = 0;
    let membersCreated = 0;
    let membersExisting = 0;
    let memberLinksAdded = 0;

    for (const team of SEED_TEAMS) {
      const { teamId, created } = await ensureTeam(ctx, team, createdBy);
      if (created) teamsCreated++;
      else teamsExisting++;

      const doc = await ctx.db.get(teamId);
      const memberIds = [...(doc?.memberIds ?? [])];

      for (const member of team.members) {
        const { participantId, created: memberCreated } = await upsertMember(ctx, member);
        if (memberCreated) membersCreated++;
        else membersExisting++;

        if (!memberIds.includes(participantId)) {
          memberIds.push(participantId);
          memberLinksAdded++;
        }

        // Link their registration to this team only if it isn't already assigned
        const reg = await ctx.db
          .query("buildathonRegistrations")
          .withIndex("by_participant", (q) => q.eq("participantId", participantId))
          .first();
        if (reg && reg.teamId === undefined) {
          await ctx.db.patch(reg._id, { teamId, updatedAt: Date.now() });
        }
      }

      await ctx.db.patch(teamId, { memberIds, updatedAt: Date.now() });
    }

    return {
      teamsCreated,
      teamsExisting,
      membersCreated,
      membersExisting,
      memberLinksAdded,
    };
  },
});
