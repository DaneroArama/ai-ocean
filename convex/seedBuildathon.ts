import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

interface SeedRole {
  nameEn: string;
  nameMy: string;
  descriptionEn: string;
  descriptionMy: string;
  category: "product" | "design" | "engineering" | "data" | "business" | "team";
  traitsEn: string[];
  traitsMy: string[];
  priority: number;
}

interface SeedScoring {
  optionId: string;
  role: string;
  w: number;
}

interface SeedQuestion {
  phase: "pre-event" | "main-event";
  category: string;
  type: "single" | "multiple" | "scenario" | "scale" | "longtext" | "yesno" | "single-with-text";
  order: number;
  textEn: string;
  textMy: string;
  options: { id: string; labelEn: string; labelMy: string }[];
  scoring: SeedScoring[];
  multiTextCount?: number;
  multiTextPlaceholders?: string[];
}

// Seed Buildathon roles + 6 sample casual scenario questions (v1) — extend to 20-30 via admin UI
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");

    const existingRoles = await ctx.db.query("buildathonRoles").collect();
    if (existingRoles.length > 0) {
      return { skipped: true, reason: "roles already seeded", count: existingRoles.length };
    }

    const now = Date.now();
    const rolesToCreate: SeedRole[] = [
      { nameEn: "Product Manager", nameMy: "ထုတ်ကုန်မန်နေဂျာ", descriptionEn: "Connects ideas, users and team to decide what to build.", descriptionMy: "အိုင်ဒီယာနှင့် အသုံးပြုသူများကို ချိတ်ဆက်သည်။", category: "product", traitsEn: ["Curious","Decisive"], traitsMy: ["စူးစမ်းလိုစိတ်","ဆုံးဖြတ်နိုင်မှု"], priority: 1 },
      { nameEn: "UX Researcher", nameMy: "UX သုတေသီ", descriptionEn: "Loves understanding problems and talking to users.", descriptionMy: "ပြဿနာများကို နားလည်လိုသည်။", category: "design", traitsEn: ["Empathetic","Analytical"], traitsMy: ["စာနာတတ်","ခွဲခြမ်းစိတ်ဖြာ"], priority: 2 },
      { nameEn: "Product Designer", nameMy: "ထုတ်ကုန်ဒီဇိုင်နာ", descriptionEn: "Turns ideas into tangible flows and visuals.", descriptionMy: "အိုင်ဒီယာကို ပုံဖော်သည်။", category: "design", traitsEn: ["Visual","Systematic"], traitsMy: ["အမြင်ဆိုင်ရာ"], priority: 3 },
      { nameEn: "Frontend Developer", nameMy: "Frontend Developer", descriptionEn: "Builds what users see and touch.", descriptionMy: "အသုံးပြုသူမြင်ရသည့်အပိုင်းကို တည်ဆောက်သည်။", category: "engineering", traitsEn: ["Crafty","Detail-oriented"], traitsMy: [], priority: 4 },
      { nameEn: "Backend Developer", nameMy: "Backend Developer", descriptionEn: "Builds the engine behind the product.", descriptionMy: "နောက်ကွယ်စနစ်ကို တည်ဆောက်သည်။", category: "engineering", traitsEn: ["Logical"], traitsMy: [], priority: 5 },
      { nameEn: "AI/ML Engineer", nameMy: "AI အင်ဂျင်နီယာ", descriptionEn: "Makes the product smart.", descriptionMy: "ထုတ်ကုန်ကို စမတ်ကျစေသည်။", category: "data", traitsEn: ["Curious","Math"], traitsMy: [], priority: 6 },
      { nameEn: "Data Analyst", nameMy: "Data Analyst", descriptionEn: "Finds stories in numbers.", descriptionMy: "ကိန်းဂဏန်းများမှ ဇာတ်လမ်းရှာသည်။", category: "data", traitsEn: ["Analytical"], traitsMy: [], priority: 7 },
      { nameEn: "Project Manager", nameMy: "စီမံကိန်းမန်နေဂျာ", descriptionEn: "Keeps the team in sync and moving.", descriptionMy: "အသင်းကို ညှိနှိုင်းသည်။", category: "team", traitsEn: ["Organized"], traitsMy: [], priority: 8 },
      { nameEn: "Marketing", nameMy: "ဈေးကွက်ရှာဖွေရေး", descriptionEn: "Tells the story and grows the audience.", descriptionMy: "ဇာတ်လမ်းကို ပြောပြသည်။", category: "business", traitsEn: ["Communicative"], traitsMy: [], priority: 9 },
      { nameEn: "Content Strategist", nameMy: "Content Strategist", descriptionEn: "Shapes message and tone.", descriptionMy: "မက်ဆေ့ချ်ကို ပုံဖော်သည်။", category: "business", traitsEn: [], traitsMy: [], priority: 10 },
      { nameEn: "UI Designer", nameMy: "UI Designer", descriptionEn: "Crafts beautiful interfaces.", descriptionMy: "လှပသော မျက်နှာပြင်များ ဖန်တီးသည်။", category: "design", traitsEn: [], traitsMy: [], priority: 11 },
      { nameEn: "DevOps Engineer", nameMy: "DevOps", descriptionEn: "Keeps the build running smoothly.", descriptionMy: "စနစ်လည်ပတ်မှုကို ထိန်းသိမ်းသည်။", category: "engineering", traitsEn: [], traitsMy: [], priority: 12 },
    ];

    const roleIds: Record<string, Id<"buildathonRoles">> = {};
    for (const r of rolesToCreate) {
      const id = await ctx.db.insert("buildathonRoles", {
        nameEn: r.nameEn, nameMy: r.nameMy, descriptionEn: r.descriptionEn, descriptionMy: r.descriptionMy,
        category: r.category, traitsEn: r.traitsEn, traitsMy: r.traitsMy, priority: r.priority, isActive: true, createdAt: now, updatedAt: now,
      });
      roleIds[r.nameEn] = id;
    }

    const sampleQs: SeedQuestion[] = [
      // ── Pre-Event Questions ──
      {
        phase: "pre-event", category: "background", type: "yesno", order: 0,
        textEn: "Have you participated in a buildathon or hackathon before?",
        textMy: "Buildathon သို့မဟုတ် Hackathon တွင် ပါဝင်ဖူးပါသလား။",
        options: [], scoring: [],
      },
      {
        phase: "pre-event", category: "background", type: "single-with-text", order: 1,
        textEn: "What is your current experience level?",
        textMy: "သင့်အတွေ့အကြုံ အဆင့် ဘာလဲ။",
        options: [
          { id: "A", labelEn: "Beginner", labelMy: "အစပြု" },
          { id: "B", labelEn: "Intermediate", labelMy: "အလယ်အလတ်" },
          { id: "C", labelEn: "Advanced", labelMy: "အဆင့်မြင့်" },
        ],
        scoring: [],
      },
      {
        phase: "pre-event", category: "interests", type: "multiple", order: 2,
        textEn: "What topics are you most interested in? (type up to 4)",
        textMy: "ဘယ်ခေါင်းစဉ်တွေကို စိတ်ဝင်စားပါသလဲ။",
        options: [], scoring: [],
        multiTextCount: 4, multiTextPlaceholders: ["Interest 1", "Interest 2", "Interest 3", "Interest 4"],
      },
      {
        phase: "pre-event", category: "expectations", type: "longtext", order: 3,
        textEn: "What are you hoping to learn or achieve at this buildathon?",
        textMy: "ဒီ buildathon မှာ ဘာသင်ယူချင် သို့မဟုတ် ဘာအောင်မြင်ချင်ပါသလဲ။",
        options: [], scoring: [],
      },
      {
        phase: "pre-event", category: "expectations", type: "single", order: 4,
        textEn: "How did you hear about this event?",
        textMy: "ဒီပွဲကို ဘယ်လို သိရှိတာလဲ။",
        options: [
          { id: "A", labelEn: "Social media", labelMy: "လူမှုကွန်ရက်" },
          { id: "B", labelEn: "Friend / colleague", labelMy: "မိတ်ဆွေ" },
          { id: "C", labelEn: "University / school", labelMy: "ကျောင်း" },
          { id: "D", labelEn: "Other", labelMy: "အခြား" },
        ],
        scoring: [],
      },
      // ── Main-Event Questions ──
      {
        phase: "main-event", category: "collaboration", type: "scenario", order: 0,
        textEn: "Your team has three different ideas but only enough time to build one. What would you naturally want to do?",
        textMy: "အသင်းတွင် အိုင်ဒီယာသုံးခုရှိသော်လည်း တစ်ခုသာ တည်ဆောက်နိုင်သည်။ သင်ဘာလုပ်ချင်သနည်း။",
        options: [
          { id: "A", labelEn: "Talk to potential users to see which problem hurts most", labelMy: "အသုံးပြုသူများနှင့် ပြောဆို" },
          { id: "B", labelEn: "Sketch how each idea could look and feel", labelMy: "ပုံကြမ်းဆွဲ" },
          { id: "C", labelEn: "Break down what it would take to build each one", labelMy: "တည်ဆောက်မှုကို ခွဲခြမ်း" },
          { id: "D", labelEn: "Help the team weigh trade-offs and decide together", labelMy: "အသင်းနှင့် ဆုံးဖြတ်" },
        ],
        scoring: [
          { optionId: "A", role: "UX Researcher", w: 3 }, { optionId: "A", role: "Product Manager", w: 2 },
          { optionId: "B", role: "Product Designer", w: 3 }, { optionId: "B", role: "UI Designer", w: 2 },
          { optionId: "C", role: "Frontend Developer", w: 2 }, { optionId: "C", role: "Backend Developer", w: 2 }, { optionId: "C", role: "AI/ML Engineer", w: 1 },
          { optionId: "D", role: "Product Manager", w: 3 }, { optionId: "D", role: "Project Manager", w: 3 },
        ],
      },
      {
        phase: "main-event", category: "product", type: "single", order: 1,
        textEn: "When you learn something new, what excites you most?",
        textMy: "အသစ်တစ်ခုသင်ယူသောအခါ ဘာက စိတ်လှုပ်ရှားစေသနည်း။",
        options: [
          { id: "A", labelEn: "Understanding why people behave the way they do", labelMy: "လူတို့၏ အပြုအမူ" },
          { id: "B", labelEn: "Making something look and feel just right", labelMy: "အလှအပ" },
          { id: "C", labelEn: "Figuring out how it works under the hood", labelMy: "အတွင်းပိုင်းလုပ်ဆောင်မှု" },
          { id: "D", labelEn: "Planning how to tell the story so others get it", labelMy: "ဇာတ်လမ်းပြောပြခြင်း" },
        ],
        scoring: [
          { optionId: "A", role: "UX Researcher", w: 3 }, { optionId: "A", role: "Data Analyst", w: 2 },
          { optionId: "B", role: "Product Designer", w: 3 }, { optionId: "C", role: "Backend Developer", w: 3 },
          { optionId: "D", role: "Marketing", w: 3 }, { optionId: "D", role: "Content Strategist", w: 2 },
        ],
      },
      {
        phase: "main-event", category: "engineering", type: "scenario", order: 2,
        textEn: "The demo is tomorrow and something broke. Where do you gravitate?",
        textMy: "မနက်ဖြန် demo ရှိသော်လည်း တစ်ခုပျက်နေသည်။",
        options: [
          { id: "A", labelEn: "Calm the team and re-scope what we can still show", labelMy: "အသင်းကို စိတ်အေးစေ" },
          { id: "B", labelEn: "Dive into logs and patch the bug", labelMy: "bug ကို ပြင်" },
          { id: "C", labelEn: "Craft a simple fallback that still delights", labelMy: "fallback ဖန်တီး" },
          { id: "D", labelEn: "Gather quick feedback to decide if it's worth fixing", labelMy: "တုံ့ပြန်မှု စုဆောင်း" },
        ],
        scoring: [
          { optionId: "A", role: "Project Manager", w: 3 }, { optionId: "B", role: "Backend Developer", w: 3 }, { optionId: "B", role: "Frontend Developer", w: 2 },
          { optionId: "C", role: "Product Designer", w: 2 }, { optionId: "D", role: "UX Researcher", w: 2 },
        ],
      },
      {
        phase: "main-event", category: "design", type: "multiple", order: 3,
        textEn: "Which activities would you volunteer for first? (pick up to 2)",
        textMy: "ဘယ်လုပ်ဆောင်မှုကို ပထမဆုံး လုပ်ချင်သနည်း။",
        options: [
          { id: "A", labelEn: "Interviewing users", labelMy: "အင်တာဗျူး" },
          { id: "B", labelEn: "Wireframing", labelMy: "Wireframe" },
          { id: "C", labelEn: "Writing API", labelMy: "API ရေး" },
          { id: "D", labelEn: "Pitching", labelMy: "Pitching" },
        ],
        scoring: [
          { optionId: "A", role: "UX Researcher", w: 3 }, { optionId: "B", role: "Product Designer", w: 3 },
          { optionId: "C", role: "Backend Developer", w: 3 }, { optionId: "D", role: "Project Manager", w: 2 }, { optionId: "D", role: "Marketing", w: 2 },
        ],
      },
      {
        phase: "main-event", category: "research", type: "single", order: 4,
        textEn: "You have a free afternoon — what sounds most fun?",
        textMy: "အားလပ်ချိန်တွင် ဘာလုပ်ချင်သနည်း။",
        options: [
          { id: "A", labelEn: "Explore a new AI model", labelMy: "AI မော်ဒယ်စမ်းသပ်" },
          { id: "B", labelEn: "Redesign an app you use", labelMy: "အက်ပ်ဒီဇိုင်းပြန်လုပ်" },
          { id: "C", labelEn: "Analyze a dataset", labelMy: "ဒေတာခွဲခြမ်း" },
          { id: "D", labelEn: "Organize a mini-workshop", labelMy: "workshop စီစဉ်" },
        ],
        scoring: [
          { optionId: "A", role: "AI/ML Engineer", w: 3 }, { optionId: "B", role: "UI Designer", w: 3 },
          { optionId: "C", role: "Data Analyst", w: 3 }, { optionId: "D", role: "Project Manager", w: 3 },
        ],
      },
      {
        phase: "main-event", category: "product", type: "single", order: 5,
        textEn: "I'm not sure what I want yet is totally okay — how do you feel about exploring?",
        textMy: "သေချာမသိသေးခြင်းသည် အဆင်ပြေသည်",
        options: [
          { id: "A", labelEn: "Excited to try a role I've never done", labelMy: "အခန်းကဏ္ဍအသစ် စမ်းသပ်ချင်" },
          { id: "B", labelEn: "Prefer to stick close to what I know", labelMy: "သိပြီးသားနှင့် နီးကပ်ချင်" },
          { id: "C", labelEn: "Want to mix familiar + new", labelMy: "ရောနှောချင်" },
        ],
        scoring: [
          { optionId: "A", role: "Product Manager", w: 2 }, { optionId: "B", role: "Frontend Developer", w: 1 }, { optionId: "C", role: "UX Researcher", w: 2 },
        ],
      },
    ];

    let qCount = 0;
    for (const q of sampleQs) {
      const signals = q.scoring.map((s) => ({ optionId: s.optionId, roleId: roleIds[s.role], weight: s.w }));
      await ctx.db.insert("roleDiscoveryQuestions", {
        phase: q.phase, category: q.category, type: q.type, textEn: q.textEn, textMy: q.textMy,
        options: q.options, required: false, scoringSignals: signals,
        multiTextCount: q.multiTextCount, multiTextPlaceholders: q.multiTextPlaceholders,
        order: q.order, isActive: true, version: "v1", allowNotSure: true, createdAt: now, updatedAt: now,
      });
      qCount++;
    }

    const qIds = await ctx.db.query("roleDiscoveryQuestions").withIndex("by_version", (q) => q.eq("version", "v1")).collect();
    await ctx.db.insert("assessmentVersions", {
      version: "v1",
      questionIds: qIds.map((q) => q._id),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { roles: Object.keys(roleIds).length, questions: qCount, version: "v1" };
  },
});
