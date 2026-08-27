"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";

function DashboardInner() {
  const { participant } = useAuth();
  const { signOut } = useAuthActions();
  const promote = useMutation(api.participants.promoteToAdmin);
  const [msg, setMsg] = useState<string | null>(null);

  const isAdmin = participant?.role === "admin";

  const handlePromote = async () => {
    try {
      await promote({});
      setMsg("✅ You are now admin! Go to /admin");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "failed"));
    }
  };

  if (!participant) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">You’re signed in — live Convex DB</p>
        <div className="mt-4 space-y-2 text-sm">
          <div><span className="font-semibold">Email:</span> {participant.email}</div>
          <div><span className="font-semibold">Name:</span> {participant.name ?? "—"}</div>
          <div><span className="font-semibold">Role:</span> <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">{participant.role}</span></div>
          <div><span className="font-semibold">ID:</span> <span className="font-mono text-xs">{participant._id}</span></div>
        </div>
        {msg && <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm">{msg}</div>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            Buildathon Register →
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
              Go to Admin →
            </Link>
          ) : (
            <button onClick={handlePromote} className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100">
              Make me admin (dev)
            </button>
          )}
          <button onClick={() => void signOut()} className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">
            Sign out
          </button>
          <Link href="/" className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">
            ← Home
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">First user ever created is auto-admin (see ensureCurrentParticipant). If you’re participant, use “Make me admin” or edit `participants` doc in Convex dashboard → Data → role = admin.</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}
