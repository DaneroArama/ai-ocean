/**
 * Buildathon Registrations — Google Form aligned schema
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getParticipantByIdentity } from "./helpers";

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
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw new Error("Not found");
    
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
    return await ctx.db.query("buildathonRegistrations")
      .withIndex("by_participant", (q) => q.eq("participantId", p._id))
      .collect();
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
        };
      })
    );
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
