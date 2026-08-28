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
        tieBreakerStatementMy: "အားလုံးရဲ့ အခြေအနေကို စောင့်ကြည့်တယ်။",
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
        tieBreakerStatementMy: "ပြီးပြည့်စုံအောင်ထက် ရွေ့လျားအောင် ပိုလုပ်ချင်တယ်။",
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
        tieBreakerStatementMy: "အားလုံးလွတ်သွားတာကို ရှာတွေ့တဲ့သူက ကျွန်တော်/ကျွန်မပါ။",
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
        tieBreakerStatementMy: "ပြီးဆုံးတာထက် ဘယ်လိုပြီးတာလဲကို ဂရုစိုက်တယ်။",
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
        tieBreakerStatementMy: "ကိုင်တွယ်မီတွင် ကောင်းစွာ နားလည်လိုတယ်။",
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
      { id: "O1", letter: "O" as const, order: 0, statementEn: "Enjoy being around people more than working alone.", statementMy: "တစ်ယောက်တည်းအလုပ်လုပ်ထက် လူတွေနဲ့ ရှိတာ ပိုကြိုက်တယ်။" },
      { id: "O2", letter: "O" as const, order: 1, statementEn: "Can tell when someone is unhappy with a decision without them saying so.", statementMy: "ဘာမှမပြောဘဲ တစ်ယောက်ယောက် မပျော်တာကို သိနိုင်တယ်။" },
      { id: "O3", letter: "O" as const, order: 2, statementEn: "Prefer keeping several things moving rather than taking one through to completion.", statementMy: "တစ်ခုပြီးအောင်လုပ်ထက် အများကြီးကို ရွေ့နေအောင် ထိန်းတာ ပိုကြိုက်တယ်။" },
      // C — Catalyst
      { id: "C1", letter: "C" as const, order: 3, statementEn: "Get impatient when conversations continue without progress.", statementMy: "တိုးတက်မှုမရှိဘဲ စကားပြောနေတာကြာရင် စိတ်ရှည်လျားမလာဘူး။" },
      { id: "C2", letter: "C" as const, order: 4, statementEn: "Lose interest in work that doesn't visibly change anything.", statementMy: "ဘာမှမပြောင်းလဲတဲ့ အလုပ်မှာ စိတ်ဝင်စားမှု ဆုံးရှုံးတယ်။" },
      { id: "C3", letter: "C" as const, order: 5, statementEn: "Prefer taking a risk over waiting for the perfect plan.", statementMy: "ပြီးပြည့်စုံတဲ့ အစီအစဉ်ကို စောင့်ထက် အန္တရာယ်ကို လက်ခံတာ ပိုကြိုက်တယ်။" },
      // E — Evaluator
      { id: "E1", letter: "E" as const, order: 6, statementEn: "Notice small errors others might miss.", statementMy: "တခြားသူတွေ လွတ်သွားနိုင်တဲ့ အမှားအသေးလေးတွေကို သတိပြုမိတယ်။" },
      { id: "E2", letter: "E" as const, order: 7, statementEn: "Automatically think about how a plan could go wrong.", statementMy: "အစီအစဉ် ဘယ်လို မှားသွားနိုင်လဲဆိုတာ အလိုလို စဉ်းစားမိတယ်။" },
      { id: "E3", letter: "E" as const, order: 8, statementEn: "Check things more times than most people think is necessary.", statementMy: "တခြားသူတွေထက် ပိုပြီး စစ်ဆေးတတ်တယ်။" },
      // A — Artisan
      { id: "A1", letter: "A" as const, order: 9, statementEn: "Look for fresh approaches instead of following the usual way.", statementMy: "ပုံမှန်နည်းလမ်းအတိုင်းမသွားဘဲ အသစ်နည်းလမ်းတွေ ရှာတတ်တယ်။" },
      { id: "A2", letter: "A" as const, order: 10, statementEn: "Enjoy making small changes to see whether they improve the result.", statementMy: "ရလဒ်ပိုကောင်းအောင် အသေးအဖွဲ့ ပြောင်းလဲကြည့်တာ ကြိုက်တယ်။" },
      { id: "A3", letter: "A" as const, order: 11, statementEn: "Make small changes that most people wouldn't notice.", statementMy: "တခြားသူတွေ သတိမပြုမိနိုင်တဲ့ အသေးအဖွဲ့ ပြောင်းလဲမှုတွေ လုပ်တတ်တယ်။" },
      // N — Navigator
      { id: "N1", letter: "N" as const, order: 12, statementEn: "Want to understand how something works before using it.", statementMy: "သုံးမီတွင် ဘယ်လိုအလုပ်လုပ်လဲ နားလည်ချင်တယ်။" },
      { id: "N2", letter: "N" as const, order: 13, statementEn: "Need time to regain focus after being interrupted.", statementMy: "အနှောင့်အယှက်ပြီးနောက် ပြန်အာရုံစူးစိုက်ဖို့ အချိန်လိုတယ်။" },
      { id: "N3", letter: "N" as const, order: 14, statementEn: "Prefer maintaining a steady pace rather than working in bursts.", statementMy: "ပေါက်ကွဲအားဖြင့် အလုပ်လုပ်ထက် တည်ငြိမ်တဲ့ နှုန်းထားကို ထိန်းတာ ပိုကြိုက်တယ်။" },
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
