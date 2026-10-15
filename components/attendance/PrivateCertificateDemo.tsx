"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ATTENDANCE_SESSIONS } from "@/lib/attendance";
import { AttendanceSessionGrid } from "./AttendanceSessionGrid";
import { CertificateCard } from "./CertificateCard";
import { AttendanceRules } from "./Rules";
import { Icon, ProgressRing, cleanError } from "./ui";
import "./attendance.css";

export function PrivateCertificateDemo({
  authenticated,
  name,
}: {
  authenticated: boolean;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/certificate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (!response.ok)
        throw new Error((await response.json()).error || "Could not sign in.");
      router.refresh();
    } catch (error) {
      setError(cleanError(error));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/certificate-demo", {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Could not sign out. Please try again.");
      router.refresh();
    } catch (error) {
      setError(cleanError(error));
    } finally {
      setBusy(false);
    }
  }
  if (!authenticated)
    return (
      <main className="att-shell">
        <section className="att-panel att-demo-login">
          <div className="att-eyebrow">Private testing access</div>
          <h1 className="att-panel-title">Certificate demo sign-in</h1>
          <p className="att-panel-subtitle">
            Use the private demo credentials to try the certificate download and
            celebration.
          </p>
          <form onSubmit={login}>
            <label className="att-form-label" htmlFor="demo-email">
              Email
            </label>
            <input
              className="att-form-control"
              id="demo-email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
            <label className="att-form-label" htmlFor="demo-password">
              Password
            </label>
            <input
              className="att-form-control"
              id="demo-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="att-notice error" role="alert">
                {error}
              </p>
            )}
            <button
              className="att-button"
              style={{ width: "100%", marginTop: 24 }}
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in to demo"}
            </button>
          </form>
        </section>
      </main>
    );
  const records = ATTENDANCE_SESSIONS.map((session, index) => ({
    sessionId: session.id,
    status: index < 7 ? ("present" as const) : ("absent" as const),
  }));
  return (
    <main className="att-shell att-dashboard">
      <div className="att-wrap">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">
              Dashboard
            </h1>
            <p className="text-sm text-ocean-deep">Welcome, {name}</p>
          </div>
          <button
            disabled={busy}
            onClick={logout}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-ocean-primary hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
        <div className="att-notice">
          <Icon name="shield" />
          <span>
            <strong>Private demo session.</strong> This sample participant is
            not stored in the database or shown in the public tracker.
            Downloaded certificates are marked as demos.
          </span>
        </div>
        {error && (
          <p className="att-notice error" role="alert">
            {error}
          </p>
        )}
        <header className="att-hero">
          <div>
            <div className="att-eyebrow">Your buildathon journey</div>
            <h2 className="att-heading">
              Your attendance.
              <br />
              Your achievement.
            </h2>
            <p className="att-description">
              Explore your sample attendance and experience the full certificate
              celebration.
            </p>
          </div>
          <div className="att-hero-art">
            <Image
              className="att-mascot"
              src="/assets/Mascots/Octo.png"
              alt="AI Ocean octopus"
              width={360}
              height={360}
              loading="eager"
            />
          </div>
        </header>
        <div className="att-progress-grid">
          <section className="att-panel att-progress-card">
            <ProgressRing score={85} />
            <div className="att-progress-copy">
              <span className="att-badge">75% milestone reached</span>
              <h2 style={{ marginTop: 14 }}>You’ve made your mark.</h2>
              <p>
                Your sample attendance is complete. Try your personalized
                certificate download.
              </p>
            </div>
          </section>
          <CertificateCard
            name={name}
            state="available"
            demo
            downloadEndpoint="/api/certificate-demo"
          />
        </div>
        <section className="att-section">
          <div className="att-panel-heading">
            <h2 className="att-panel-title">Your attendance, day by day</h2>
          </div>
          <AttendanceSessionGrid records={records} />
        </section>
        <AttendanceRules />
      </div>
    </main>
  );
}
