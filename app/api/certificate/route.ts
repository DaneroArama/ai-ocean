import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { createCertificate } from "@/lib/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const preview = url.searchParams.get("preview") === "1";
  const demo = url.searchParams.get("demo") === "1";
  if (
    demo &&
    (process.env.NODE_ENV !== "development" ||
      !/^http:\/\/(localhost|127\.0\.0\.1):/.test(
        process.env.NEXT_PUBLIC_CONVEX_URL || "",
      ))
  )
    return Response.json({ error: "Not found" }, { status: 404 });
  const token = await convexAuthNextjsToken();
  if (!preview && !token)
    return Response.json(
      { error: "Please sign in to download your certificate." },
      { status: 401 },
    );
  try {
    const details = preview
      ? { name: "Your Name", serial: "AI-OCEAN-2026-TEMPLATE", demo: true }
      : await fetchMutation(
          api.attendance.issueCertificate,
          { demo },
          { token },
        );
    const bytes = await createCertificate({ ...details, preview });
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="AI-Ocean-${preview ? "Certificate-Preview" : details.serial}.pdf"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Certificate request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json(
      {
        error:
          "Certificate unavailable. You need 75% verified attendance. Downloads open automatically on November 2, 2026 at 00:00 Myanmar time for one calendar month.",
      },
      { status: 403 },
    );
  }
}
