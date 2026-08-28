"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const EMOJI_MAP: Record<string, string> = { O: "🐙", C: "🦈", E: "🐊", A: "🦀", N: "🐢" };
const NAME_MAP: Record<string, string> = { O: "Otto", C: "Sharkie", E: "Croco", A: "Crabbi", N: "Turty" };

export default function PersonalityAnalyticsPage() {
  const analytics = useQuery(api.oceanTest.getAnalytics);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
      </div>
    );
  }

  const total = analytics.total || 1;

  return (
    <div className="space-y-6">
      <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">Personality Test Analytics</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label="Total Tests" value={analytics.total} />
        <Card label="Registered" value={analytics.registeredCount} sub={`${Math.round((analytics.registeredCount / total) * 100)}%`} />
        <Card label="Guests" value={analytics.guestCount} sub={`${Math.round((analytics.guestCount / total) * 100)}%`} />
        <Card label="Converted Guests" value={analytics.convertedGuests} sub="saved info" />
      </div>

      {/* Archetype distribution */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-syncopate text-sm font-bold text-ocean-deep">Archetype Distribution (All)</h2>
        <div className="mt-4 space-y-3">
          {["O", "C", "E", "A", "N"].map((letter) => {
            const count = analytics.archetypeCounts[letter];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={letter} className="flex items-center gap-3">
                <span className="w-8 text-center text-xl">{EMOJI_MAP[letter]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ocean-deep">{NAME_MAP[letter]}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-ocean-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registered vs Guest breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-syncopate text-sm font-bold text-ocean-deep">Registered Users</h2>
          <div className="mt-4 space-y-2">
            {["O", "C", "E", "A", "N"].map((letter) => (
              <div key={letter} className="flex items-center justify-between text-sm">
                <span>{EMOJI_MAP[letter]} {NAME_MAP[letter]}</span>
                <span className="font-bold">{analytics.registeredArchetypeCounts[letter]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-syncopate text-sm font-bold text-ocean-deep">Guests</h2>
          <div className="mt-4 space-y-2">
            {["O", "C", "E", "A", "N"].map((letter) => (
              <div key={letter} className="flex items-center justify-between text-sm">
                <span>{EMOJI_MAP[letter]} {NAME_MAP[letter]}</span>
                <span className="font-bold">{analytics.guestArchetypeCounts[letter]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality metrics */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-syncopate text-sm font-bold text-ocean-deep">Test Quality</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean-deep">{analytics.tieBreakers}</p>
            <p className="text-xs text-gray-500">Tie-breakers used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean-deep">{analytics.sameAnswers}</p>
            <p className="text-xs text-gray-500">Same-answer patterns</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean-deep">{analytics.convertedGuests}</p>
            <p className="text-xs text-gray-500">Guests who saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ocean-deep">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
