/**
 * Participant Authentication Queries and Mutations
 * 
 * Provides participant profile management with role-based authorization.
 * Requirements: 3.2, 3.3, 3.7, 15.4, 26.3
 */

import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Get the current authenticated participant's profile
 * Requirement 3.2: Participant authentication and profiles
 * Requirement 3.7: Session management
 */
export const getCurrentParticipant = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Use tokenIdentifier as the canonical stable identifier
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    return participant;
  },
});

/**
 * Get a participant by ID with authorization check
 * Requirement 15.4: Authorization rules - participants can only view their own profile or admins can view any
 */
export const getParticipantById = query({
  args: { 
    participantId: v.id("participants") 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant
    const currentParticipant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!currentParticipant) {
      throw new Error("Unauthorized: Participant not found");
    }
    
    // Check authorization: only allow viewing own profile or admin viewing any
    const isViewingOwnProfile = currentParticipant._id === args.participantId;
    const isAdmin = currentParticipant.role === "admin";
    
    if (!isViewingOwnProfile && !isAdmin) {
      throw new Error("Unauthorized: Cannot access other participant's profile");
    }
    
    // Fetch and return the requested participant
    const participant = await ctx.db.get(args.participantId);
    
    if (!participant) {
      return null;
    }
    
    return participant;
  },
});

/**
 * Update participant profile
 * Requirement 3.2: Participant authentication and profiles
 * Requirement 15.4: Authorization rules - participants can only update their own profile
 */
export const updateParticipantProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    preferredLanguage: v.optional(v.union(v.literal("en"), v.literal("my"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant
    const currentParticipant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!currentParticipant) {
      throw new Error("Participant not found");
    }
    
    // Build update object with only provided fields
    const updates: Partial<Omit<Doc<"participants">, "_id" | "_creationTime">> = {};
    
    if (args.firstName !== undefined) {
      updates.firstName = args.firstName;
    }
    if (args.lastName !== undefined) {
      updates.lastName = args.lastName;
    }
    if (args.preferredLanguage !== undefined) {
      updates.preferredLanguage = args.preferredLanguage;
    }
    
    // Update the participant profile
    await ctx.db.patch(currentParticipant._id, updates);
    
    return {
      success: true,
      participantId: currentParticipant._id,
    };
  },
});

/**
 * Update lastLoginAt timestamp for a participant
 * Requirement 3.7: Session management with lastLoginAt tracking
 * Requirement 26.3: Session security with activity tracking
 * 
 * This is an internal mutation called during authentication flow
 */
export const updateLastLoginAt = internalMutation({
  args: {
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.participantId, {
      lastLoginAt: now,
    });
    
    return {
      success: true,
      lastLoginAt: now,
    };
  },
});

/**
 * Authorization Helper: Check if current user is an admin
 * Requirement 15.4: Role-based authorization
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    return participant?.role === "admin";
  },
});

/**
 * Authorization Helper: Check if current user is a participant (authenticated)
 * Requirement 15.4: Role-based authorization
 */
export const isParticipant = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    return participant !== null;
  },
});

/**
 * Get current participant's role
 * Useful for UI to determine what features to show
 * Requirement 15.4: Role-based authorization
 */
export const getCurrentParticipantRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    return participant?.role ?? null;
  },
});
