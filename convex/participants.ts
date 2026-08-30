/**
 * Participant Authentication Queries and Mutations
 *
 * Provides participant profile management with role-based authorization.
 * Requirements: 3.2, 3.3, 3.7, 15.4, 26.3
 */

import {v} from "convex/values";
import {internalMutation, mutation, query} from "./_generated/server";
import {Doc} from "./_generated/dataModel";
import {AuthIdentity, getEmailFromIdentity} from "./helpers";

/**
 * Get the current authenticated participant's profile
 * Requirement 3.2: Participant authentication and profiles
 * Requirement 3.7: Session management
 */
export const getCurrentParticipant = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) return null;
    return await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();
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
    if (!identity) throw new Error("Unauthorized: Authentication required");
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) throw new Error("Unauthorized: Participant not found");
    const currentParticipant = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();

    if (!currentParticipant) {
      throw new Error("Unauthorized: Participant not found");
    }

    const isViewingOwnProfile = currentParticipant._id === args.participantId;
    const isAdmin = currentParticipant.role === "admin";

    if (!isViewingOwnProfile && !isAdmin) {
      throw new Error("Unauthorized: Cannot access other participant's profile");
    }

    const participant = await ctx.db.get(args.participantId);
    if (!participant) return null;
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
    if (!identity) throw new Error("Unauthorized: Authentication required");
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) throw new Error("Participant not found");
    const currentParticipant = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();

    if (!currentParticipant) {
      throw new Error("Participant not found");
    }

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
    if (!identity) return false;
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) return false;
    const participant = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();
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
    if (!identity) return false;
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) return false;
    const participant = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();
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
    if (!identity) return null;
    const email = await getEmailFromIdentity(ctx, identity as AuthIdentity);
    if (!email) return null;
    const participant = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();
    return participant?.role ?? null;
  },
});

/**
 * Ensure participant doc exists for authenticated identity — called right after OAuth
 * First ever participant becomes admin, rest default to participant
 */
export const ensureCurrentParticipant = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized: no identity — try sign out, clear site data for localhost:3000 + https://wandering-sturgeon-242.convex.site, then sign in again (JWT keys rotated)");

    const idt = identity as AuthIdentity;
    let email: string | null = idt.email ?? idt.emailAddress ?? null;

    if (!email) {
      const rawSubject = idt.subject;
      const userId = rawSubject?.split("|")[0];
      if (userId) {
        try {
          const authUser = await ctx.db.get(userId as Doc<"users">["_id"]);
            if (authUser && "email" in authUser && typeof (authUser as { email?: unknown }).email === "string") {
              email = (authUser as { email: string }).email;
            } else {
              const users = await ctx.db.query("users").collect();
              const match = users.find((u) => u._id === userId || idt.tokenIdentifier?.includes(u._id));
              if (match && "email" in match && typeof (match as { email?: unknown }).email === "string") {
                email = (match as { email: string }).email;
              }
          }
        } catch (e) {
          console.log("users lookup failed", e);
        }
      }
    }
    if (!email) throw new Error(`Unauthorized: identity has no email — check users table has email for subject`);

    const existing = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastLoginAt: Date.now(),
        name: idt.name ?? existing.name,
        image: idt.picture ?? idt.image ?? existing.image,
      });
      return existing._id;
    }

    const anyAdmin = await ctx.db.query("participants").withIndex("by_role", (q) => q.eq("role", "admin")).first();
    const role = anyAdmin ? "participant" : "admin";
    const now = Date.now();
    return await ctx.db.insert("participants", {
      email: email,
      name: idt.name,
      image: idt.picture ?? idt.image,
      preferredLanguage: "en",
      role: role as "participant" | "admin",
      createdAt: now,
      lastLoginAt: now,
    });
  },
});

/**
 * Dev helper — promote current participant to admin (admin can promote others)
 */
export const promoteToAdmin = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const idt = identity as AuthIdentity;
    let callerEmail: string | null = idt.email ?? null;
    if (!callerEmail) {
      const sub = idt.subject;
      const uid = sub?.split("|")[0];
      if (uid) {
        try {
          const u = await ctx.db.get(uid as Doc<"users">["_id"]);
          if (u && "email" in u && typeof (u as { email?: unknown }).email === "string") {
            callerEmail = (u as { email: string }).email;
          }
        } catch {}
        if (!callerEmail) {
          const users = await ctx.db.query("users").collect();
          const m = users.find((u) => u._id === uid);
          if (m && "email" in m && typeof (m as { email?: unknown }).email === "string") {
            callerEmail = (m as { email: string }).email;
          }
        }
      }
    }
    if (!callerEmail) throw new Error("Unauthorized: no email for caller");

    const targetEmail = args.email ?? callerEmail;
    const target = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", targetEmail)).first();
    if (!target) throw new Error("Participant not found for " + targetEmail);

    const isSelf = targetEmail.toLowerCase() === callerEmail.toLowerCase();
    if (!isSelf) {
      const anyAdmin = await ctx.db.query("participants").withIndex("by_role", (q) => q.eq("role", "admin")).first();
      const caller = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", callerEmail)).first();
      if (anyAdmin && caller?.role !== "admin") throw new Error("Admin required to promote others");
    }

    await ctx.db.patch(target._id, { role: "admin" });
    return { success: true, email: targetEmail };
  },
});
