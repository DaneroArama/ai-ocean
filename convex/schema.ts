import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
  ...authTables,
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

  // ================================================================
  // Buildathon Role Discovery — New Feature (Feature Brief §2-20)
  // ================================================================

  /**
   * Buildathon Roles table — extensible role ecosystem
   * New Feature §9: Product/Design/Engineering/Data/Business/Team
   */
  buildathonRoles: defineTable({
    nameEn: v.string(),
    nameMy: v.string(),
    descriptionEn: v.string(),
    descriptionMy: v.string(),
    category: v.union(
      v.literal("product"),
      v.literal("design"),
      v.literal("engineering"),
      v.literal("data"),
      v.literal("business"),
      v.literal("team")
    ),
    traitsEn: v.array(v.string()),
    traitsMy: v.array(v.string()),
    priority: v.number(),
    isActive: v.boolean(),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_priority", ["priority"]),

  /**
   * Assessment Versions — v1/v2 reproducibility
   * New Feature §15: Existing results stay on v1 when scoring changes
   */
  assessmentVersions: defineTable({
    version: v.string(), // e.g., "v1"
    questionIds: v.array(v.id("roleDiscoveryQuestions")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_version", ["version"])
    .index("by_active", ["isActive"]),

  /**
   * Role Discovery Questions — hybrid engine, configurable, bilingual
   * New Feature §6: ID/Category/Type/EN/MY/Options/Required/ScoringSignals/Order/Active
   * Types: single|multiple|scenario|scale per §7
   */
  roleDiscoveryQuestions: defineTable({
    phase: v.optional(v.union(v.literal("pre-event"), v.literal("main-event"))),
    category: v.string(),
    type: v.union(
      v.literal("single"),
      v.literal("multiple"),
      v.literal("scenario"),
      v.literal("scale"),
      v.literal("longtext"),
      v.literal("yesno"),
      v.literal("single-with-text")
    ),
    textEn: v.string(),
    textMy: v.string(),
    options: v.array(
      v.object({
        id: v.string(), // stable id, shuffled position keeps identity per §8
        labelEn: v.string(),
        labelMy: v.string(),
      })
    ),
    multiTextCount: v.optional(v.number()), // for "multiple" type: number of text inputs (2-6)
    multiTextPlaceholders: v.optional(v.array(v.string())), // placeholder labels per input
    required: v.boolean(),
    scoringSignals: v.array(
      v.object({
        optionId: v.string(),
        roleId: v.id("buildathonRoles"),
        weight: v.number(), // e.g., +3, +2 per §8 — hidden from participant
      })
    ),
    order: v.number(),
    isActive: v.boolean(),
    version: v.string(), // assessmentVersion
    allowNotSure: v.optional(v.boolean()), // “I'm not sure yet.” per §13
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_category", ["category"])
    .index("by_version", ["version"])
    .index("by_order", ["order"])
    .index("by_version_and_active", ["version", "isActive"])
    .index("by_phase", ["phase"]),

  /**
   * Buildathon Registrations — multi-step flow §3
   * Basic→Background→Interests→Assessment→Recommended→Choice→Preferences→Review→Submit
   * Keeps currentProfession vs interests vs recommended vs selectedRole separate per §4
   * Separate Registration vs Assessment concepts per §14
   */
  buildathonRegistrations: defineTable({
    participantId: v.id("participants"),
    state: v.union(
      v.literal("draft"),
      v.literal("assessment"),
      v.literal("recommended"),
      v.literal("role_selected"),
      v.literal("submitted")
    ),
    // Basic Information per §4
    basicInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      university: v.optional(v.string()),
      organization: v.optional(v.string()),
    }),
    // Background
    background: v.optional(
      v.object({
        currentProfession: v.optional(v.string()),
        occupation: v.optional(v.string()),
        experienceLevel: v.optional(
          v.union(
            v.literal("none"),
            v.literal("student"),
            v.literal("junior"),
            v.literal("mid"),
            v.literal("senior")
          )
        ),
      })
    ),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    preferences: v.optional(
      v.object({
        teamSize: v.optional(v.string()),
        theme: v.optional(v.string()),
        extra: v.optional(v.any()),
      })
    ),
    dynamicResponses: v.optional(v.any()), // pre-event dynamic question responses
    selectedRoleId: v.optional(v.id("buildathonRoles")), // participant decides per §11, never auto-overwritten
    assessmentVersion: v.string(), // e.g., "v1"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant", ["participantId"])
    .index("by_state", ["state"])
    .index("by_selected_role", ["selectedRoleId"])
    .index("by_participant_and_state", ["participantId", "state"])
    .index("by_version", ["assessmentVersion"]),

  /**
   * Role Discovery Answers — per-registration, supports multiple + notSure
   * Includes responseMs for lightweight quality/confidence per §12
   */
  roleDiscoveryAnswers: defineTable({
    registrationId: v.id("buildathonRegistrations"),
    questionId: v.id("roleDiscoveryQuestions"),
    optionIds: v.array(v.string()), // empty if isNotSure
    isNotSure: v.boolean(),
    answeredAt: v.number(),
    responseMs: v.optional(v.number()),
  })
    .index("by_registration", ["registrationId"])
    .index("by_question", ["questionId"])
    .index("by_registration_and_question", ["registrationId", "questionId"]),

  /**
   * Role Recommendations — top3 with % + explanation + confidence
   * New Feature §10/12: “These are possibilities, not labels.” High/Moderate/Low
   */
  roleRecommendations: defineTable({
    registrationId: v.id("buildathonRegistrations"),
    participantId: v.id("participants"),
    rankedRoles: v.array(
      v.object({
        roleId: v.id("buildathonRoles"),
        affinity: v.number(), // 0-100
        explanationEn: v.string(),
        explanationMy: v.string(),
      })
    ),
    confidence: v.union(
      v.literal("high"),
      v.literal("moderate"),
      v.literal("low")
    ),
    confidenceScore: v.number(), // 0-100 internal
    assessmentVersion: v.string(),
    calculatedAt: v.number(),
  })
    .index("by_registration", ["registrationId"])
    .index("by_participant", ["participantId"])
    .index("by_version", ["assessmentVersion"])
    .index("by_confidence", ["confidence"]),

  /**
   * Ocean Archetypes — the 5 personality archetypes (O/C/E/A/N)
   */
  oceanArchetypes: defineTable({
    letter: v.union(v.literal("O"), v.literal("C"), v.literal("E"), v.literal("A"), v.literal("N")),
    name: v.string(), // "The Orchestrator"
    character: v.string(), // "Otto"
    animal: v.string(), // "Octopus"
    emoji: v.string(), // "🐙"
    traitsEn: v.array(v.string()),
    traitsMy: v.array(v.string()),
    mottoEn: v.string(),
    mottoMy: v.string(),
    descriptionEn: v.string(),
    descriptionMy: v.string(),
    wave: v.string(), // "Together"
    tieBreakerStatementEn: v.string(),
    tieBreakerStatementMy: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_letter", ["letter"])
    .index("by_active", ["isActive"]),

  /**
   * Ocean Personality Test Questions — 15 statements (3 per archetype)
   */
  oceanQuestions: defineTable({
    id: v.string(), // "O1", "C2", etc.
    archetypeLetter: v.union(v.literal("O"), v.literal("C"), v.literal("E"), v.literal("A"), v.literal("N")),
    statementEn: v.string(),
    statementMy: v.string(),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_archetype", ["archetypeLetter"])
    .index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  /**
   * Ocean Test Results — stored per participant or guest session
   */
  oceanTestResults: defineTable({
    userType: v.union(v.literal("REGISTERED"), v.literal("GUEST")),
    participantId: v.optional(v.id("participants")),
    sessionId: v.optional(v.string()), // anonymous session for guests
    answers: v.array(v.object({
      questionId: v.string(),
      score: v.number(), // 1-5
    })),
    scores: v.object({
      O: v.number(),
      C: v.number(),
      E: v.number(),
      A: v.number(),
      N: v.number(),
    }),
    finalArchetype: v.union(v.literal("O"), v.literal("C"), v.literal("E"), v.literal("A"), v.literal("N")),
    wasTieBreaker: v.boolean(),
    allSameAnswers: v.boolean(),
    guestName: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    completedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_participant", ["participantId"])
    .index("by_session", ["sessionId"])
    .index("by_userType", ["userType"]),
});
