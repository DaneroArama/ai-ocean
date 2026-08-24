import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema for Event Platform
 * 
 * This schema defines all tables for the bilingual event platform with
 * personality testing features. It includes participants, registrations,
 * personality questions and answers, results, archetypes, winners, and
 * audit logging.
 * 
 * Requirements: 3.2, 4.2, 5.1, 5.2, 7.3, 9.2, 14.1, 22.4
 */

export default defineSchema({
  /**
   * Participants table
   * Stores user accounts with OAuth/Auth fields and app-specific profile data
   * Requirement 3.2: Participant authentication and profiles
   */
  participants: defineTable({
    // OAuth/Auth fields (from Convex Auth)
    email: v.string(),
    emailVerified: v.optional(v.number()), // timestamp
    name: v.optional(v.string()), // Full name from OAuth provider
    image: v.optional(v.string()), // Profile picture URL from OAuth provider
    
    // App-specific fields
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    preferredLanguage: v.union(v.literal("en"), v.literal("my")),
    role: v.union(v.literal("participant"), v.literal("admin")),
    
    // Metadata
    createdAt: v.number(), // timestamp
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  /**
   * Registrations table
   * Tracks participant enrollment in events with state management
   * Requirements 4.2, 22.4: Event registration system and data persistence
   */
  registrations: defineTable({
    participantId: v.id("participants"),
    eventId: v.string(), // External event identifier
    state: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    registeredAt: v.number(),
    activatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_participant", ["participantId"])
    .index("by_event", ["eventId"])
    .index("by_participant_and_event", ["participantId", "eventId"])
    .index("by_state", ["state"]),

  /**
   * Personality Questions table
   * Stores bilingual test questions with OCEAN dimension mapping
   * Requirements 5.1, 5.2: Personality question management
   */
  personalityQuestions: defineTable({
    orderIndex: v.number(),
    textEn: v.string(),
    textMy: v.string(),
    oceanDimension: v.union(
      v.literal("openness"),
      v.literal("conscientiousness"),
      v.literal("extraversion"),
      v.literal("agreeableness"),
      v.literal("neuroticism")
    ),
    scoringWeight: v.number(), // -2 to +2 (reverse scored or forward scored)
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderIndex"])
    .index("by_active", ["isActive"])
    .index("by_ocean_dimension", ["oceanDimension"]),

  /**
   * Personality Answers table
   * Stores participant responses to test questions
   * Requirement 7.3: Personality result calculation from stored answers
   */
  personalityAnswers: defineTable({
    participantId: v.id("participants"),
    registrationId: v.id("registrations"),
    questionId: v.id("personalityQuestions"),
    answerValue: v.number(), // 1-5 Likert scale
    answeredAt: v.number(),
  })
    .index("by_participant", ["participantId"])
    .index("by_registration", ["registrationId"])
    .index("by_participant_and_question", ["participantId", "questionId"])
    .index("by_registration_and_question", ["registrationId", "questionId"]),

  /**
   * Personality Results table
   * Stores calculated OCEAN scores and archetype assignments
   * Requirements 7.3, 22.4: Result calculation and persistence
   */
  personalityResults: defineTable({
    participantId: v.id("participants"),
    registrationId: v.id("registrations"),
    opennessScore: v.number(), // 0-100
    conscientiousnessScore: v.number(),
    extraversionScore: v.number(),
    agreeablenessScore: v.number(),
    neuroticismScore: v.number(),
    archetypeId: v.id("archetypes"),
    algorithmVersion: v.string(), // e.g., "v1.0.0"
    calculatedAt: v.number(),
  })
    .index("by_participant", ["participantId"])
    .index("by_registration", ["registrationId"])
    .index("by_archetype", ["archetypeId"]),

  /**
   * Archetypes table
   * Defines personality archetypes with bilingual content and OCEAN score ranges
   * Requirement 9.2: Archetype configuration
   */
  archetypes: defineTable({
    nameEn: v.string(),
    nameMy: v.string(),
    descriptionEn: v.string(),
    descriptionMy: v.string(),
    traitsEn: v.array(v.string()),
    traitsMy: v.array(v.string()),
    // OCEAN score ranges for assignment (0-100 scale)
    opennessMin: v.number(),
    opennessMax: v.number(),
    conscientiousnessMin: v.number(),
    conscientiousnessMax: v.number(),
    extraversionMin: v.number(),
    extraversionMax: v.number(),
    agreeablenessMin: v.number(),
    agreeablenessMax: v.number(),
    neuroticismMin: v.number(),
    neuroticismMax: v.number(),
    priority: v.number(), // Lower number = higher priority for overlapping ranges
    isDefault: v.boolean(), // Fallback archetype
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_priority", ["priority"])
    .index("by_is_default", ["isDefault"]),

  /**
   * Winners table
   * Tracks designated winners for events with publication status
   * Requirement 14.1: Winner announcement system
   */
  winners: defineTable({
    participantId: v.id("participants"),
    eventId: v.string(),
    category: v.optional(v.string()), // e.g., "Best Personality", "Top Score"
    rank: v.optional(v.number()),
    announcedAt: v.number(),
    isPublished: v.boolean(),
    designatedBy: v.id("participants"), // Admin who designated
  })
    .index("by_event", ["eventId"])
    .index("by_participant", ["participantId"])
    .index("by_published", ["isPublished"])
    .index("by_event_and_published", ["eventId", "isPublished"]),

  /**
   * Audit Log table
   * Records all administrative actions for accountability and debugging
   * Requirement 22.4: Admin audit trail
   */
  auditLog: defineTable({
    adminId: v.id("participants"),
    action: v.string(), // e.g., "UPDATE_REGISTRATION_STATE", "CREATE_QUESTION"
    targetType: v.string(), // e.g., "registration", "question"
    targetId: v.string(), // ID of affected entity
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_target_type", ["targetType"])
    .index("by_target_type_and_id", ["targetType", "targetId"]),
});
