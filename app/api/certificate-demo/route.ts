import { cookies } from "next/headers";
import { createCertificate } from "@/lib/certificate";
import {
  CERTIFICATE_DEMO_COOKIE,
  CERTIFICATE_DEMO_PROFILE,
  CERTIFICATE_DEMO_SESSION_SECONDS,
  createDemoSession,
  isDemoSession,
  matchesDemoCredentials,
} from "@/lib/certificate-demo-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
function cookieOptions(request: Request) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: CERTIFICATE_DEMO_SESSION_SECONDS,
  };
}

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048)
      return Response.json(
        { error: "Invalid request." },
        { status: 400, headers },
      );
    body = JSON.parse(text);
  } catch {
    return Response.json(
      { error: "Invalid request." },
      { status: 400, headers },
    );
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !matchesDemoCredentials(body.email, body.password)
  )
    return Response.json(
      { error: "Incorrect demo email or password." },
      { status: 401, headers },
    );
  (await cookies()).set(
    CERTIFICATE_DEMO_COOKIE,
    createDemoSession(),
    cookieOptions(request),
  );
  return Response.json({ signedIn: true }, { headers });
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  (await cookies()).set(CERTIFICATE_DEMO_COOKIE, "", {
    ...cookieOptions(request),
    maxAge: 0,
  });
  return Response.json({ signedOut: true }, { headers });
}
export async function GET() {
  if (!isDemoSession((await cookies()).get(CERTIFICATE_DEMO_COOKIE)?.value))
    return Response.json(
      { error: "Sign in to the private certificate demo first." },
      { status: 401, headers },
    );
  const bytes = await createCertificate({
    name: CERTIFICATE_DEMO_PROFILE.name,
    serial: "AIO-2026-PRIVATE-DEMO",
    demo: true,
    demoLabel: "PRIVATE DEMO",
  });
  return new Response(Buffer.from(bytes), {
    headers: {
      ...headers,
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="AI-Ocean-Private-Demo-Certificate.pdf"',
    },
  });
}
