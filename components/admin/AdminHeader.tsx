"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export function AdminHeader() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace("/auth/signin?next=/admin");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="font-syncopate text-sm font-bold tracking-wide text-ocean-deep">
          AI-OCEAN ADMIN
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/admin" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100">
            Overview
          </Link>
          <Link href="/admin/teams" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Teams
          </Link>
          <Link href="/admin/attendance" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ocean-primary hover:bg-ocean-foam">
            Attendance
          </Link>
          <Link href="/admin/roles" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Roles
          </Link>
          <Link href="/admin/questions" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Questions
          </Link>
          <Link href="/admin/registrations" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Registrations
          </Link>
          <Link href="/admin/personality" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Personality
          </Link>
          <Link href="/admin/ocean-test" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Ocean Test
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-ocean-primary transition hover:border-ocean-primary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        <Link href="/" className="hidden text-xs text-gray-500 hover:text-gray-700 md:inline">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
