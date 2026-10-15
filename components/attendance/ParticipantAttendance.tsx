"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { certificateState } from "@/lib/attendance";
import { AttendanceSessionGrid } from "./AttendanceSessionGrid";
import { CertificateCard } from "./CertificateCard";
import { AttendanceRules } from "./Rules";
import { ProgressRing, Icon, useAttendanceClock } from "./ui";
import "./attendance.css";

function AttendanceContent({ demo = false }: { demo?: boolean }) {
  const data = useQuery(api.attendance.myProgress);
  const now = useAttendanceClock();
  if (!data)
    return (
      <div className="att-loading" role="status">
        Finding your place in the ocean…
      </div>
    );
  const qualified = data.score >= 75;
  return (
    <>
      {demo && (
        <div className="att-notice">
          <Icon name="shield" size={20} />
          <span>
            <strong>Local demo.</strong> Date and release gates are bypassed
            only on this local backend. Your PDF is watermarked. Production
            rules stay in force.
          </span>
        </div>
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
            Hello, {data.name.split(" ")[0]}. From your first training to your
            final wave, here’s the progress you’ve made along the way.
          </p>
          <div style={{ marginTop: 18 }}>
            <span className="att-badge navy">
              <Icon name="calendar" size={13} />
              17 OCT — 1 NOV 2026
            </span>
          </div>
        </div>
        <div className="att-hero-art">
          <Image
            loading="eager"
            className="att-mascot"
            src="/assets/Mascots/Octo.png"
            width={360}
            height={360}
            alt="Otto, the AI Ocean octopus"
          />
          <span className="att-art-note">Small steps. Big waves.</span>
        </div>
      </header>
      <div className="att-progress-grid">
        <section className="att-panel att-progress-card">
          <ProgressRing score={data.score} />
          <div className="att-progress-copy">
            <span className={`att-badge ${qualified ? "" : "amber"}`}>
              {qualified
                ? "75% milestone reached"
                : "Your journey is unfolding"}
            </span>
            <h2 style={{ marginTop: 14 }}>
              {qualified
                ? "You’ve made your mark."
                : `${75 - data.score}% to your milestone.`}
            </h2>
            <p>
              Progress updates automatically when the event team verifies your attendance.
            </p>
            <div className="att-mini-track">
              <span
                style={{ width: `${Math.min((data.score / 75) * 100, 100)}%` }}
              />
            </div>
          </div>
        </section>
        <CertificateCard
          name={data.name}
          state={certificateState(data.score, now)}
          demo={demo && data.demo}
          releasedAt={data.releasedAt}
          expiresAt={data.expiresAt}
        />
      </div>
      {!demo && data.demo && (
        <div className="att-notice" style={{ marginTop: 20 }}>
          <Icon name="award" />
          <span>
            Try the certificate celebration before the event ends.{" "}
            <Link href="/dashboard/attendance/demo">
              Open local download demo →
            </Link>
          </span>
        </div>
      )}
      <section className="att-section">
        <div className="att-panel-heading">
          <div>
            <div className="att-eyebrow">Nine moments. One journey.</div>
            <h2 className="att-panel-title">Your attendance, day by day</h2>
          </div>
          <div className="att-legend">
            <span>
              <i className="att-dot present" /> Verified
            </span>
            <span>
              <i className="att-dot absent" /> Absent
            </span>
            <span>
              <i className="att-dot pending" /> Pending
            </span>
            <span>
              <i className="att-dot" /> Not recorded
            </span>
          </div>
        </div>
        <AttendanceSessionGrid records={data.records} />
      </section>
      <AttendanceRules />
    </>
  );
}
export function ParticipantAttendance({ demo = false }: { demo?: boolean }) {
  return (
    <AuthGuard>
      <main className="att-shell att-dashboard">
        <div className="att-wrap">
          <DashboardHeader />
          <nav className="att-dashboard-tabs" aria-label="Dashboard sections">
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/attendance" aria-current="page">
              Attendance &amp; certificate
            </Link>
          </nav>
          <AttendanceContent demo={demo} />
        </div>
      </main>
    </AuthGuard>
  );
}
