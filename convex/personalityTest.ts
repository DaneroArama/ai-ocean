/**
 * Personality Test Management
 * 
 * Provides CRUD operations for personality test questions with admin-only access,
 * bilingual validation, soft-delete support, and personality test administration
 * including answer submission and progress tracking.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 12.4, 15.1, 22.1, 25.2
 */

import {v} from "convex/values";
import {mutation, query} from "./_generated/server";
import {Doc} from "./_generated/dataModel";
import {requireAdmin} from "./helpers";

/**
 * Get all active personality questions ordered by orderIndex
 * Requirement 5.1: Question ordering that determines sequence presented to participants
 * Requirement 6.1: Present questions in participant's selected language
 */
export const getPersonalityActiveQuestions = query({
  args: {},
  handler: async (ctx) => {
    // No authentication required - questions are public for test-taking
    const questions = await ctx.db
      .query("personalityQuestions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Sort by orderIndex in ascending order
    return questions.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

/**
 * Get a specific question by ID (admin only)
 * Requirement 12.4: Admin dashboard - question management interfaces
 * Requirement 15.4: Server-side authorization validation
 */
export const getPersonalityQuestionById = query({
  args: {
    questionId: v.id("personalityQuestions"),
  },
  handler: async (ctx, args) => {
    // Verify admin authorization
    await requireAdmin(ctx);
    
    const question = await ctx.db.get(args.questionId);
    
    if (!question) {
      return null;
    }
    
    return question;
  },
});

/**
 * Create a new personality question with bilingual validation
 * Requirement 5.1: Store questions with content in both English and Myanmar
 * Requirement 5.2: Associate each question with an OCEAN dimension
 * Requirement 5.3: Store scoring weights for each question
 * Requirement 5.4: Validate question includes content in both required languages
 * Requirement 12.4: Admin dashboard - create question functionality
 * Requirement 25.2: Audit trail for admin question creation
 */
export const createPersonalityQuestion = mutation({
  args: {
    textEn: v.string(),
    textMy: v.string(),
    oceanDimension: v.union(
      v.literal("openness"),
      v.literal("conscientiousness"),
      v.literal("extraversion"),
      v.literal("agreeableness"),
      v.literal("neuroticism")
    ),
    scoringWeight: v.number(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify admin authorization
    const admin = await requireAdmin(ctx);
    
    // Validate bilingual content (Requirement 5.4)
    if (!args.textEn || args.textEn.trim().length === 0) {
      throw new Error("Validation error: English text is required");
    }
    
    if (!args.textMy || args.textMy.trim().length === 0) {
      throw new Error("Validation error: Myanmar text is required");
    }
    
    // Validate scoring weight is within valid range
    if (args.scoringWeight < -2 || args.scoringWeight > 2) {
      throw new Error("Validation error: Scoring weight must be between -2 and 2");
    }
    
    // Validate orderIndex is non-negative
    if (args.orderIndex < 0) {
      throw new Error("Validation error: Order index must be non-negative");
    }
    
    const now = Date.now();
    
    // Create the question
    const questionId = await ctx.db.insert("personalityQuestions", {
      textEn: args.textEn.trim(),
      textMy: args.textMy.trim(),
      oceanDimension: args.oceanDimension,
      scoringWeight: args.scoringWeight,
      orderIndex: args.orderIndex,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create audit log entry (Requirement 25.2)
    await ctx.db.insert("auditLog", {
      adminId: admin._id,
      action: "CREATE_QUESTION",
      targetType: "personalityQuestion",
      targetId: questionId,
      oldValue: undefined,
      newValue: {
        textEn: args.textEn.trim(),
        textMy: args.textMy.trim(),
        oceanDimension: args.oceanDimension,
        scoringWeight: args.scoringWeight,
        orderIndex: args.orderIndex,
      },
      timestamp: now,
    });
    
    return {
      success: true,
      questionId,
    };
  },
});

/**
 * Update an existing personality question with bilingual validation
 * Requirement 5.4: Validate question modifications include content in both required languages
 * Requirement 12.4: Admin dashboard - edit question functionality
 * Requirement 25.2: Audit trail for admin question modifications
 */
export const updatePersonalityQuestion = mutation({
  args: {
    questionId: v.id("personalityQuestions"),
    textEn: v.optional(v.string()),
    textMy: v.optional(v.string()),
    oceanDimension: v.optional(
      v.union(
        v.literal("openness"),
        v.literal("conscientiousness"),
        v.literal("extraversion"),
        v.literal("agreeableness"),
        v.literal("neuroticism")
      )
    ),
    scoringWeight: v.optional(v.number()),
    orderIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin authorization
    const admin = await requireAdmin(ctx);
    
    // Get existing question
    const existingQuestion = await ctx.db.get(args.questionId);
    
    if (!existingQuestion) {
      throw new Error("Question not found");
    }
    
    // Build update object with validation
    const updates: Partial<Omit<Doc<"personalityQuestions">, "_id" | "_creationTime">> = {
      updatedAt: Date.now(),
    };
    
    // Validate and apply bilingual content updates
    if (args.textEn !== undefined) {
      if (args.textEn.trim().length === 0) {
        throw new Error("Validation error: English text cannot be empty");
      }
      updates.textEn = args.textEn.trim();
    }
    
    if (args.textMy !== undefined) {
      if (args.textMy.trim().length === 0) {
        throw new Error("Validation error: Myanmar text cannot be empty");
      }
      updates.textMy = args.textMy.trim();
    }
    
    if (args.oceanDimension !== undefined) {
      updates.oceanDimension = args.oceanDimension;
    }
    
    if (args.scoringWeight !== undefined) {
      if (args.scoringWeight < -2 || args.scoringWeight > 2) {
        throw new Error("Validation error: Scoring weight must be between -2 and 2");
      }
      updates.scoringWeight = args.scoringWeight;
    }
    
    if (args.orderIndex !== undefined) {
      if (args.orderIndex < 0) {
        throw new Error("Validation error: Order index must be non-negative");
      }
      updates.orderIndex = args.orderIndex;
    }
    
    // Update the question
    await ctx.db.patch(args.questionId, updates);
    
    // Create audit log entry (Requirement 25.2)
    await ctx.db.insert("auditLog", {
      adminId: admin._id,
      action: "UPDATE_QUESTION",
      targetType: "personalityQuestion",
      targetId: args.questionId,
      oldValue: {
        textEn: existingQuestion.textEn,
        textMy: existingQuestion.textMy,
        oceanDimension: existingQuestion.oceanDimension,
        scoringWeight: existingQuestion.scoringWeight,
        orderIndex: existingQuestion.orderIndex,
      },
      newValue: updates,
      timestamp: Date.now(),
    });
    
    return {
      success: true,
      questionId: args.questionId,
    };
  },
});

/**
 * Soft-delete a personality question by setting isActive to false
 * Requirement 5.5: Soft-delete support (isActive: false)
 * Requirement 12.4: Admin dashboard - delete question functionality
 * Requirement 25.2: Audit trail for admin question deletions
 */
export const deletePersonalityQuestion = mutation({
  args: {
    questionId: v.id("personalityQuestions"),
  },
  handler: async (ctx, args) => {
    // Verify admin authorization
    const admin = await requireAdmin(ctx);
    
    // Get existing question
    const existingQuestion = await ctx.db.get(args.questionId);
    
    if (!existingQuestion) {
      throw new Error("Question not found");
    }
    
    const now = Date.now();
    
    // Soft-delete by setting isActive to false
    await ctx.db.patch(args.questionId, {
      isActive: false,
      updatedAt: now,
    });
    
    // Create audit log entry (Requirement 25.2)
    await ctx.db.insert("auditLog", {
      adminId: admin._id,
      action: "DELETE_QUESTION",
      targetType: "personalityQuestion",
      targetId: args.questionId,
      oldValue: {
        isActive: existingQuestion.isActive,
      },
      newValue: {
        isActive: false,
      },
      timestamp: now,
    });
    
    return {
      success: true,
      questionId: args.questionId,
    };
  },
});

/**
 * Reorder questions by updating their orderIndex values
 * Requirement 5.5: Maintain question ordering that determines sequence
 * Requirement 12.4: Admin dashboard - question reorder functionality
 * Requirement 25.2: Audit trail for admin question reordering
 */
export const reorderPersonalityQuestions = mutation({
  args: {
    questionOrders: v.array(
      v.object({
        questionId: v.id("personalityQuestions"),
        orderIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify admin authorization
    const admin = await requireAdmin(ctx);
    
    // Validate all orderIndex values are non-negative
    for (const order of args.questionOrders) {
      if (order.orderIndex < 0) {
        throw new Error("Validation error: Order index must be non-negative");
      }
    }
    
    const now = Date.now();
    const oldValues: Record<string, number> = {};
    
    // Update each question's orderIndex
    for (const order of args.questionOrders) {
      const existingQuestion = await ctx.db.get(order.questionId);
      
      if (!existingQuestion) {
        throw new Error(`Question not found: ${order.questionId}`);
      }
      
      // Store old value for audit log
      oldValues[order.questionId] = existingQuestion.orderIndex;
      
      // Update orderIndex
      await ctx.db.patch(order.questionId, {
        orderIndex: order.orderIndex,
        updatedAt: now,
      });
    }
    
    // Create audit log entry (Requirement 25.2)
    await ctx.db.insert("auditLog", {
      adminId: admin._id,
      action: "REORDER_QUESTIONS",
      targetType: "personalityQuestion",
      targetId: "bulk",
      oldValue: oldValues,
      newValue: args.questionOrders,
      timestamp: now,
    });
    
    return {
      success: true,
      updatedCount: args.questionOrders.length,
    };
  },
});

/**
 * Submit an answer to a personality question
 * Requirement 6.2: Create personality answer record associated with participant, question, and timestamp
 * Requirement 6.3: Validate only participants with active registrations can submit answers
 * Requirement 6.4: Validate each participant can only submit one answer per question per registration
 * Requirement 22.1: Persist all personality answers to database immediately upon submission
 */
export const submitPersonalityAnswer = mutation({
  args: {
    registrationId: v.id("registrations"),
    questionId: v.id("personalityQuestions"),
    answerValue: v.number(), // 1-5 Likert scale
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Get the registration and validate ownership
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    // Validate participant owns the registration
    if (registration.participantId !== participant._id) {
      throw new Error("Unauthorized: Cannot submit answer for another participant's registration");
    }
    
    // Validate registration is active (Requirement 6.3)
    if (registration.state !== "active") {
      throw new Error(
        `Cannot submit answers: Registration is ${registration.state}. Only active registrations can submit answers.`
      );
    }
    
    // Validate question exists
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Validate answer value is within valid range (1-5 Likert scale)
    if (args.answerValue < 1 || args.answerValue > 5) {
      throw new Error("Validation error: Answer value must be between 1 and 5");
    }
    
    // Check for duplicate answer (Requirement 6.4)
    const existingAnswer = await ctx.db
      .query("personalityAnswers")
      .withIndex("by_registration_and_question", (q) =>
        q.eq("registrationId", args.registrationId).eq("questionId", args.questionId)
      )
      .first();
    
    if (existingAnswer) {
      throw new Error("Duplicate answer: An answer for this question already exists");
    }
    
    // Create the answer with timestamp (Requirement 6.2, 22.1)
    const now = Date.now();
    const answerId = await ctx.db.insert("personalityAnswers", {
      participantId: participant._id,
      registrationId: args.registrationId,
      questionId: args.questionId,
      answerValue: args.answerValue,
      answeredAt: now,
    });
    
    return {
      success: true,
      answerId,
    };
  },
});

/**
 * Get all answers for the current participant for a specific registration
 * Requirement 6.6: Allow participants to view their submitted answers
 * Requirement 15.1: Participants can only access their own answers
 */
export const getMyPersonalityAnswers = query({
  args: {
    registrationId: v.id("registrations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Validate registration ownership
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    if (registration.participantId !== participant._id) {
      throw new Error("Unauthorized: Cannot access answers for another participant's registration");
    }
    
    // Get all answers for this registration
    return await ctx.db
      .query("personalityAnswers")
      .withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId))
      .collect();
  },
});

/**
 * Get test progress for a specific registration
 * Requirement 6.5: Display test progress indicating completed and remaining questions
 */
export const getPersonalityTestProgress = query({
  args: {
    registrationId: v.id("registrations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Validate registration ownership
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    if (registration.participantId !== participant._id) {
      throw new Error("Unauthorized: Cannot access progress for another participant's registration");
    }
    
    // Count total active questions
    const totalQuestions = await ctx.db
      .query("personalityQuestions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Count completed answers for this registration
    const completedAnswers = await ctx.db
      .query("personalityAnswers")
      .withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId))
      .collect();
    
    const total = totalQuestions.length;
    const completed = completedAnswers.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      isComplete: completed >= total && total > 0,
    };
  },
});
