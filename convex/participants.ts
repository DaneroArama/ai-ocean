/**
 * Participant Authentication Queries and Mutations
 *
 * Provides participant profile management with role-based authorization.
 * Requirements: 3.2, 3.3, 3.7, 15.4, 26.3
 */

import {v} from "convex/values";
import {action, internalMutation, internalQuery, mutation, query} from "./_generated/server";
import {Doc} from "./_generated/dataModel";
import {internal} from "./_generated/api";
import {
  getAuthSessionId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import {AuthIdentity, getEmailFromIdentity, NOT_ON_ROSTER} from "./helpers";

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
 * Link the authenticated identity to its roster entry.
 * Only emails already on the roster (participants table) may proceed —
 * the profile is never created here (see convex/auth.ts callbacks).
 */
export const ensureCurrentParticipant = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Please sign in again.");

    const idt = identity as AuthIdentity;
    const email = (idt.email ?? idt.emailAddress ?? "").trim().toLowerCase();
    if (!email) throw new Error(NOT_ON_ROSTER);
    const name = idt.name ?? null;
    const image = idt.picture ?? idt.image ?? null;

    const existing = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!existing) throw new Error(NOT_ON_ROSTER);

    await ctx.db.patch(existing._id, {
      lastLoginAt: Date.now(),
      ...(name ? { name } : {}),
      ...(image ? { image } : {}),
    });
    return existing._id;
  },
});

/**
 * Only existing admins may promote participants. Local admins are seeded internally.
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

    const targetEmail = (args.email ?? callerEmail).trim().toLowerCase();
    const target = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", targetEmail)).first();
    if (!target) throw new Error("Participant not found for " + targetEmail);

    const caller = await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", callerEmail.trim().toLowerCase())).first();
    if (caller?.role !== "admin") throw new Error("Admin required to promote participants");

    await ctx.db.patch(target._id, { role: "admin" });
    return { success: true, email: targetEmail };
  },
});

/**
 * One-shot CLI bootstrap for a deployment with zero admins:
 *   npx convex run participants:bootstrapAdmin '{"email":"admin@example.com"}'
 * Promotes an existing roster email. Once any admin exists, this refuses.
 */
export const bootstrapAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const anyAdmin = await ctx.db
      .query("participants")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
    if (anyAdmin)
      throw new Error(
        "An admin already exists. Use promoteToAdmin from an admin account instead.",
      );
    const email = args.email.trim().toLowerCase();
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!participant)
      throw new Error(
        "That email is not on the roster. Import the roster first.",
      );
    await ctx.db.patch(participant._id, { role: "admin" });
    return { success: true, email };
  },
});

/** Roster context for the signed-in user's password account (used by changePassword). */
export const passwordAccountEmail = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Please sign in.");
    const email = (await getEmailFromIdentity(ctx, identity as AuthIdentity))
      ?.trim()
      .toLowerCase();
    if (!email) throw new Error(NOT_ON_ROSTER);
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!participant) throw new Error(NOT_ON_ROSTER);
    return { email };
  },
});

/**
 * Change the caller's password (participants who activated with the shared
 * event password). Verifies the current password, sets the new one, and signs
 * out every other session.
 */
export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const { email } = await ctx.runQuery(
      internal.participants.passwordAccountEmail,
      {},
    );
    if (!args.currentPassword || !args.newPassword)
      throw new Error("Enter your current password and a new password.");
    if (args.newPassword.length < 8)
      throw new Error("New password must be at least 8 characters.");
    if (args.newPassword === args.currentPassword)
      throw new Error(
        "The new password must be different from your current password.",
      );
    const shared = process.env.ROSTER_SHARED_PASSWORD;
    if (shared && args.newPassword === shared)
      throw new Error(
        "Choose a personal password, not the shared event password.",
      );
    const account = await retrieveAccount(ctx, {
      provider: "password",
      account: { id: email, secret: args.currentPassword },
    });
    if (account === null)
      throw new Error("Your current password is incorrect.");
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: email, secret: args.newPassword },
    });
    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, {
      userId: account.user._id,
      except: sessionId ? [sessionId] : [],
    });
    return { success: true };
  },
});
