/**
 * Registration Queries and Mutations
 * 
 * Provides registration management with state machine validation,
 * duplicate prevention, and admin authorization with audit logging.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 13.1, 13.2, 13.6, 25.1
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Get all registrations for the current authenticated participant
 * Requirement 4.6: Participants can only query their own registrations
 */
export const getMyRegistrations = query({
  args: {},
  handler: async (ctx) => {
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
    
    // Return all registrations for this participant
    return await ctx.db
      .query("registrations")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .collect();
  },
});

/**
 * Get a specific registration by ID with ownership validation
 * Requirement 4.3: Validate requesting participant matches registration owner
 * Requirement 15.4: Authorization - own registration or admin access
 */
export const getRegistrationById = query({
  args: { 
    registrationId: v.id("registrations") 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get the registration
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      return null;
    }
    
    // Get current participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!participant) {
      throw new Error("Participant not found");
    }
    
    // Authorization: own registration or admin
    const isOwner = registration.participantId === participant._id;
    const isAdmin = participant.role === "admin";
    
    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized: Cannot access other participant's registration");
    }
    
    return registration;
  },
});

/**
 * Create a new registration with duplicate prevention
 * Requirement 4.1: Create registration with initial state "pending"
 * Requirement 4.2: Associate registration with participant and event
 * Requirement 4.5: Prevent duplicate registrations for same event
 */
export const createRegistration = mutation({
  args: {
    eventId: v.string(),
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
    
    // Check for duplicate registration (Requirement 4.5)
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_participant_and_event", (q) => 
        q.eq("participantId", participant._id).eq("eventId", args.eventId)
      )
      .first();
    
    if (existingRegistration) {
      throw new Error("Registration already exists for this event");
    }
    
    // Create new registration with "pending" state (Requirement 4.1)
    const now = Date.now();
    const registrationId = await ctx.db.insert("registrations", {
      participantId: participant._id,
      eventId: args.eventId,
      state: "pending",
      registeredAt: now,
    });
    
    return {
      success: true,
      registrationId,
    };
  },
});

/**
 * Valid state transitions for registration state machine
 * Requirement 13.1: State transition validation
 */
const VALID_STATE_TRANSITIONS: Record<
  Doc<"registrations">["state"],
  Doc<"registrations">["state"][]
> = {
  pending: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [], // Terminal state - no transitions allowed
  cancelled: [], // Terminal state - no transitions allowed
};

/**
 * Update registration state with admin authorization and audit logging
 * Requirement 13.1: Validate state transitions (pending→active, active→completed, active→cancelled)
 * Requirement 13.2: Only authorized admins can modify registration state
 * Requirement 13.6: Record timestamps for all state transitions
 * Requirement 25.1: Audit logging for admin actions
 */
export const updateRegistrationState = mutation({
  args: {
    registrationId: v.id("registrations"),
    newState: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    // Get current participant (must be admin - Requirement 13.2)
    const admin = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!admin) {
      throw new Error("Participant not found");
    }
    
    if (admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
    // Get the registration
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    const oldState = registration.state;
    const newState = args.newState;
    
    // Validate state transition (Requirement 13.1)
    const validTransitions = VALID_STATE_TRANSITIONS[oldState];
    if (!validTransitions.includes(newState)) {
      throw new Error(
        `Invalid state transition: cannot transition from "${oldState}" to "${newState}"`
      );
    }
    
    // Prepare update with timestamp (Requirement 13.6)
    const now = Date.now();
    const updates: Partial<Doc<"registrations">> = {
      state: newState,
    };
    
    // Set appropriate timestamp based on new state
    if (newState === "active") {
      updates.activatedAt = now;
    } else if (newState === "completed") {
      updates.completedAt = now;
    } else if (newState === "cancelled") {
      updates.cancelledAt = now;
    }
    
    // Update the registration
    await ctx.db.patch(args.registrationId, updates);
    
    // Create audit log entry (Requirement 25.1)
    await ctx.db.insert("auditLog", {
      adminId: admin._id,
      action: "UPDATE_REGISTRATION_STATE",
      targetType: "registration",
      targetId: args.registrationId,
      oldValue: { state: oldState },
      newValue: { state: newState },
      timestamp: now,
    });
    
    return {
      success: true,
      oldState,
      newState,
      registrationId: args.registrationId,
    };
  },
});
