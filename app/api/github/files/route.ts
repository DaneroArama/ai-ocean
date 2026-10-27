import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

/**
 * GitHub File Browser API
 * GET /api/github/files?repo=Team-17&path=folder
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get("repo");
  const path = searchParams.get("path") || "";
  
  const org = process.env.GITHUB_ORG || "ai-ocean-buildathon";
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  if (!repo) {
    return NextResponse.json(
      { error: "repo parameter required" },
      { status: 400 }
    );
  }

  try {
    const octokit = new Octokit({ auth: token });

    // Get directory contents
    const { data } = await octokit.rest.repos.getContent({
      owner: org,
      repo,
      path,
    });

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Path is not a directory" },
        { status: 400 }
      );
    }

    // Transform to simpler format with raw URLs
    const files = data.map((item) => {
      const isFile = item.type === "file";
      const rawUrl = isFile
        ? `https://github.com/${org}/${repo}/raw/refs/heads/main/${item.path}`
        : null;
      
      return {
        name: item.name,
        path: item.path,
        type: item.type, // "file" or "dir"
        size: item.size,
        downloadUrl: item.download_url,
        rawUrl,
        htmlUrl: item.html_url,
      };
    });

    // Separate folders and files, sort alphabetically
    const folders = files.filter(f => f.type === "dir").sort((a, b) => a.name.localeCompare(b.name));
    const regularFiles = files.filter(f => f.type === "file").sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      repo,
      path: path || "/",
      items: [...folders, ...regularFiles],
    });
  } catch (error: any) {
    console.error("GitHub files API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch files", 
        details: error.message,
        status: error.status 
      },
      { status: error.status || 500 }
    );
  }
}
