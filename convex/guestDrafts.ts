/**
 * Guest Drafts — registration progress saved before an account exists.
 *
 * The client generates a guestId (kept in localStorage), saves each step
 * here anonymously, then claims the draft once it creates its account.
 * Public read/write is intentional: only the holder of the guestId can
 * touch a draft, and claiming it requires a signed-in participant.
 */

import { v, ConvexError } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

const GUEST_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;

const MAX_LENGTHS = {
  name: 200,
  email: 320,
  phone: 40,
  telegramUsername: 64,
  subRole: 120,
  organization: 200,
  portfolioLink: 500,
} as const;

const basicInfoValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  telegramUsername: v.optional(v.string()),
});

const roleInfoValidator = v.object({
  positionCategory: v.union(
    v.literal("po_ba_business"),
    v.literal("design"),
    v.literal("development"),
    v.literal("project_product_management"),
    v.literal("other")
  ),
  subRole: v.string(),
  experienceYears: v.union(
    v.literal("no_experience"),
    v.literal("less_than_1"),
    v.literal("1_to_3"),
    v.literal("3_and_above")
  ),
  organization: v.optional(v.string()),
  portfolioLink: v.optional(v.string()),
});

const eventPreferencesValidator = v.object({
  preferredTrack: v.union(v.literal("in_person"), v.literal("online")),
  bringLaptop: v.boolean(),
  attendanceCommitment: v.boolean(),
});

function draftError(code: string, message: string) {
  return new ConvexError({ code, message });
}

function assertGuestId(guestId: string): void {
  if (!GUEST_ID_RE.test(guestId)) {
    throw draftError("INVALID_GUEST_ID", "Your saved form could not be loaded. Please start again from step 1.");
  }
}

function assertLength(value: string | undefined, max: number, field: string): void {
  if (value !== undefined && value.length > max) {
    throw draftError("TOO_LONG", `${field} is too long (max ${max} characters).`);
  }
}

function assertBasicInfo(info: { name: string; email: string; phone: string; telegramUsername?: string }): void {
  assertLength(info.name, MAX_LENGTHS.name, "Full name");
  assertLength(info.email, MAX_LENGTHS.email, "Email");
  assertLength(info.phone, MAX_LENGTHS.phone, "Phone number");
  assertLength(info.telegramUsername, MAX_LENGTHS.telegramUsername, "Telegram username");
}

function assertRoleInfo(info: { subRole: string; organization?: string; portfolioLink?: string }): void {
  assertLength(info.subRole, MAX_LENGTHS.subRole, "Sub role");
  assertLength(info.organization, MAX_LENGTHS.organization, "Organization");
  assertLength(info.portfolioLink, MAX_LENGTHS.portfolioLink, "Portfolio link");
}

async function findByGuestId(ctx: QueryCtx | MutationCtx, guestId: string) {
  return await ctx.db
    .query("guestDrafts")
    .withIndex("by_guestId", (q) => q.eq("guestId", guestId))
    .first();
}

/** Read a draft back for the anonymous form (restores progress on reload). */
export const getGuestDraft = query({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    if (!GUEST_ID_RE.test(args.guestId)) return null;
    return await findByGuestId(ctx, args.guestId);
  },
});

/** Upsert one section of the anonymous form. */
export const saveGuestDraft = mutation({
  args: {
    guestId: v.string(),
    basicInfo: v.optional(basicInfoValidator),
    roleInfo: v.optional(roleInfoValidator),
    eventPreferences: v.optional(eventPreferencesValidator),
  },
  handler: async (ctx, args) => {
    assertGuestId(args.guestId);
    if (args.basicInfo) assertBasicInfo(args.basicInfo);
    if (args.roleInfo) assertRoleInfo(args.roleInfo);

    const now = Date.now();
    const existing = await findByGuestId(ctx, args.guestId);

    if (existing) {
      if (existing.claimedBy) {
        throw draftError(
          "ALREADY_CLAIMED",
          "This form is already linked to an account. Sign in to continue editing."
        );
      }
      const patch: Partial<Doc<"guestDrafts">> = { updatedAt: now };
      if (args.basicInfo) patch.basicInfo = args.basicInfo;
      if (args.roleInfo) patch.roleInfo = args.roleInfo;
      if (args.eventPreferences) patch.eventPreferences = args.eventPreferences;
      await ctx.db.patch(existing._id, patch);
      return { draftId: existing._id };
    }

    const insert: Omit<Doc<"guestDrafts">, "_id" | "_creationTime"> = {
      guestId: args.guestId,
      createdAt: now,
      updatedAt: now,
    };
    if (args.basicInfo) insert.basicInfo = args.basicInfo;
    if (args.roleInfo) insert.roleInfo = args.roleInfo;
    if (args.eventPreferences) insert.eventPreferences = args.eventPreferences;
    const draftId = await ctx.db.insert("guestDrafts", insert);
    return { draftId };
  },
});

async function findExistingRegistration(ctx: MutationCtx, participantId: Id<"participants">) {
  return await ctx.db
    .query("buildathonRegistrations")
    .withIndex("by_participant", (q) => q.eq("participantId", participantId))
    .order("desc")
    .first();
}

/**
 * Called right after account creation: turns the anonymous draft into a real
 * registration owned by the signed-in participant.
 */
export const claimGuestDraft = mutation({
  args: { guestId: v.string() },
  handler: async (ctx, args) => {
    assertGuestId(args.guestId);

    const idt = await ctx.auth.getUserIdentity();
    if (!idt) {
      throw draftError("UNAUTHENTICATED", "Please sign in to continue.");
    }
    const participant = await getParticipantByIdentity(ctx, idt);
    if (!participant) {
      throw draftError(
        "PARTICIPANT_NOT_FOUND",
        "Your account is still being set up. Please try again in a moment."
      );
    }

    const existingRegistration = await findExistingRegistration(ctx, participant._id);
    const draft = await findByGuestId(ctx, args.guestId);

    if (draft?.claimedBy && draft.claimedBy !== participant._id) {
      throw draftError("FORBIDDEN", "This form belongs to a different account.");
    }

    if (existingRegistration) {
      if (draft && !draft.claimedBy) {
        await ctx.db.patch(draft._id, { claimedBy: participant._id, updatedAt: Date.now() });
      }
      return { registrationId: existingRegistration._id };
    }

    if (!draft) {
      throw draftError(
        "DRAFT_NOT_FOUND",
        "We could not find your saved answers. Please go back to step 1 and try again."
      );
    }

    const now = Date.now();
    const registrationId = await ctx.db.insert("buildathonRegistrations", {
      participantId: participant._id,
      state: "draft",
      basicInfo: draft.basicInfo
        ? {
            name: draft.basicInfo.name,
            email: draft.basicInfo.email,
            phone: draft.basicInfo.phone,
            telegramUsername: draft.basicInfo.telegramUsername,
          }
        : {
            name: participant.name ?? "",
            email: participant.email,
            phone: "",
          },
      roleInfo: draft.roleInfo,
      eventPreferences: draft.eventPreferences,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(draft._id, { claimedBy: participant._id, updatedAt: now });
    return { registrationId };
  },
});
