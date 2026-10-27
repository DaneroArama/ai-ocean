import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface GitHubSubmission {
  repoName: string;
  teamCode: string;
  projectName: string;
  description: string;
  tagline?: string;
  pitchDeckUrl?: string;
  demoVideoUrl?: string;
  liveProductUrl?: string;
  githubRepoUrl: string;
  credentialsUrl?: string;
  readmeUrl?: string;
  readmeContent?: string;
  lastUpdated: string;
}

export function useGitHubSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const createSubmission = useMutation(api.submissions.createSubmission);

  const syncFromGitHub = async (org?: string) => {
    setLoading(true);
    setError(null);
    setProgress("Fetching repos from GitHub...");

    try {
      // Fetch from GitHub API (org comes from env if not provided)
      const response = await fetch(org ? `/api/github/sync?org=${org}` : `/api/github/sync`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync with GitHub");
      }

      if (!data.submissions || data.submissions.length === 0) {
        throw new Error("No team repositories found in organization");
      }

      setProgress(`Found ${data.submissions.length} repositories. Importing...`);

      // Get teams query to match team codes
      const teamsResponse = await fetch("/api/teams");
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams from database");
      }
      
      const teams = await teamsResponse.json();
      if (!Array.isArray(teams)) {
        throw new Error("Invalid teams response");
      }
      
      const teamMap = new Map(
        teams.map((t: any) => [t.code?.toUpperCase(), t._id])
      );

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Import each submission
      for (const submission of data.submissions as GitHubSubmission[]) {
        try {
          const teamId = teamMap.get(submission.teamCode);
          
          if (!teamId) {
            skipped++;
            errors.push(`Team ${submission.teamCode} not found in database`);
            continue;
          }

          await createSubmission({
            teamId: teamId as Id<"teams">,
            projectName: submission.projectName,
            tagline: submission.tagline,
            description: submission.description,
            pitchDeckUrl: submission.pitchDeckUrl,
            demoVideoUrl: submission.demoVideoUrl,
            liveProductUrl: submission.liveProductUrl,
            githubRepoUrl: submission.githubRepoUrl,
            credentialsUrl: submission.credentialsUrl,
            readmeUrl: submission.readmeUrl,
            isPublished: true,
          });

          imported++;
          setProgress(
            `Imported ${imported}/${data.submissions.length} submissions...`
          );
        } catch (err) {
          skipped++;
          errors.push(
            `${submission.teamCode}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }

      setProgress("");
      setLoading(false);

      return {
        success: true,
        imported,
        skipped,
        total: data.submissions.length,
        errors,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setProgress("");
      setLoading(false);
      return {
        success: false,
        imported: 0,
        skipped: 0,
        total: 0,
        errors: [message],
      };
    }
  };

  return {
    syncFromGitHub,
    loading,
    error,
    progress,
  };
}
