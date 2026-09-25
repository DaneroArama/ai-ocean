/**
 * Buildathon Registrations — Google Form aligned schema
 */
import { v, ConvexError } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

/** Max receipt size accepted by the app (matches the client-side 10 MB limit). */
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
/**
 * Convex values must stay under 1 MiB, so an inline (legacy base64) receipt
 * can never be larger than this. Storage-backed receipts only need to be a
 * short storage id, so the same guard covers both representations.
 */
const MAX_RECEIPT_VALUE_CHARS = 900_000;

function receiptError(code: string, message: string) {
  return new ConvexError({ code, message });
}

/**
 * Validate a receipt value before writing it into a document.
 * New receipts are Convex storage ids; older records may hold inline data URLs.
 */
async function assertReceiptValue(ctx: MutationCtx, receipt: string): Promise<void> {
  if (receipt.length > MAX_RECEIPT_VALUE_CHARS) {
    throw receiptError(
      "RECEIPT_TOO_LARGE",
      "Payment receipt is too large. Please upload a file smaller than 10 MB."
    );
  }
  if (receipt === "" || receipt.startsWith("data:") || receipt.startsWith("http")) {
    return;
  }
  const meta = (await ctx.db.system.get("_storage", receipt as Id<"_storage">)) as unknown as {
    size?: number;
    contentType?: string | null;
  } | null;
  if (!meta) {
    throw receiptError(
      "RECEIPT_NOT_FOUND",
      "The uploaded receipt could not be found. Please upload it again."
    );
  }
  if (typeof meta.size === "number" && meta.size > MAX_RECEIPT_BYTES) {
    try {
      await ctx.storage.delete(receipt as Id<"_storage">);
    } catch {
      // best effort — the file is rejected either way
    }
    throw receiptError(
      "RECEIPT_TOO_LARGE",
      "Payment receipt is too large. The maximum allowed size is 10 MB."
    );
  }
  const contentType = meta.contentType;
  if (contentType && !contentType.startsWith("image/") && contentType !== "application/pdf") {
    throw receiptError(
      "RECEIPT_UNSUPPORTED_TYPE",
      "Unsupported file type. Please upload an image (PNG/JPG) or a PDF."
    );
  }
}

/** Signed URL + content type for a stored (or legacy inline) receipt. */
export type ReceiptFile = { url: string; contentType: string | null };

async function resolveReceipt(ctx: QueryCtx, receipt: string | undefined): Promise<ReceiptFile | null> {
  if (!receipt) return null;
  if (receipt.startsWith("data:")) {
    const mime = receipt.slice(5).split(";")[0] || null;
    return { url: receipt, contentType: mime };
  }
  if (receipt.startsWith("http")) {
    return { url: receipt, contentType: receipt.toLowerCase().includes(".pdf") ? "application/pdf" : null };
  }
  try {
    const url = await ctx.storage.getUrl(receipt as Id<"_storage">);
    if (!url) return null;
    const meta = (await ctx.db.system.get("_storage", receipt as Id<"_storage">)) as unknown as {
      contentType?: string | null;
    } | null;
    return { url, contentType: meta?.contentType ?? null };
  } catch {
    return null;
  }
}

/** Generate a short-lived URL the client POSTs the receipt file to. */
export const generateReceiptUploadUrl = mutation({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw receiptError("UNAUTHENTICATED", "Please sign in again to upload a receipt.");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) {
      throw receiptError("PARTICIPANT_NOT_FOUND", "Your profile is still being created. Please try again in a moment.");
    }
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) {
      throw receiptError("NOT_FOUND", "Registration not found. Please refresh the page and try again.");
    }
    if (reg.participantId !== p._id && p.role !== "admin") {
      throw receiptError("FORBIDDEN", "You can only upload a receipt for your own registration.");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const createDraft = mutation({
  args: {
    basicInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      telegramUsername: v.optional(v.string()),
      organization: v.optional(v.string()),
      university: v.optional(v.string()),
    }),
    roleInfo: v.object({
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
    }),
    eventPreferences: v.object({
      preferredTrack: v.union(v.literal("in_person"), v.literal("online")),
      bringLaptop: v.boolean(),
      attendanceCommitment: v.boolean(),
    }),
    payment: v.object({
      method: v.union(
        v.literal("mmqr"),
        v.literal("aya_pay"),
        v.literal("cb_pay"),
        v.literal("kbz_pay"),
        v.literal("wave_money"),
        v.literal("ctzpay")
      ),
      receipt: v.string(),
      discountCode: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) throw new Error("Participant not found");
    await assertReceiptValue(ctx, args.payment.receipt);
    const now = Date.now();
    const regId = await ctx.db.insert("buildathonRegistrations", {
      participantId: p._id,
      state: "draft",
      basicInfo: args.basicInfo,
      roleInfo: args.roleInfo,
      eventPreferences: args.eventPreferences,
      payment: args.payment,
      createdAt: now,
      updatedAt: now,
    });
    return { registrationId: regId };
  },
});

