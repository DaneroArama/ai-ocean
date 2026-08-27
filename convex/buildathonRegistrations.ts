/**
 * Buildathon Registrations — multi-step flow §3 + versioning §15
 * Basic→Background→Interests→Assessment→Recommended→Choice→Preferences→Review→Submit
 * Registration vs Assessment separated §14; selectedRole never auto-overwritten §4
 */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getParticipantByIdentity } from "./helpers";

export const createDraft = mutation({
  args: {
    basicInfo: v.object({ name: v.string(), email: v.string(), phone: v.optional(v.string()), university: v.optional(v.string()), organization: v.optional(v.string()) }),
    assessmentVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("Unauthorized");
    const p = await getParticipantByIdentity(ctx, idt);
    if (!p) throw new Error("Participant not found — ensure profile exists");
    const now = Date.now();
    const version = args.assessmentVersion ?? "v1";
    const regId = await ctx.db.insert("buildathonRegistrations", {
      participantId: p._id, state: "draft", basicInfo: args.basicInfo, assessmentVersion: version, createdAt: now, updatedAt: now,
    });
    return { registrationId: regId };
  },
});

export const updateRegistration = mutation({
  args: {
    registrationId: v.id("buildathonRegistrations"),
    basicInfo: v.optional(v.object({ name: v.string(), email: v.string(), phone: v.optional(v.string()), university: v.optional(v.string()), organization: v.optional(v.string()) })),
    background: v.optional(v.object({ currentProfession: v.optional(v.string()), occupation: v.optional(v.string()), experienceLevel: v.optional(v.union(v.literal("none"), v.literal("student"), v.literal("junior"), v.literal("mid"), v.literal("senior"))) })),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({ teamSize: v.optional(v.string()), theme: v.optional(v.string()), extra: v.optional(v.any()) })),
    dynamicResponses: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { registrationId, ...rest } = args;
    const reg = await ctx.db.get(registrationId);
    if (!reg) throw new Error("Not found");
    const patch: Partial<Doc<"buildathonRegistrations">> = { updatedAt: Date.now() };
    if (rest.basicInfo !== undefined) patch.basicInfo = rest.basicInfo;
    if (rest.background !== undefined) patch.background = rest.background;
    if (rest.interests !== undefined) patch.interests = rest.interests;
    if (rest.skills !== undefined) patch.skills = rest.skills;
    if (rest.preferences !== undefined) patch.preferences = rest.preferences;
    if (rest.dynamicResponses !== undefined) patch.dynamicResponses = rest.dynamicResponses;
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
    return await ctx.db.query("buildathonRegistrations").withIndex("by_participant", (q) => q.eq("participantId", p._id)).collect();
  },
});

export const getRegistrationProgress = query({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Not found");
    const steps = ["basic", "background", "interests", "assessment", "recommended", "choice", "preferences", "review", "submitted"] as const;
    const stateToStep: Record<Doc<"buildathonRegistrations">["state"], number> = { draft: 0, assessment: 3, recommended: 4, role_selected: 6, submitted: 8 };
    const completed = stateToStep[reg.state] ?? 0;
    return { completed, total: steps.length - 1, state: reg.state, selectedRoleId: reg.selectedRoleId ?? null };
  },
});

export const confirmRoleSelection = mutation({
  args: { registrationId: v.id("buildathonRegistrations"), selectedRoleId: v.optional(v.id("buildathonRoles")) },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Not found");
    await ctx.db.patch(args.registrationId, { selectedRoleId: args.selectedRoleId ?? undefined, state: "role_selected", updatedAt: Date.now() });
    return { success: true };
  },
});

export const submitRegistration = mutation({
  args: { registrationId: v.id("buildathonRegistrations") },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.registrationId);
    if (!reg) throw new Error("Not found");
    if (!reg.selectedRoleId) throw new Error("Choose a role before submitting §11");
    await ctx.db.patch(args.registrationId, { state: "submitted", updatedAt: Date.now() });
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
        const selectedRole = reg.selectedRoleId ? await ctx.db.get(reg.selectedRoleId) : null;
        return {
          ...reg,
          participantEmail: participant?.email ?? "—",
          participantRole: participant?.role ?? "—",
          selectedRoleName: selectedRole?.nameEn ?? null,
        };
      })
    );
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
