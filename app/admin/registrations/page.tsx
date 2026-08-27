"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

type Reg = Doc<"buildathonRegistrations"> & {
  participantEmail: string;
  participantRole: string;
  selectedRoleName: string | null;
};

type Phase = "pre-event" | "main-event";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  assessment: { label: "Assessment", color: "bg-blue-100 text-blue-700" },
  recommended: { label: "Recommended", color: "bg-purple-100 text-purple-700" },
  role_selected: { label: "Role Selected", color: "bg-amber-100 text-amber-700" },
  submitted: { label: "Submitted", color: "bg-emerald-100 text-emerald-700" },
};

const EXP_LABELS: Record<string, string> = {
  none: "No exp",
  student: "Student",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
};

function isPreEvent(reg: Reg) {
  return reg.state === "draft" && !reg.selectedRoleId;
}

export default function AdminRegistrationsPage() {
  const allRegs = useQuery(api.buildathonRegistrations.listAllRegistrations);

  const [phase, setPhase] = useState<Phase>("pre-event");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!allRegs) return [];
    return allRegs.filter((r) => {
      const isPre = isPreEvent(r);
      if (phase === "pre-event" && !isPre) return false;
      if (phase === "main-event" && isPre) return false;
      if (stateFilter !== "all" && r.state !== stateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.basicInfo.name.toLowerCase().includes(q) ||
          r.basicInfo.email.toLowerCase().includes(q) ||
          (r.basicInfo.university ?? "").toLowerCase().includes(q) ||
          (r.basicInfo.organization ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRegs, phase, stateFilter, search]);

  const stats = useMemo(() => {
    if (!allRegs) return { total: 0, preEvent: 0, mainEvent: 0, submitted: 0 };
    const pre = allRegs.filter((r) => isPreEvent(r));
    const main = allRegs.filter((r) => !isPreEvent(r));
    return {
      total: allRegs.length,
      preEvent: pre.length,
      mainEvent: main.length,
      submitted: allRegs.filter((r) => r.state === "submitted").length,
    };
  }, [allRegs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Registrations</h1>
        <p className="text-xs text-gray-700">View all pre-event and main-event registrations.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-ocean-deep">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.preEvent}</div>
          <div className="text-xs text-gray-500">Pre-Event</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.mainEvent}</div>
          <div className="text-xs text-gray-500">Main Event</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{stats.submitted}</div>
          <div className="text-xs text-gray-500">Submitted</div>
        </div>
      </div>

      {/* Phase toggle */}
      <div className="flex gap-1 rounded-xl border bg-gray-100 p-1">
        {(["pre-event", "main-event"] as Phase[]).map((p) => (
          <button key={p} onClick={() => setPhase(p)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${phase === p ? "bg-ocean-primary text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}>
            {p === "pre-event" ? "Pre-Event" : "Main Event"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search name, email, university..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-60 flex-1 rounded-lg border px-3 py-2 text-sm text-ocean-primary placeholder-ocean-medium"
        />
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm text-ocean-medium">
          <option value="all">All states</option>
          <option value="draft">Draft</option>
          <option value="assessment">Assessment</option>
          <option value="recommended">Recommended</option>
          <option value="role_selected">Role Selected</option>
          <option value="submitted">Submitted</option>
        </select>
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Background</th>
                <th className="px-3 py-2 text-left">State</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Registered</th>
                <th className="px-3 py-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!allRegs ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No registrations found.</td></tr>
              ) : filtered.map((r) => {
                const st = STATE_LABELS[r.state] ?? STATE_LABELS.draft;
                const isExpanded = expanded === r._id;
                return [
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{r.basicInfo.name}</td>
                    <td className="px-3 py-2 text-gray-600">{r.basicInfo.email}</td>
                    <td className="px-3 py-2 text-gray-600">
                      <div>{r.background?.currentProfession ?? "—"}</div>
                      <div className="text-xs text-gray-400">{r.background?.experienceLevel ? EXP_LABELS[r.background.experienceLevel] : "—"}</div>
                    </td>
                    <td className="px-3 py-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${st.color}`}>{st.label}</span></td>
                    <td className="px-3 py-2 text-gray-600">{r.selectedRoleName ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => setExpanded(isExpanded ? null : r._id)} className="rounded border px-2.5 py-1 text-xs font-semibold hover:bg-gray-50">
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${r._id}-detail`}>
                      <td colSpan={7} className="bg-gray-50 px-6 py-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Basic Info</h4>
                            <p className="mt-1 text-sm"><span className="text-gray-500">Phone:</span> {r.basicInfo.phone ?? "—"}</p>
                            <p className="text-sm"><span className="text-gray-500">University:</span> {r.basicInfo.university ?? "—"}</p>
                            <p className="text-sm"><span className="text-gray-500">Organization:</span> {r.basicInfo.organization ?? "—"}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Background</h4>
                            <p className="mt-1 text-sm"><span className="text-gray-500">Profession:</span> {r.background?.currentProfession ?? "—"}</p>
                            <p className="text-sm"><span className="text-gray-500">Occupation:</span> {r.background?.occupation ?? "—"}</p>
                            <p className="text-sm"><span className="text-gray-500">Experience:</span> {r.background?.experienceLevel ? EXP_LABELS[r.background.experienceLevel] : "—"}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Interests & Skills</h4>
                            <p className="mt-1 text-sm"><span className="text-gray-500">Interests:</span> {r.interests?.join(", ") ?? "—"}</p>
                            <p className="text-sm"><span className="text-gray-500">Skills:</span> {r.skills?.join(", ") ?? "—"}</p>
                          </div>
                        </div>
                        {r.dynamicResponses && (
                          <div className="mt-4 rounded-lg border bg-white p-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Dynamic Responses</h4>
                            <pre className="mt-1 max-h-40 overflow-auto text-xs text-gray-600">{JSON.stringify(r.dynamicResponses, null, 2)}</pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
