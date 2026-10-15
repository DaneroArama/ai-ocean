"use client";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
export function DashboardHeader() {
  const { participant } = useAuth();
  const { signOut } = useAuthActions();
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">
          Dashboard
        </h1>
        <p className="text-sm text-ocean-deep">
          Welcome, {participant?.name ?? participant?.email}
        </p>
      </div>
      <div className="flex gap-2">
        {participant?.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-xl bg-ocean-primary px-4 py-2 text-sm font-bold text-white hover:bg-ocean-deep"
          >
            Admin Panel
          </Link>
        )}
        <button
          onClick={() => void signOut()}
          className="rounded-xl border bg-white hover:border-ocean-primary px-4 py-2 text-sm font-semibold text-ocean-primary hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
