"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, FormEvent } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function SignInInner() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destinationFor = (admin: boolean) => {
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    if (admin) return safeNext?.startsWith("/admin") ? safeNext : "/admin";
    if (safeNext && !safeNext.startsWith("/admin")) return safeNext;
    return "/dashboard";
  };

  const authErrorMessage = (err: unknown, fallback: string) => {
    const raw = (err instanceof Error ? err.message : "")
      .replace(/^Error:\s*/i, "")
      .replace(/^(Uncaught Error:\s*)+/i, "")
      .trim();
    if (!raw) return `❌ ${fallback}`;
    const text = raw.toLowerCase();
    if (
      text.includes("invalidsecret") ||
      text.includes("invalid credentials") ||
      text.includes("incorrect") ||
      text.includes("wrong password")
    ) {
      return "❌ Incorrect email or password.";
    }
    if (text.includes("rate") || text.includes("too many")) {
      return "❌ Too many attempts. Please wait a moment and try again.";
    }
    return `❌ ${raw}`;
  };

  const participant = useQuery(api.participants.getCurrentParticipant, isAuthenticated ? {} : "skip");
  const isAdmin = useQuery(api.participants.isAdmin, isAuthenticated ? {} : "skip");
  const ensure = useMutation(api.participants.ensureCurrentParticipant);

  useEffect(() => {
    if (isAuthenticated && participant === null) {
      ensure({}).catch(() => {});
    }
  }, [isAuthenticated, participant, ensure]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (participant === undefined || participant === null) return;
    if (isAdmin === undefined) return;
    // auto-redirect based on role — after participant doc exists
    router.replace(destinationFor(isAdmin));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, participant, isAdmin, router, next]);

  const handle = async (provider: "google" | "github") => {
    setError(null);
    try {
      const query = search.toString();
      const redirectTo = `${window.location.origin}/auth/signin${query ? `?${query}` : ""}`;
      await signIn(provider, { redirectTo });
    } catch (e: unknown) {
      setError(authErrorMessage(e, "Sign-in failed"));
    }
  };

  const handlePasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("❌ Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("❌ Please enter your password.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn("password", { flow: "signIn", email: normalizedEmail, password });
    } catch (err: unknown) {
      setError(authErrorMessage(err, "Could not sign in. Please try again."));
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && participant === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
        <p className="text-sm text-gray-500">Creating your profile…</p>
      </div>
    );
  }

  if (isAuthenticated && participant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
        <p className="text-sm text-gray-500">Redirecting to {isAdmin ? "admin" : "dashboard"}…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <h1 className="font-syncopate text-3xl font-bold text-ocean-deep">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Sign in to access your dashboard — admins will land in the admin area.</p>

      {error && <div className="mt-4 w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handlePasswordSignIn} className="mt-8 w-full space-y-3">
        <div>
          <label className="text-sm font-medium text-ocean-deep">Email Address</label>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ocean-deep">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-ocean-primary px-4 py-3 font-bold text-white shadow-sm transition hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in with Email & Password"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        OR
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mt-4 w-full space-y-3">
        <button
          onClick={() => handle("google")}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-ocean-primary shadow-sm transition hover:bg-gray-50"
        >
          <span className="text-lg">🔵</span> Continue with Google
        </button>
        <button
          onClick={() => handle("github")}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-black"
        >
          <span>⚫</span> Continue with GitHub
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        New here?{" "}
        <Link href="/register/main" className="font-semibold text-ocean-primary hover:underline">
          Create an account &amp; register
        </Link>
      </p>

      <p className="mt-6 text-xs text-gray-400">By signing in you agree to our terms. Accounts are created via email &amp; password or OAuth through Convex Auth.</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
