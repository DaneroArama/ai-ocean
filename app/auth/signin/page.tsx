"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function SignInInner() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";
  const [error, setError] = useState<string | null>(null);

  const participant = useQuery(api.participants.getCurrentParticipant, isAuthenticated ? {} : "skip");
  const isAdmin = useQuery(api.participants.isAdmin, isAuthenticated ? {} : "skip");
  const ensure = useMutation(api.participants.ensureCurrentParticipant);

  useEffect(() => {
    if (isAuthenticated && participant === null) {
      ensure({}).catch(() => {});
    }
  }, [isAuthenticated, participant, ensure]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && participant !== undefined) {
      if (participant === null) return; // creating…
      if (participant === undefined) return;
      // auto-redirect based on role — after participant doc exists
      if (isAdmin) router.replace(next.startsWith("/admin") ? next : "/admin");
      else router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, participant, isAdmin, router, next]);

  const handle = async (provider: "google" | "github") => {
    setError(null);
    try {
      const dest = next.startsWith("/") ? next : "/dashboard";
      const redirectTo = `${window.location.origin}${dest}`;
      await signIn(provider, { redirectTo });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
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

      <div className="mt-8 w-full space-y-3">
        <button
          onClick={() => handle("google")}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold shadow-sm transition hover:bg-gray-50"
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

      <p className="mt-6 text-xs text-gray-400">By signing in you agree to our terms. OAuth via Convex Auth → participants table (role defaults to participant).</p>
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
