/**
 * Ocean Archetype Personality Test
 * 15 statements, 5 archetypes, shuffle, scoring, tie-breaker, same-answer detection
 * Supports both registered users and guests
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

function calculateScores(answers: { questionId: string; score: number }[]) {
  const archetypeMap = { O: 0, C: 0, E: 0, A: 0, N: 0 } as Record<string, number>;
  for (const a of answers) {
    const letter = a.questionId.charAt(0);
    if (letter in archetypeMap) archetypeMap[letter] += a.score;
  }
  return archetypeMap;
}

function detectTie(scores: Record<string, number>) {
  const maxScore = Math.max(...Object.values(scores));
  return Object.entries(scores)
    .filter(([, s]) => s === maxScore)
    .map(([l]) => l);
}

function resolveFinalArchetype(
  tied: string[],
  answers: { questionId: string; score: number }[]
): { finalArchetype: "O" | "C" | "E" | "A" | "N"; wasTieBreaker: boolean } {
  if (tied.length === 1) {
    return { finalArchetype: tied[0] as "O" | "C" | "E" | "A" | "N", wasTieBreaker: false };
  }
  const tieAnswer = answers.find((a) => a.questionId === "TIE");
  if (tieAnswer) {
    const tieIdx = tieAnswer.score - 1;
    return {
      finalArchetype: (tied[tieIdx] ?? tied[0]) as "O" | "C" | "E" | "A" | "N",
      wasTieBreaker: true,
    };
  }
  return { finalArchetype: tied[0] as "O" | "C" | "E" | "A" | "N", wasTieBreaker: false };
}

// ── Queries ──

export const getArchetypes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("oceanArchetypes").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
  },
});

export const getQuestions = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("oceanQuestions").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    return questions.sort((a, b) => a.order - b.order);
  },
});

export const getResult = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) return null;
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) return null;
    const results = await ctx.db.query("oceanTestResults").withIndex("by_participant", (q) => q.eq("participantId", p._id)).collect();
    return results.length > 0 ? results[results.length - 1] : null;
  },
});

export const getGuestResult = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("oceanTestResults").withIndex("by_session", (q) => q.eq("sessionId", args.sessionId)).collect();
    return results.length > 0 ? results[results.length - 1] : null;
  },
});

// ── Mutations ──

export const submitTest = mutation({
  args: {
    answers: v.array(v.object({ questionId: v.string(), score: v.number() })),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.answers.length < 15) throw new Error("Need 15 answers");

    const idt = await ctx.auth.getUserIdentity();
    const isRegistered = !!idt;

    let participantId: Id<"participants"> | undefined;
    let sessionId: string | undefined;
    let userType: "REGISTERED" | "GUEST";

    if (isRegistered) {
      const p = await getParticipantByIdentity(ctx, idt!);
      if (!p) throw new Error("Participant not found");
      participantId = p._id;
      userType = "REGISTERED";
    } else {
      if (!args.sessionId) throw new Error("Session ID required for guests");
      sessionId = args.sessionId;
      userType = "GUEST";
    }

    const scores = calculateScores(args.answers);
    const allSame = new Set(args.answers.map((a) => a.score)).size === 1;
    const tied = detectTie(scores);
    const { finalArchetype, wasTieBreaker } = resolveFinalArchetype(tied, args.answers);

    const now = Date.now();
    const resultId = await ctx.db.insert("oceanTestResults", {
      userType,
      participantId,
      sessionId,
      answers: args.answers.filter((a) => a.questionId !== "TIE"),
      scores: scores as { O: number; C: number; E: number; A: number; N: number },
      finalArchetype,
      wasTieBreaker,
      allSameAnswers: allSame,
      completedAt: now,
      createdAt: now,
    });

    return {
      resultId,
      scores,
      finalArchetype,
      wasTieBreaker,
      allSame,
      tied,
      userType,
    };
  },
});

export const saveGuestResult = mutation({
  args: {
    sessionId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("oceanTestResults").withIndex("by_session", (q) => q.eq("sessionId", args.sessionId)).collect();
    if (results.length === 0) throw new Error("No result found for this session");
    const result = results[results.length - 1];
    await ctx.db.patch(result._id, {
      guestName: args.name,
      guestEmail: args.email,
    });
    return { success: true };
  },
});

// ── Admin Analytics ──

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");

    const all = await ctx.db.query("oceanTestResults").collect();

    const registered = all.filter((r) => r.userType === "REGISTERED");
    const guests = all.filter((r) => r.userType === "GUEST");

    // Archetype distribution
    const archetypeCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 } as Record<string, number>;
    const registeredArchetypeCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 } as Record<string, number>;
    const guestArchetypeCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 } as Record<string, number>;
    let ties = 0;
    let tieBreakers = 0;
    let sameAnswers = 0;

    for (const r of all) {
      archetypeCounts[r.finalArchetype]++;
      if (r.userType === "REGISTERED") registeredArchetypeCounts[r.finalArchetype]++;
      if (r.userType === "GUEST") guestArchetypeCounts[r.finalArchetype]++;
      if (r.wasTieBreaker) tieBreakers++;
      if (r.allSameAnswers) sameAnswers++;
    }

    // Count ties (results where wasTieBreaker is true implies a tie existed)
    ties = tieBreakers;

    // Guest conversion: guests with name or email
    const convertedGuests = guests.filter((g) => g.guestName || g.guestEmail).length;

    return {
      total: all.length,
      registeredCount: registered.length,
      guestCount: guests.length,
      archetypeCounts,
      registeredArchetypeCounts,
      guestArchetypeCounts,
      ties,
      tieBreakers,
      sameAnswers,
      convertedGuests,
    };
  },
});
