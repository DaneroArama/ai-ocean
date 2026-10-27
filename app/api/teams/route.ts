import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const teams = await client.query(api.teams.listPublicTeams);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Teams API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
