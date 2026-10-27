import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

/**
 * GitHub Sync API - Fetches submission data from GitHub org repos
 * GET /api/github/sync?org=ai-ocean-buildathon
 */

interface RepoSubmission {
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const org = searchParams.get("org") || process.env.GITHUB_ORG || "ai-ocean-buildathon";
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const octokit = new Octokit({ auth: token });

    // Get all repos from organization
    const { data: repos } = await octokit.rest.repos.listForOrg({
      org,
      type: "all",
      per_page: 100,
    });

    console.log(`Found ${repos.length} repos in ${org}`);
    console.log('Repo names:', repos.map(r => r.name).join(', '));

    const submissions: RepoSubmission[] = [];

    // Process each repo
    for (const repo of repos) {
      try {
        // Extract team code from repo name
        // Supports: Team-17, team-18, AI01, ai02-project, etc.
        const teamCodeMatch = repo.name.match(/^(?:team-?|ai)(\d+)/i);
        if (!teamCodeMatch) continue; // Skip non-team repos

        // Normalize to "AI##" format
        const teamNumber = teamCodeMatch[1].padStart(2, '0');
        const teamCode = `AI${teamNumber}`;

        console.log(`Processing ${repo.name} → ${teamCode}`);

        // Fetch README
        let readmeContent = "";
        let description = repo.description || "";
        let projectName = repo.name;
        let tagline = "";
        let pitchDeckUrl: string | undefined = "";
        let demoVideoUrl: string | undefined = "";
        let liveProductUrl: string | undefined = "";
        let credentialsUrl: string | undefined = "";

        try {
          const { data: readmeData } = await octokit.rest.repos.getContent({
            owner: org,
            repo: repo.name,
            path: "README.md",
          });

          if ("content" in readmeData) {
            readmeContent = Buffer.from(readmeData.content, "base64").toString(
              "utf-8"
            );

            // Parse README for metadata
            const parsed = parseReadme(readmeContent);
            projectName = parsed.projectName || projectName;
            tagline = parsed.tagline || "";
            description = parsed.description || description;
            pitchDeckUrl = parsed.pitchDeckUrl || "";
            demoVideoUrl = parsed.demoVideoUrl || "";
            liveProductUrl = parsed.liveProductUrl || "";
          }
        } catch (err) {
          console.log(`No README found for ${repo.name}`);
        }

        // Check for CREDENTIALS.md
        try {
          await octokit.rest.repos.getContent({
            owner: org,
            repo: repo.name,
            path: "CREDENTIALS.md",
          });
          credentialsUrl = `https://github.com/${org}/${repo.name}/blob/main/CREDENTIALS.md`;
        } catch {
          // CREDENTIALS.md doesn't exist
        }

        submissions.push({
          repoName: repo.name,
          teamCode,
          projectName,
          description,
          tagline: tagline || undefined,
          pitchDeckUrl: pitchDeckUrl || undefined,
          demoVideoUrl: demoVideoUrl || undefined,
          liveProductUrl: liveProductUrl || undefined,
          githubRepoUrl: repo.html_url,
          credentialsUrl: credentialsUrl || undefined,
          readmeUrl: `https://github.com/${org}/${repo.name}/blob/main/README.md`,
          readmeContent: readmeContent.substring(0, 500), // Preview
          lastUpdated: repo.updated_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error processing repo ${repo.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      organization: org,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("GitHub sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with GitHub", details: error },
      { status: 500 }
    );
  }
}

/**
 * Parse README.md to extract project metadata
 */
function parseReadme(content: string): {
  projectName?: string;
  tagline?: string;
  description?: string;
  pitchDeckUrl?: string;
  demoVideoUrl?: string;
  liveProductUrl?: string;
} {
  const result: ReturnType<typeof parseReadme> = {};

  // Extract project name from first h1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    result.projectName = h1Match[1].trim();
  }

  // Extract tagline (text right after h1, before next heading)
  const taglineMatch = content.match(/^#\s+.+\n\n?(.+?)(?:\n\n|$)/m);
  if (taglineMatch && !taglineMatch[1].startsWith("#")) {
    result.tagline = taglineMatch[1].trim();
  }

  // Extract description (look for Description section or first paragraph)
  const descMatch = content.match(
    /##\s+Description\s*\n+([\s\S]+?)(?:\n\n|##)/
  ) || content.match(/^#\s+.+\n+([\s\S]+?)(?:\n\n|##)/);
  if (descMatch) {
    result.description = descMatch[1].trim().replace(/\n/g, " ");
  }

  // Extract URLs
  const pitchMatch = content.match(
    /\[.*pitch.*deck.*\]\((.+?)\)/
  );
  if (pitchMatch) result.pitchDeckUrl = pitchMatch[1];

  const demoMatch = content.match(
    /\[.*demo.*video.*\]\((.+?)\)/
  ) || content.match(/\[.*video.*\]\((?:https?:\/\/(?:www\.)?(youtube|youtu\.be|vimeo)\.com.+?)\)/);
  if (demoMatch) result.demoVideoUrl = demoMatch[1];

  const liveMatch = content.match(
    /\[.*live.*\]\((.+?)\)/
  ) || content.match(/\[.*demo.*\]\((?:https?:\/\/.+?\.(?:vercel|netlify|herokuapp)\.app.+?)\)/) ||
    content.match(/##\s+Live\s+(?:Product|Demo|Site|URL)\s*\n+.+?(https?:\/\/.+?)(?:\s|$)/);
  if (liveMatch) result.liveProductUrl = liveMatch[1];

  return result;
}
