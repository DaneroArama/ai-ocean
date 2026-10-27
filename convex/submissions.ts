import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin } from "./helpers";

/**
 * Buildathon Submissions for Judges Portal
 * Fetches and stores team submission metadata from GitHub repos
 */

// Fetch submissions from GitHub org (called by admin manually or via cron)
export const syncSubmissionsFromGitHub = mutation({
  args: {
    orgName: v.string(), // e.g., "ai-ocean-buildathon"
  },
  handler: async (ctx, args) => {
    const participant = await requireAdmin(ctx);

    // This would call GitHub API in production
    // For now, return a placeholder response
    return {
      success: true,
      message: "GitHub sync would happen here. In production, use GitHub API or webhook.",
    };
  },
});

// Get all team submissions for judges portal
export const listSubmissions = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Fetch all published submissions
    const submissions = await ctx.db
      .query("buildathonSubmissions")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const team = await ctx.db.get(submission.teamId);
        if (!team) return null;

        // Get team members
        const members = await Promise.all(
          team.memberIds.map((memberId) => ctx.db.get(memberId))
        );

        return {
          _id: submission._id,
          teamCode: team.code,
          teamName: team.name,
          projectName: submission.projectName,
          tagline: submission.tagline,
          description: submission.description,
          pitchDeckUrl: submission.pitchDeckUrl,
          demoVideoUrl: submission.demoVideoUrl,
          liveProductUrl: submission.liveProductUrl,
          githubRepoUrl: submission.githubRepoUrl,
          credentialsUrl: submission.credentialsUrl,
          readmeUrl: submission.readmeUrl,
          badge: team.badge,
          track: team.track,
          members: members.filter(Boolean).map((m) => ({
            name: m?.name || m?.firstName + " " + m?.lastName || "Unknown",
            email: m?.email,
            position: m?.position,
          })),
          submittedAt: submission.submittedAt,
          judgeScores: submission.judgeScores || [],
        };
      })
    );

    return enrichedSubmissions.filter(Boolean);
  },
});

// Public query for judges portal (no authentication required)
export const listPublicSubmissions = query({
  handler: async (ctx) => {
    // Fetch all published submissions (no auth check - public access)
    const submissions = await ctx.db
      .query("buildathonSubmissions")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const team = await ctx.db.get(submission.teamId);
        if (!team) return null;

        // Get team members
        const members = await Promise.all(
          team.memberIds.map((memberId) => ctx.db.get(memberId))
        );

        return {
          _id: submission._id,
          teamCode: team.code,
          teamName: team.name,
          projectName: submission.projectName,
          tagline: submission.tagline,
          description: submission.description,
          pitchDeckUrl: submission.pitchDeckUrl,
          demoVideoUrl: submission.demoVideoUrl,
          liveProductUrl: submission.liveProductUrl,
          githubRepoUrl: submission.githubRepoUrl,
          credentialsUrl: submission.credentialsUrl,
          readmeUrl: submission.readmeUrl,
          badge: team.badge,
          track: team.track,
          members: members.filter(Boolean).map((m) => ({
            name: m?.name || m?.firstName + " " + m?.lastName || "Unknown",
            position: m?.position || null,
          })),
        };
      })
    );

    return enrichedSubmissions.filter(Boolean);
  },
});

// Manual submission data entry (for teams that submitted via forms/email)
export const createSubmission = mutation({
  args: {
    teamId: v.id("teams"),
    projectName: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    pitchDeckUrl: v.optional(v.string()),
    demoVideoUrl: v.optional(v.string()),
    liveProductUrl: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    credentialsUrl: v.optional(v.string()),
    readmeUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const participant = await requireAdmin(ctx);

    const now = Date.now();
    
    const submissionId = await ctx.db.insert("buildathonSubmissions", {
      teamId: args.teamId,
      projectName: args.projectName,
      tagline: args.tagline,
      description: args.description,
      pitchDeckUrl: args.pitchDeckUrl,
      demoVideoUrl: args.demoVideoUrl,
      liveProductUrl: args.liveProductUrl,
      githubRepoUrl: args.githubRepoUrl,
      credentialsUrl: args.credentialsUrl,
      readmeUrl: args.readmeUrl,
      submittedAt: now,
      submittedBy: participant._id,
      lastUpdatedAt: now,
      isPublished: args.isPublished ?? true,
    });

    return submissionId;
  },
});

// Update an existing submission
export const updateSubmission = mutation({
  args: {
    submissionId: v.id("buildathonSubmissions"),
    projectName: v.optional(v.union(v.string(), v.null())),
    tagline: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    pitchDeckUrl: v.optional(v.union(v.string(), v.null())),
    demoVideoUrl: v.optional(v.union(v.string(), v.null())),
    liveProductUrl: v.optional(v.union(v.string(), v.null())),
    githubRepoUrl: v.optional(v.union(v.string(), v.null())),
    credentialsUrl: v.optional(v.union(v.string(), v.null())),
    readmeUrl: v.optional(v.union(v.string(), v.null())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { submissionId, ...updates } = args;
    
    // Convert null to undefined for storage
    const updateData: any = {
      lastUpdatedAt: Date.now(),
    };

    // Only include fields that were actually provided in the request
    if ('projectName' in args) updateData.projectName = args.projectName || undefined;
    if ('tagline' in args) updateData.tagline = args.tagline || undefined;
    if ('description' in args) updateData.description = args.description || undefined;
    if ('pitchDeckUrl' in args) updateData.pitchDeckUrl = args.pitchDeckUrl || undefined;
    if ('demoVideoUrl' in args) updateData.demoVideoUrl = args.demoVideoUrl || undefined;
    if ('liveProductUrl' in args) updateData.liveProductUrl = args.liveProductUrl || undefined;
    if ('githubRepoUrl' in args) updateData.githubRepoUrl = args.githubRepoUrl || undefined;
    if ('credentialsUrl' in args) updateData.credentialsUrl = args.credentialsUrl || undefined;
    if ('readmeUrl' in args) updateData.readmeUrl = args.readmeUrl || undefined;
    if ('isPublished' in args) updateData.isPublished = args.isPublished;
    
    await ctx.db.patch(submissionId, updateData);

    return submissionId;
  },
});
