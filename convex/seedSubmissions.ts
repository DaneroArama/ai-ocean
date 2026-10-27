import { mutation } from "./_generated/server";
import { requireAdmin } from "./helpers";

/**
 * Seed buildathon submissions with sample data from Teams.md
 * Run from Convex dashboard: seedSubmissions:seed
 */

export const seed = mutation({
  handler: async (ctx) => {
    const participant = await requireAdmin(ctx);

    // Get teams by code
    const teams = await ctx.db.query("teams").collect();
    const teamsByCode = new Map(teams.map((t) => [t.code, t]));

    const now = Date.now();

    // Sample submissions data
    const sampleSubmissions = [
      {
        teamCode: "AI01",
        projectName: "ResumeMate AI",
        tagline: "Smart resume builder powered by AI",
        description:
          "ResumeMate AI helps job seekers create professional, ATS-optimized resumes in minutes. Using natural language processing and machine learning, it analyzes job descriptions and tailors your resume to match employer requirements. Features include real-time suggestions, template library, and export to multiple formats.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai01",
        demoVideoUrl: "https://youtu.be/sample-ai01",
        liveProductUrl: "https://resumemate-ai01.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai01-resumemate",
        credentialsUrl:
          "https://github.com/ai-ocean-buildathon/ai01-resumemate/blob/main/CREDENTIALS.md",
        readmeUrl:
          "https://github.com/ai-ocean-buildathon/ai01-resumemate/blob/main/README.md",
      },
      {
        teamCode: "AI02",
        projectName: "MediTrack",
        tagline: "Healthcare appointment management reimagined",
        description:
          "MediTrack is a comprehensive healthcare platform that connects patients with doctors through intelligent scheduling. The system uses AI to predict optimal appointment times, sends automated reminders, and maintains secure medical records. Includes telemedicine capabilities and prescription management.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai02",
        demoVideoUrl: "https://youtu.be/sample-ai02",
        liveProductUrl: "https://meditrack-ai02.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai02-meditrack",
        credentialsUrl:
          "https://github.com/ai-ocean-buildathon/ai02-meditrack/blob/main/CREDENTIALS.md",
      },
      {
        teamCode: "AI03",
        projectName: "EduPath",
        tagline: "Personalized learning journey for every student",
        description:
          "EduPath leverages adaptive learning algorithms to create personalized study plans for students. The platform tracks progress, identifies knowledge gaps, and recommends resources tailored to each learner's pace and style. Features include interactive quizzes, progress analytics, and collaborative study groups.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai03",
        demoVideoUrl: "https://youtu.be/sample-ai03",
        liveProductUrl: "https://edupath-ai03.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai03-edupath",
      },
      {
        teamCode: "AI04",
        projectName: "GreenThumb",
        tagline: "AI-powered plant care assistant",
        description:
          "GreenThumb uses computer vision and machine learning to help users care for their plants. Simply take a photo to identify plant species, diagnose diseases, and receive personalized care schedules. The app tracks watering needs, sunlight exposure, and growth patterns.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai04",
        demoVideoUrl: "https://youtu.be/sample-ai04",
        liveProductUrl: "https://greenthumb-ai04.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai04-greenthumb",
        credentialsUrl:
          "https://github.com/ai-ocean-buildathon/ai04-greenthumb/blob/main/CREDENTIALS.md",
      },
      {
        teamCode: "AI05",
        projectName: "LocalBiz Connect",
        tagline: "Bridging local businesses with their community",
        description:
          "LocalBiz Connect is a hyperlocal marketplace that helps small businesses reach nearby customers. The platform features AI-powered recommendations, location-based promotions, and integrated payment solutions. Businesses can manage inventory, track sales, and engage with customers through the merchant dashboard.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai05",
        demoVideoUrl: "https://youtu.be/sample-ai05",
        liveProductUrl: "https://localbiz-ai05.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai05-localbiz",
      },
      {
        teamCode: "AI07",
        projectName: "SkillSwap",
        tagline: "Learn by teaching, teach by learning",
        description:
          "SkillSwap is a peer-to-peer learning platform where users exchange skills through video sessions. The matching algorithm connects learners based on complementary skills and availability. Features include scheduling, video calls, progress tracking, and community reviews.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai07",
        demoVideoUrl: "https://youtu.be/sample-ai07",
        liveProductUrl: "https://skillswap-ai07.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai07-skillswap",
        credentialsUrl:
          "https://github.com/ai-ocean-buildathon/ai07-skillswap/blob/main/CREDENTIALS.md",
      },
      {
        teamCode: "AI08",
        projectName: "EventHub",
        tagline: "Discover and create unforgettable experiences",
        description:
          "EventHub makes event discovery and management seamless. Attendees can find events based on interests, location, and social connections, while organizers get tools for ticketing, check-in, and analytics. The platform uses ML to suggest relevant events and predict attendance patterns.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai08",
        demoVideoUrl: "https://youtu.be/sample-ai08",
        liveProductUrl: "https://eventhub-ai08.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai08-eventhub",
      },
      {
        teamCode: "AI09",
        projectName: "BudgetWise",
        tagline: "Smart money management for everyone",
        description:
          "BudgetWise is a personal finance app that uses AI to categorize transactions, track spending patterns, and provide actionable insights. Users can set savings goals, receive alerts for unusual spending, and get personalized tips to improve financial health. Supports multiple currencies and bank integrations.",
        pitchDeckUrl: "https://docs.google.com/presentation/d/sample-ai09",
        demoVideoUrl: "https://youtu.be/sample-ai09",
        liveProductUrl: "https://budgetwise-ai09.vercel.app",
        githubRepoUrl: "https://github.com/ai-ocean-buildathon/ai09-budgetwise",
        credentialsUrl:
          "https://github.com/ai-ocean-buildathon/ai09-budgetwise/blob/main/CREDENTIALS.md",
      },
    ];

    const createdSubmissions = [];

    for (const submission of sampleSubmissions) {
      const team = teamsByCode.get(submission.teamCode);
      if (!team) {
        console.log(`Team ${submission.teamCode} not found, skipping...`);
        continue;
      }

      // Check if submission already exists
      const existing = await ctx.db
        .query("buildathonSubmissions")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .first();

      if (existing) {
        console.log(`Submission for ${submission.teamCode} already exists, skipping...`);
        continue;
      }

      const submissionId = await ctx.db.insert("buildathonSubmissions", {
        teamId: team._id,
        projectName: submission.projectName,
        tagline: submission.tagline,
        description: submission.description,
        pitchDeckUrl: submission.pitchDeckUrl,
        demoVideoUrl: submission.demoVideoUrl,
        liveProductUrl: submission.liveProductUrl,
        githubRepoUrl: submission.githubRepoUrl,
        credentialsUrl: submission.credentialsUrl,
        readmeUrl: submission.readmeUrl,
        submittedAt: now,
        submittedBy: participant._id,
        lastUpdatedAt: now,
        isPublished: true,
      });

      createdSubmissions.push({
        id: submissionId,
        teamCode: submission.teamCode,
        projectName: submission.projectName,
      });
    }

    return {
      success: true,
      created: createdSubmissions.length,
      submissions: createdSubmissions,
    };
  },
});
