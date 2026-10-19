"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AttendanceRules } from "@/components/attendance/Rules";
import { Icon } from "@/components/attendance/ui";
import { ATTENDANCE_SESSIONS, sessionDate } from "@/lib/attendance";
import "@/components/attendance/attendance.css";
import eventLogo from "../assets/event_logo_coloured.png";

export default function Page() {
  const [search, setSearch] = useState("");
  const people = useQuery(api.attendance.publicProgress, { search });
  return (
    <main className="att-shell">
      <div className="att-wrap">
        <nav className="att-topbar">
          <Link className="att-brand" href="/">
            <div className="flex items-center mx-auto justify-center">
              <Image
                src={eventLogo}
                alt="Event Logo"
                width={50}
                height={50}
               className="h-full w-10"
              />
            </div>
            AI OCEAN
          </Link>
          <Link className="att-button secondary" href="/dashboard/attendance">
            My attendance <Icon name="arrow" size={16} />
          </Link>
        </nav>
        <header className="att-hero">
          <div>
            <div className="att-eyebrow">Together, one session at a time</div>
            <h1 className="att-heading">
              Follow the journey.
              <br />
              Celebrate the progress.
            </h1>
            <p className="att-description">
              An open view of our buildathon. Find your name or team to see
              verified attendance, or sign in for your personal session history
              and certificate.
            </p>
          </div>
          <div className="att-hero-art">
            <Image
              loading="eager"
              src="/assets/Mascots/Tuto.png"
              className="att-mascot"
              width={360}
              height={360}
              alt="AI Ocean turtle mascot"
            />
            <span className="att-art-note">Keep showing up.</span>
          </div>
        </header>
        <section className="att-panel">
          <h2 className="att-panel-title">Find a participant</h2>
          <label className="att-search att-public-search">
            <Icon name="search" />
            <input
              aria-label="Search participant or team"
              placeholder="Search a name or team…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
            />
          </label>
          {search.trim().length < 2 ? (
            <p className="att-empty">
              Enter at least two characters to find a name or team.
            </p>
          ) : !people ? (
            <div className="att-loading">Looking up progress…</div>
          ) : people.length === 0 ? (
            <p className="att-empty">
              No matches yet. Try your registered name or team.
            </p>
          ) : (
            <div className="att-table-wrap" style={{ marginTop: 20 }}>
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Team</th>
                    <th>Verified attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.team}</td>
                      <td>
                        <strong>{p.score}%</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="att-section">
          <div className="att-panel-heading">
            <h2 className="att-panel-title">The attendance schedule</h2>
            <span className="att-badge navy">100% total weight</span>
          </div>
          <div className="att-sessions">
            {ATTENDANCE_SESSIONS.map((s) => (
              <article className="att-session" key={s.id}>
                <div className="att-session-top">
                  <span>{sessionDate(s.id)} 2026</span>
                  <strong>{s.weight}%</strong>
                </div>
                <h3>{s.title}</h3>
                <span className="att-session-status">{s.group}</span>
              </article>
            ))}
          </div>
        </section>
        <AttendanceRules />
      </div>
    </main>
  );
}
