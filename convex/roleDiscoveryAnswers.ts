/**
 * Role Discovery Answers + Recommendations
 * §8 hidden signals, §12 confidence, §10 top3 + explanations
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { calculateRoleAffinity, rankRoles, calculateConfidence } from "../lib/scoring/roleAffinity";

export const submitAnswer = mutation({
  args: {
    registrationId: v.id("buildathonRegistrations"),
    questionId: v.id("roleDiscoveryQuestions"),
    optionIds: v.array(v.string()),
    isNotSure: v.boolean(),
    responseMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found");
    const existing = await ctx.db.query("roleDiscoveryAnswers").withIndex("by_registration_and_question", (q) => q.eq("registrationId", args.registrationId).eq("questionId", args.questionId)).first();
    if (existing) throw new Error("Already answered — one answer per question per registration");
    const now = Date.now();
    const id = await ctx.db.insert("roleDiscoveryAnswers", { registrationId: args.registrationId, questionId: args.questionId, optionIds: args.isNotSure ? [] : args.optionIds, isNotSure: args.isNotSure, answeredAt: now, responseMs: args.responseMs });
    return { answerId: id };
  },
});

export const getMyAnswers = query({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => await ctx.db.query("roleDiscoveryAnswers").withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId)).collect(),
});

export const getRecommendation = query({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => await ctx.db.query("roleRecommendations").withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId)).first(),
});

export const calculateRecommendations = mutation({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Registration not found");

    const answers = await ctx.db.query("roleDiscoveryAnswers").withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId)).collect();
    if (answers.length === 0) throw new Error("No answers yet");

    const questionIds = [...new Set(answers.map((a) => a.questionId))];
    const questions: Doc<"roleDiscoveryQuestions">[] = [];
    for (const qid of questionIds) {
      const q = await ctx.db.get(qid);
      if (q) questions.push(q);
    }

    const roles = await ctx.db.query("buildathonRoles").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    const roleIds: string[] = roles.map((r) => r._id);

    const raw = calculateRoleAffinity(
      answers.map((a) => ({ questionId: a.questionId, optionIds: a.optionIds, isNotSure: a.isNotSure })),
      questions.map((q) => ({ _id: q._id, scoringSignals: q.scoringSignals })),
      roleIds
    );

    const explanations = new Map<string, { en: string; my: string }>(
      roles.map((r) => [r._id, { en: r.descriptionEn?.slice(0, 120) ?? `You enjoy ${r.nameEn}`, my: r.descriptionMy?.slice(0, 120) ?? r.nameMy }])
    );

    const ranked = rankRoles(raw, explanations);
    const conf = calculateConfidence(
      answers.map((a) => ({ isNotSure: a.isNotSure, responseMs: a.responseMs })),
      [...raw.entries()].map(([roleId, rawScore]) => ({ roleId, raw: rawScore, affinity: 0 }))
    );

    const existing = await ctx.db.query("roleRecommendations").withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId)).first();

    const doc = {
      registrationId: args.registrationId,
      participantId: reg.participantId,
      rankedRoles: ranked.map((r) => ({ roleId: r.roleId as Id<"buildathonRoles">, affinity: r.affinity, explanationEn: r.explanationEn, explanationMy: r.explanationMy })),
      confidence: conf.level,
      confidenceScore: conf.score,
      assessmentVersion: reg.assessmentVersion,
      calculatedAt: Date.now(),
    };

    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("roleRecommendations", doc);

    if (reg.state === "draft" || reg.state === "assessment") {
      await ctx.db.patch(args.registrationId, { state: "recommended", updatedAt: Date.now() });
    }

    return { ranked, confidence: conf };
  },
});
