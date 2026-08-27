"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">{label}</div>
      <div className="mt-2 font-syncopate text-3xl font-bold text-ocean-deep">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-600">{hint}</div>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { participant } = useAuth();

  const participants = useQuery(api.admin.listParticipants, { limit: 100 });
  const myRegs = useQuery(api.registrations.getMyRegistrations);
  const buildathonRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const roles = useQuery(api.buildathonRoles.listRoles, { activeOnly: false });
  const questions = useQuery(api.roleDiscoveryQuestions.listQuestions, {});

  const totalParticipants = participants?.length ?? "—";
  const totalBuildathon = Array.isArray(buildathonRegs) ? buildathonRegs.length : "—";
  const totalRoles = Array.isArray(roles) ? roles.length : "—";
  const totalQs = Array.isArray(questions) ? questions.length : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">Admin overview</h1>
        <p className="mt-1 text-sm text-gray-700">
          Signed in as <span className="font-semibold text-gray-900">{participant?.email}</span> • role <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-800">{participant?.role}</span> — live Convex DB
        </p>
        <p className="mt-1 text-xs text-gray-600">Deployment: {process.env.NEXT_PUBLIC_CONVEX_URL}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Participants" value={totalParticipants} hint="participants table" />
        <StatCard label="Buildathon regs" value={totalBuildathon} hint="buildathonRegistrations" />
        <StatCard label="Roles" value={totalRoles} hint="buildathonRoles" />
        <StatCard label="Questions" value={totalQs} hint="roleDiscoveryQuestions" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-semibold text-gray-800">Quick actions</h3>
          <div className="mt-4 grid gap-2">
            <Link href="/admin/roles" className="rounded-xl border bg-white px-4 py-2.5 text-center text-ocean-medium text-sm font-semibold hover:bg-gray-50">
              Manage Roles (Product/Design/Eng …)
            </Link>
            <Link href="/admin/questions" className="rounded-xl border bg-white px-4 py-2.5 text-center text-ocean-medium text-sm font-semibold hover:bg-gray-50">
              Manage Questions (20–30 scenario Qs)
            </Link>
            <Link href="/admin/registrations" className="rounded-xl border bg-white px-4 py-2.5 text-center text-ocean-medium text-sm font-semibold hover:bg-gray-50">
              View Registrations & Recommendations
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-semibold text-gray-800">Auth status</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-700">Email</dt>
              <dd className="font-mono text-xs text-gray-800">{participant?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700">Name</dt>
              <dd className="text-gray-800">{(participant?.name ?? `${participant?.firstName ?? ""} ${participant?.lastName ?? ""}`.trim()) || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700">Role</dt>
              <dd className="font-semibold text-gray-800">{participant?.role ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-700">ID</dt>
              <dd className="font-mono text-xs text-gray-800">{participant?._id ?? "—"}</dd>
            </div>
          </dl>
         </div>
      </div>
    </div>
  );
}