export const updateRegistration = mutation({
  args: {
    registrationId: v.id("buildathonRegistrations"),
    basicInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      telegramUsername: v.optional(v.string()),
      organization: v.optional(v.string()),
      university: v.optional(v.string()),
    })),
    roleInfo: v.optional(v.object({
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
    })),
    eventPreferences: v.optional(v.object({
      preferredTrack: v.union(v.literal("in_person"), v.literal("online")),
      bringLaptop: v.boolean(),
      attendanceCommitment: v.boolean(),
    })),
    payment: v.optional(v.object({
      method: v.union(
        v.literal("mmqr"),
        v.literal("aya_pay"),
        v.literal("cb_pay"),
        v.literal("kbz_pay"),
        v.literal("wave_money"),
        v.literal("ctzpay")
      ),
      receipt: v.string(),
      discountCode: v.optional(v.string()),
    })),
    paymentReceipt: v.optional(v.string()),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    const { registrationId, ...rest } = args;
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw receiptError("UNAUTHENTICATED", "Please sign in again to save your registration.");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) {
      throw receiptError("PARTICIPANT_NOT_FOUND", "Your profile is still being created. Please try again in a moment.");
    }
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw receiptError("NOT_FOUND", "Registration not found. Please refresh the page and try again.");
    if (reg.participantId !== p._id && p.role !== "admin") {
      throw receiptError("FORBIDDEN", "You can only update your own registration.");
    }
    if (rest.payment?.receipt !== undefined) {
      await assertReceiptValue(ctx, rest.payment.receipt);
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    
    if (rest.basicInfo !== undefined) patch.basicInfo = rest.basicInfo;
    if (rest.roleInfo !== undefined) patch.roleInfo = rest.roleInfo;
    if (rest.eventPreferences !== undefined) patch.eventPreferences = rest.eventPreferences;
    if (rest.payment !== undefined) patch.payment = rest.payment;
    if (rest.paymentStatus !== undefined) patch.paymentStatus = rest.paymentStatus;
    
    await ctx.db.patch(registrationId, patch);
    return { success: true };
  },
});

export const getMyBuildathonRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) return [];
    const regs = await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", p._id))
      .collect();
    return await Promise.all(
      regs.map(async (reg) => ({
        ...reg,
        receiptFile: await resolveReceipt(ctx, reg.payment?.receipt),
      }))
    );
  },
});

export const submitRegistration = mutation({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Not found");
    await ctx.db.patch(args.registrationId, { state: "submitted", updatedAt: Date.now() });
    return { success: true };
  },
});

export const updatePaymentStatus = mutation({
  args: { 
    registrationId: v.id("buildathonRegistrations"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");
    
    await ctx.db.patch(args.registrationId, { 
      paymentStatus: args.status, 
      updatedAt: Date.now() 
    });
    return { success: true };
  },
});

export const listAllRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const admin = await getParticipantByIdentity(ctx, idt);
    if (!admin || admin.role !== "admin") throw new Error("Admin required");

    const regs = await ctx.db.query("buildathonRegistrations").collect();
    const results = await Promise.all(
      regs.map(async (reg) => {
        const participant = await ctx.db.get(reg.participantId);
        return {
          ...reg,
          participantEmail: participant?.email ?? "—",
          receiptFile: await resolveReceipt(ctx, reg.payment?.receipt),
        };
      })
    );
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
