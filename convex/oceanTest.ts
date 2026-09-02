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

    // If tie and no TIE answer yet → return tied list, don't save
    if (tied.length > 1 && !args.answers.find((a) => a.questionId === "TIE")) {
      return {
        resultId: null,
        scores,
        finalArchetype: tied[0] as "O" | "C" | "E" | "A" | "N",
        wasTieBreaker: false,
        allSame,
        tied,
        userType: isRegistered ? "REGISTERED" as const : "GUEST" as const,
        needsTieBreaker: true,
      };
    }

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
      needsTieBreaker: false,
    };
  },
});

export const submitTieBreaker = mutation({
  args: {
    tied: v.array(v.string()),
    tieAnswer: v.number(),
    answers: v.array(v.object({ questionId: v.string(), score: v.number() })),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { finalArchetype, wasTieBreaker } = resolveFinalArchetype(args.tied, [{ questionId: "TIE", score: args.tieAnswer }]);

    // Find existing result to update
    const identity = await ctx.auth.getUserIdentity();
    const isRegistered = !!identity;
    let resultId: string | null = null;

    if (isRegistered && identity) {
      const participant = await getParticipantByIdentity(ctx, identity);
      if (participant) {
        const existing = await ctx.db
          .query("oceanTestResults")
          .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
          .order("desc")
          .first();
        if (existing) {
          await ctx.db.patch(existing._id, {
            finalArchetype,
            wasTieBreaker,
          });
          resultId = existing._id;
        }
      }
    }

    if (!resultId && args.sessionId) {
      const existing = await ctx.db
        .query("oceanTestResults")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .order("desc")
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          finalArchetype,
          wasTieBreaker,
        });
        resultId = existing._id;
      }
    }

    // If no existing result found, create one
    if (!resultId) {
      const scores = calculateScores(args.answers);
      const allSame = new Set(args.answers.map((a) => a.score)).size === 1;
      const now = Date.now();
      resultId = await ctx.db.insert("oceanTestResults", {
        userType: isRegistered ? "REGISTERED" : "GUEST",
        participantId: undefined,
        sessionId: args.sessionId,
        answers: args.answers,
        scores: scores as { O: number; C: number; E: number; A: number; N: number },
        finalArchetype,
        wasTieBreaker: true,
        allSameAnswers: allSame,
        completedAt: now,
        createdAt: now,
      });
    }

    return { resultId, finalArchetype, wasTieBreaker };
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

// ── Admin Queries ──

export const listAllArchetypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    return await ctx.db.query("oceanArchetypes").collect();
  },
});

export const listAllQuestions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    return await ctx.db.query("oceanQuestions").collect();
  },
});

// ── Admin Mutations ──

export const createArchetype = mutation({
  args: {
    letter: v.string(),
    name: v.string(),
    character: v.string(),
    animal: v.string(),
    emoji: v.string(),
    traitsEn: v.array(v.string()),
    traitsMy: v.array(v.string()),
    mottoEn: v.string(),
    mottoMy: v.string(),
    descriptionEn: v.string(),
    descriptionMy: v.string(),
    wave: v.string(),
    tieBreakerStatementEn: v.string(),
    tieBreakerStatementMy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    const now = Date.now();
    const id = await ctx.db.insert("oceanArchetypes", {
      ...args, letter: args.letter as "O" | "C" | "E" | "A" | "N",
      isActive: true, createdAt: now, updatedAt: now,
    });
    return { id };
  },
});

