/**
 * Seed Ocean Archetype personality test data
 * 5 archetypes + 15 statements (3 per archetype)
 */
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");

    const existing = await ctx.db.query("oceanArchetypes").collect();
    if (existing.length > 0) {
      return { skipped: true, reason: "already seeded", count: existing.length };
    }

    const now = Date.now();

    // ── Archetypes ──
    const archetypes = [
      {
        letter: "O" as const, name: "The Orchestrator", character: "Otto", animal: "Octopus", emoji: "🐙",
        traitsEn: ["Empathetic", "Perceptive", "Versatile"],
        traitsMy: ["စာနာတတ်", "အမြင်ရှိ", "စွမ်းဆောင်ရည်မြင့်"],
        mottoEn: "Nothing moves without people.", mottoMy: "လူတွေမပါဘဲ ဘာမှ ရွေ့လို့မရဘူး။",
        descriptionEn: "Otto is highly aware of people, team dynamics, and unspoken reactions. Otto naturally connects people, keeps multiple things moving, and helps teams stay aligned.",
        descriptionMy: "Otto သည် လူများ၊ အသင်းတည်ဆောက်ပုံနှင့် ပြောဆိုခြင်းမရှိသည့် တုံ့ပြန်မှုများကို အလွန်သတိပြုတတ်သည်။",
        wave: "Together",
        tieBreakerStatementEn: "I keep track of how everyone's doing.",
        tieBreakerStatementMy: "လူတိုင်း ဘယ်လိုအခြေအနေရှိလဲ သတိထားတတ်တယ်။",
      },
      {
        letter: "C" as const, name: "The Catalyst", character: "Sharkie", animal: "Shark", emoji: "🦈",
        traitsEn: ["Driven", "Bold", "Decisive"],
        traitsMy: ["အားထုတ်မှုရှိ", "ရဲရင့်", "ဆုံးဖြတ်နိုင်"],
        mottoEn: "Progress comes from action.", mottoMy: "တိုးတက်မှုသည် လုပ်ဆောင်မှုမှ လာသည်။",
        descriptionEn: "Sharkie wants things to move. They learn through action, make decisions quickly, experiment, and push teams forward when they become stuck.",
        descriptionMy: "Sharkie သည် အရာဝတ္ထုများ ရွေ့လျားစေလိုသည်။ လုပ်ဆောင်မှုဖြင့် သင်ယူပြီး ဆုံးဖြတ်ချက်များ မြန်မြန်ချတတ်သည်။",
        wave: "Forward",
        tieBreakerStatementEn: "I'd rather get moving than get it perfect.",
        tieBreakerStatementMy: "ပြီးပြည့်စုံအောင်စောင့်တာထက် အရင်စလုပ်ချင်တယ်။",
      },
      {
        letter: "E" as const, name: "The Evaluator", character: "Croco", animal: "Crocodile", emoji: "🐊",
        traitsEn: ["Vigilant", "Protective", "Thorough"],
        traitsMy: ["သတိထား", "ကာကွယ်တတ်", "ဂရုစိုက်"],
        mottoEn: "Certainty is worth the time.", mottoMy: "သေချာမှုသည် အချိန်ထိုက်တန်သည်။",
        descriptionEn: "Croco naturally searches for mistakes, edge cases, weaknesses, and potential failure points. They protect the team by catching what others overlook.",
        descriptionMy: "Croco သည် အမှားများ၊ အခြေအနေများ၊ အားနည်းချက်များကို ရှာဖွေတတ်သည်။",
        wave: "Safely",
        tieBreakerStatementEn: "I'm the one who spots what everyone missed.",
        tieBreakerStatementMy: "လူတိုင်းလွတ်သွားတဲ့အရာကို သတိထားမိတတ်တဲ့ သူဖြစ်တယ်။",
      },
      {
        letter: "A" as const, name: "The Artisan", character: "Crabbi", animal: "Crab", emoji: "🦀",
        traitsEn: ["Creative", "Curious", "Discerning"],
        traitsMy: ["ဖန်တီးနိုင်", "စူးစမ်းလိုစိတ်ရှိ", "ခွဲခြမ်းနိုင်"],
        mottoEn: "Always curious. Always creating.", mottoMy: "အမြဲစူးစမ်း၊ အမြဲဖန်တီး။",
        descriptionEn: "Crabbi looks for better approaches and continuously refines things. They notice subtle imperfections and make thoughtful adjustments until the result feels right.",
        descriptionMy: "Crabbi သည် ပိုကောင်းသည့်နည်းလမ်းများကို ရှာဖွေပြီး ဆက်လက်ပြင်ဆင်တတ်သည်။",
        wave: "Gracefully",
        tieBreakerStatementEn: "I care how it turns out, not just that it's done.",
        tieBreakerStatementMy: "အလုပ်ပြီးသွားရုံမဟုတ်ဘဲ ဘယ်လိုထွက်လာလဲကိုပါ ဂရုစိုက်တယ်။",
      },
      {
        letter: "N" as const, name: "The Navigator", character: "Turty", animal: "Turtle", emoji: "🐢",
        traitsEn: ["Steady", "Systematic", "Deep"],
        traitsMy: ["တည်ငြိမ်", "စနစ်ကျ", "နက်ရှိုင်း"],
        mottoEn: "Steady is its own kind of fast.", mottoMy: "တည်ငြိမ်ခြင်းသည် မြန်ဆန်မှု၏ တစ်မျိုးဖြစ်သည်။",
        descriptionEn: "Turty wants to understand the underlying system before acting. They work steadily, deeply analyze problems, and build things that are designed to hold up over time.",
        descriptionMy: "Turty သည် လုပ်ဆောင်မီတွင် အောက်ခြေစနစ်ကို နားလည်လိုသည်။",
        wave: "Steadily",
        tieBreakerStatementEn: "I want to understand it properly before I touch it.",
        tieBreakerStatementMy: "မလုပ်ခင် ကောင်းကောင်းနားလည်ထားချင်တယ်။",
      },
    ];

    const letterToId: Record<string, Id<"oceanArchetypes">> = {};
    for (const a of archetypes) {
      const id = await ctx.db.insert("oceanArchetypes", {
        ...a, isActive: true, createdAt: now, updatedAt: now,
      });
      letterToId[a.letter] = id;
    }

    // ── Questions (15 statements, 3 per archetype) ──
    const questions = [
      // O — Orchestrator
      { id: "O1", letter: "O" as const, order: 0, statementEn: "I enjoy being around people more than working alone.", statementMy: "တစ်ယောက်တည်းလုပ်တာထက် လူတွေနဲ့အတူလုပ်ရတာ ပိုကြိုက်တယ်။" },
      { id: "O2", letter: "O" as const, order: 1, statementEn: "I can tell when someone is unhappy with a decision but hasn't said so.", statementMy: "ဆုံးဖြတ်ချက်တစ်ခုကိုမကြိုက်ဘဲ နှုတ်ဆိတ်နေသူတွေကို ချက်ချင်းသိနိုင်တယ်။" },
      { id: "O3", letter: "O" as const, order: 2, statementEn: "I'd rather keep several things moving than take one all the way through.", statementMy: "တစ်ခုကို အစအဆုံးလုပ်တာထက် အလုပ်များစွာကို တွဲလုပ်ရတာ ပိုကြိုက်တယ်။" },
      // C — Catalyst
      { id: "C1", letter: "C" as const, order: 3, statementEn: "I get impatient when a conversation goes on without any progress.", statementMy: "စကားဝိုင်းက ရှည်လာပြီး ဘာမှထူးခြားမလာရင် စိတ်မရှည်တော့ဘူး။" },
      { id: "C2", letter: "C" as const, order: 4, statementEn: "I lose interest in work that doesn't visibly change anything.", statementMy: "သိသာတဲ့ပြောင်းလဲမှုမရှိတဲ့ အလုပ်ဆိုရင် စိတ်ဝင်စားမှုလျော့သွားတတ်တယ်။" },
      { id: "C3", letter: "C" as const, order: 5, statementEn: "I'd rather take a risk than wait for the perfect plan.", statementMy: "အကောင်းဆုံးအစီအစဉ်ကို စောင့်တာထက် စွန့်စားပြီးလုပ်လိုက်ချင်တယ်။" },
      // E — Evaluator
      { id: "E1", letter: "E" as const, order: 6, statementEn: "I notice small errors that others might miss.", statementMy: "တခြားသူတွေ လွတ်သွားနိုင်တဲ့ အမှားလေးတွေကို သတိထားမိတတ်တယ်။" },
      { id: "E2", letter: "E" as const, order: 7, statementEn: "When someone describes a plan, I start picturing how it could go wrong.", statementMy: "အစီအစဉ်တစ်ခုကိုကြားတာနဲ့ ဘာတွေလွဲချော်နိုင်လဲဆိုတာကို စတင်မြင်ယောင်လာတတ်တယ်။" },
      { id: "E3", letter: "E" as const, order: 8, statementEn: "I check things more times than most people think is necessary.", statementMy: "တခြားသူတွေ လိုအပ်တယ်ထင်တာထက် ပိုပြီး ပြန်စစ်တတ်တယ်။" },
      // A — Artisan
      { id: "A1", letter: "A" as const, order: 9, statementEn: "I often look for a fresh approach instead of following the usual way.", statementMy: "ပုံမှန်နည်းအတိုင်းလုပ်တာထက် နည်းလမ်းအသစ်ရှာတတ်တယ်။" },
      { id: "A2", letter: "A" as const, order: 10, statementEn: "I enjoy making small changes to see how they improve the result.", statementMy: "ရလဒ်ပိုကောင်းလာဖို့ အပြောင်းအလဲသေးသေးလေးတွေ လုပ်ကြည့်ရတာကို နှစ်သက်တယ်။" },
      { id: "A3", letter: "A" as const, order: 11, statementEn: "I make small changes most people would not notice.", statementMy: "လူအများစု သတိမထားမိတဲ့ အပြောင်းအလဲလေးတွေကို လုပ်ဖြစ်တယ်။" },
      // N — Navigator
      { id: "N1", letter: "N" as const, order: 12, statementEn: "I want to understand how something works before I use it.", statementMy: "တစ်ခုခုကို မသုံးခင် ဘယ်လိုအလုပ်လုပ်လဲဆိုတာကို အရင်နားလည်ချင်တယ်။" },
      { id: "N2", letter: "N" as const, order: 13, statementEn: "It takes me a long time to get back into something after I am pulled away.", statementMy: "အာရုံလွတ်သွားရင် ပြန်ပြီးအာရုံစိုက်နိုင်ဖို့ အချိန်တော်တော်ယူရတယ်။" },
      { id: "N3", letter: "N" as const, order: 14, statementEn: "I keep a steady pace instead of working in bursts.", statementMy: "တစ်ဟုန်ထိုးလုပ်ပစ်တာထက် ပုံမှန်အရှိန်နဲ့ပဲ ဆက်တိုက်လုပ်တတ်တယ်။" },
    ];

    let qCount = 0;
    for (const q of questions) {
      await ctx.db.insert("oceanQuestions", {
        id: q.id, archetypeLetter: q.letter,
        statementEn: q.statementEn, statementMy: q.statementMy,
        order: q.order, isActive: true, createdAt: now, updatedAt: now,
      });
      qCount++;
    }

    return { archetypes: Object.keys(letterToId).length, questions: qCount };
  },
});
