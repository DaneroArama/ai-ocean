"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import eventLogo from "../../assets/event_logo_coloured.png";

function GoogleGIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.5 10S4.7 4.5 10 4.5 18.5 10 18.5 10 15.3 15.5 10 15.5 1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SignInInner() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const reason = search.get("reason");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const destinationFor = (admin: boolean) => {
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    if (admin) return safeNext?.startsWith("/admin") ? safeNext : "/admin";
    if (safeNext && !safeNext.startsWith("/admin")) return safeNext;
    return "/dashboard";
  };

  const authErrorMessage = (err: unknown, fallback: string) => {
    let raw = err instanceof Error ? err.message : "";
    // Convex Auth embeds the server error text after "Uncaught Error:".
    const uncaught = raw.match(/Uncaught Error:\s*([\s\S]*)/);
    if (uncaught) raw = uncaught[1];
    raw = raw.replace(/^Error:\s*/i, "").replace(/\s+/g, " ").trim();
    if (!raw) return `❌ ${fallback}`;
    const text = raw.toLowerCase();
    if (
      text.includes("not on the participant list") ||
      text.includes("activation password")
    ) {
      return `❌ ${raw}`;
    }
    if (
      text.includes("invalidsecret") ||
      text.includes("invalid credentials") ||
      text.includes("wrong password")
    ) {
      return "❌ Incorrect email or password.";
    }
    if (text.includes("toomany") || text.includes("too many")) {
      return "❌ Too many attempts. Please wait a moment and try again.";
    }
    return `❌ ${raw}`;
  };

  const participant = useQuery(api.participants.getCurrentParticipant, isAuthenticated ? {} : "skip");
  const isAdmin = useQuery(api.participants.isAdmin, isAuthenticated ? {} : "skip");
  const ensure = useMutation(api.participants.ensureCurrentParticipant);

  useEffect(() => {
    if (isAuthenticated && participant === null) {
      ensure({}).catch(async (err: unknown) => {
        await signOut();
        setError(
          authErrorMessage(
            err,
            "This email is not registered for this event. Contact the event team.",
          ),
        );
      });
    }
  }, [isAuthenticated, participant, ensure, signOut]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (participant === undefined || participant === null) return;
    if (isAdmin === undefined) return;
    // auto-redirect based on role — after participant doc exists
    router.replace(destinationFor(isAdmin));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, participant, isAdmin, router, next]);

  const handle = async (provider: "google") => {
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
      const raw = (err instanceof Error ? err.message : "").toLowerCase();
      // No password account yet — first-time activation: create it with the
      // shared event password (server also enforces the roster check).
      if (raw.includes("invalidaccountid")) {
        try {
          await signIn("password", {
            flow: "signUp",
            email: normalizedEmail,
            password,
          });
        } catch (signUpErr: unknown) {
          setError(
            authErrorMessage(signUpErr, "Could not activate your account."),
          );
          setSubmitting(false);
        }
        return;
      }
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
        <p className="text-sm text-gray-500">Checking your invitation…</p>
      </div>
    );
  }

  if (isAuthenticated && participant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
        <p className="text-sm text-gray-500">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-ocean-foam via-white to-ocean-foam px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-ocean-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-ocean-surface/70 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-7 text-center">
              {/* Logo */}
              <div className="flex items-center mx-auto justify-center">
                <Image
                  src={eventLogo}
                  alt="Event Logo"
                  width={50}
                  height={50}
                  className="h-full w-12"
                />
              </div>
          <p className="mt-4 font-syncopate text-[11px] font-bold uppercase tracking-[0.35em] text-ocean-primary">
            AI Ocean
          </p>
          <h1 className="mt-2 font-syncopate text-3xl font-bold text-ocean-deep">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in with Google or your registered email to continue.
          </p>
        </div>

        {reason === "not-invited" && !error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is not on the participant list for this event. Contact the
            event team if you should have access.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-ocean-surface/60 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(2,164,227,0.55)] sm:p-8">
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="text-sm font-semibold text-ocean-deep">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                className="mt-1.5 w-full rounded-xl border border-ocean-surface bg-ocean-foam/60 px-3.5 py-3 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/25"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="text-sm font-semibold text-ocean-deep">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-ocean-surface bg-ocean-foam/60 px-3.5 py-3 pr-11 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/25"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ocean-medium transition hover:bg-ocean-foam hover:text-ocean-primary"
                >
                  <EyeIcon className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-primary px-4 py-3 font-bold text-white shadow-sm transition hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            or
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={() => handle("google")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-ocean-deep shadow-sm transition hover:border-ocean-primary hover:bg-ocean-foam"
          >
            <GoogleGIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
          Accounts are created by the event team from the official participant
          list. Signing in means you agree to our terms.
        </p>
      </div>
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