export const updateArchetype = mutation({
  args: {
    archetypeId: v.id("oceanArchetypes"),
    name: v.optional(v.string()),
    character: v.optional(v.string()),
    animal: v.optional(v.string()),
    emoji: v.optional(v.string()),
    traitsEn: v.optional(v.array(v.string())),
    traitsMy: v.optional(v.array(v.string())),
    mottoEn: v.optional(v.string()),
    mottoMy: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    descriptionMy: v.optional(v.string()),
    wave: v.optional(v.string()),
    tieBreakerStatementEn: v.optional(v.string()),
    tieBreakerStatementMy: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    const { archetypeId, ...updates } = args;
    await ctx.db.patch(archetypeId, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});

export const createQuestion = mutation({
  args: {
    id: v.string(),
    archetypeLetter: v.string(),
    statementEn: v.string(),
    statementMy: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    const now = Date.now();
    const qId = await ctx.db.insert("oceanQuestions", {
      id: args.id,
      archetypeLetter: args.archetypeLetter as "O" | "C" | "E" | "A" | "N",
      statementEn: args.statementEn,
      statementMy: args.statementMy,
      order: args.order,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return { id: qId };
  },
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("oceanQuestions"),
    statementEn: v.optional(v.string()),
    statementMy: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    const { questionId, ...updates } = args;
    await ctx.db.patch(questionId, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});

export const deleteQuestion = mutation({
  args: { questionId: v.id("oceanQuestions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    await ctx.db.delete(args.questionId);
    return { success: true };
  },
});

export const reorderQuestions = mutation({
  args: {
    orders: v.array(v.object({ questionId: v.id("oceanQuestions"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");
    for (const o of args.orders) {
      await ctx.db.patch(o.questionId, { order: o.order, updatedAt: Date.now() });
    }
    return { success: true };
  },
});

// ── Retake ──

export const retakeTest = mutation({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    const isRegistered = !!idt;

    if (isRegistered) {
      // Registered user: delete ALL their old results
      const p = await getParticipantByIdentity(ctx, idt!);
      if (p) {
        const old = await ctx.db.query("oceanTestResults")
          .withIndex("by_participant", (q) => q.eq("participantId", p._id))
          .collect();
        for (const r of old) {
          await ctx.db.delete(r._id);
        }
      }
      return { cleaned: true, type: "registered" };
    }

    if (args.sessionId) {
      // Guest with session: check if they have name/email (converted guest)
      const results = await ctx.db.query("oceanTestResults")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .collect();
      const lastResult = results[results.length - 1];

      if (lastResult && (lastResult.guestName || lastResult.guestEmail)) {
        // Named guest: delete their old results
        for (const r of results) {
          await ctx.db.delete(r._id);
        }
        return { cleaned: true, type: "named_guest" };
      }

      // Anonymous guest: just return new session needed
      return { cleaned: false, type: "anonymous_guest" };
    }

    return { cleaned: false, type: "unknown" };
  },
});




export const listAllResults = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await getParticipantByIdentity(ctx, identity);
    if (!caller || caller.role !== "admin") throw new Error("Admin required");

    const all = await ctx.db.query("oceanTestResults").collect();

    // Enrich with participant info for registered users
    const results = await Promise.all(all.map(async (r) => {
      let participantName: string | undefined;
      let participantEmail: string | undefined;

      if (r.participantId) {
        const p = await ctx.db.get(r.participantId);
        if (p) {
          participantName = p.name || p.firstName;
          participantEmail = p.email;
        }
      }

      return {
        _id: r._id,
        userType: r.userType,
        finalArchetype: r.finalArchetype,
        wasTieBreaker: r.wasTieBreaker,
        allSameAnswers: r.allSameAnswers,
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        participantName,
        participantEmail,
        completedAt: r.completedAt,
        // Determine display name/email — prefer registered, fallback to guest
        displayName: participantName || r.guestName,
        displayEmail: participantEmail || r.guestEmail,
        scores: r.scores,
      };
    }));

    // Detect email collisions — registered and guest with same email
    const emailMap = new Map<string, string[]>();
    for (const r of results) {
      if (r.displayEmail) {
        const existing = emailMap.get(r.displayEmail) ?? [];
        existing.push(r._id);
        emailMap.set(r.displayEmail, existing);
      }
    }
    const duplicateEmails = Array.from(emailMap.entries())
      .filter(([, ids]) => ids.length > 1)
      .map(([email]) => email);

    return {
      results: results.sort((a, b) => b.completedAt - a.completedAt),
      duplicateEmails,
    };
  },
});

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
