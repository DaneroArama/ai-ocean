"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { friendlyErrorMessage } from "@/lib/uploads";
import { registrationCategory, CATEGORY_LABEL, CATEGORY_STYLE } from "@/lib/registrationStatus";
import type { RegistrationCategory } from "@/lib/registrationStatus";

type Category = RegistrationCategory;

const TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

const POSITION_CATEGORIES: Record<string, string> = {
  po_ba_business: "PO/BA/Business",
  design: "Design",
  development: "Development",
  project_product_management: "Project/Product Mgmt",
  other: "Other",
};

const EXPERIENCE: Record<string, string> = {
  no_experience: "No Exp",
  less_than_1: "<1 yr",
  "1_to_3": "1-3 yrs",
  "3_and_above": "3+ yrs",
};

const PAYMENT_METHODS: Record<string, string> = {
  mmqr: "MMQR",
  aya_pay: "AYA Pay",
  cb_pay: "CB Pay",
  kbz_pay: "KBZ Pay",
  wave_money: "Wave Money",
  ctzpay: "CTZPay",
};

export default function AdminRegistrationsPage() {
  const allRegs = useQuery(api.buildathonRegistrations.listAllRegistrations);
  const updatePaymentStatus = useMutation(api.buildathonRegistrations.updatePaymentStatus);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | Category>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const searched = useMemo(() => {
    if (!allRegs) return [];
    if (!search) return allRegs;
    const q = search.toLowerCase();
    return allRegs.filter(
      (r) =>
        r.basicInfo.name.toLowerCase().includes(q) ||
        r.basicInfo.email.toLowerCase().includes(q) ||
        r.basicInfo.phone.includes(q) ||
        (r.basicInfo.telegramUsername ?? "").toLowerCase().includes(q)
    );
  }, [allRegs, search]);

  const counts = useMemo(() => {
    const result: Record<"all" | Category, number> = { all: 0, draft: 0, submitted: 0, verified: 0, rejected: 0 };
    for (const reg of searched) {
      result.all += 1;
      result[registrationCategory(reg)] += 1;
    }
    return result;
  }, [searched]);

  const filtered = useMemo(() => {
    if (tab === "all") return searched;
    return searched.filter((r) => registrationCategory(r) === tab);
  }, [searched, tab]);

  const handlePaymentStatus = async (regId: Id<"buildathonRegistrations">, status: "pending" | "verified" | "rejected") => {
    try {
      await updatePaymentStatus({ registrationId: regId, status });
      setMsg(`✅ Payment ${status}`);
    } catch (error) {
      setMsg(friendlyErrorMessage(error, "Could not update the payment status."));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Registrations</h1>
        <p className="text-xs text-gray-700">{counts.all} registration(s){search ? ` matching “${search}”` : ""}</p>
      </div>

      {msg && <div className={`rounded-xl border px-4 py-2 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{msg}</div>}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              tab === t.key
                ? "bg-ocean-primary text-white shadow-sm"
                : "border border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:text-ocean-primary"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 ${tab === t.key ? "text-white/80" : "text-ocean-medium/70"}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <input placeholder="Search name, email, phone, telegram..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border px-4 py-2.5 text-sm text-ocean-primary placeholder:text-ocean-medium" />

      {!allRegs ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">
          No {tab === "all" ? "" : `${TABS.find((t) => t.key === tab)?.label.toLowerCase()} `}registrations{search ? " matching your search" : ""}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{r.basicInfo.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${CATEGORY_STYLE[registrationCategory(r)]}`}>
                      {CATEGORY_LABEL[registrationCategory(r)]}
                    </span>
                    {r.paymentStatus === "pending" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">payment pending</span>
                    )}
                  </div>
                  <p className="text-xs text-ocean-medium truncate">{r.basicInfo.email} | {r.basicInfo.phone}{r.basicInfo.telegramUsername ? ` | @${r.basicInfo.telegramUsername}` : ""}</p>
                </div>
                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>

              {expanded === r._id && (
                <div className="border-t p-4 space-y-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 text-ocean-primary p-3">
                      <h4 className="font-bold text-gray-700 mb-1">Basic Info</h4>
                      <p>{r.basicInfo.name}</p>
                      <p className="text-gray-500">{r.basicInfo.email}</p>
                      <p className="text-gray-500">{r.basicInfo.phone}</p>
                      <p className="text-gray-500">Telegram: {r.basicInfo.telegramUsername}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <h4 className="font-bold text-gray-700 mb-1">Role & Background</h4>
                      {r.roleInfo && (
                        <>
                          <p>{POSITION_CATEGORIES[r.roleInfo.positionCategory] ?? r.roleInfo.positionCategory}</p>
                          <p className="text-gray-500">{r.roleInfo.subRole}</p>
                          <p className="text-gray-500">{EXPERIENCE[r.roleInfo.experienceYears] ?? r.roleInfo.experienceYears}</p>
                          {r.roleInfo.organization && <p className="text-gray-500">{r.roleInfo.organization}</p>}
                          {r.roleInfo.portfolioLink && <p className="text-gray-500 text-xs truncate">{r.roleInfo.portfolioLink}</p>}
                        </>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <h4 className="font-bold text-gray-700 mb-1">Event Preferences</h4>
                      {r.eventPreferences && (
                        <div className="space-y-1 text-ocean-primary">
                          <p>{r.eventPreferences.preferredTrack === "in_person" ? "📍 In-Person" : "💻 Online"}</p>
                          <p>Laptop: {r.eventPreferences.bringLaptop ? "✅" : "❌"}</p>
                          <p>Attendance: {r.eventPreferences.attendanceCommitment ? "✅ All days" : "❌"}</p>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <h4 className="font-bold text-gray-700 mb-1">Payment</h4>
                      {r.payment && (
                        <div className="space-y-1 text-ocean-primary">
                          <p>{PAYMENT_METHODS[r.payment.method] ?? r.payment.method}</p>
                          {r.payment.discountCode && <p className="text-gray-500">Code: {r.payment.discountCode}</p>}
                        </div>
                      )}
                      {r.receiptFile && (
                        <div className="mt-2">
                          {r.receiptFile.contentType?.startsWith("image/") ? (
                            <img src={r.receiptFile.url} alt="Receipt" className="max-h-40 rounded-lg border" />
                          ) : (
                            <a href={r.receiptFile.url} target="_blank" rel="noreferrer" className="inline-block rounded bg-ocean-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-ocean-deep">
                              📄 View receipt
                            </a>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handlePaymentStatus(r._id, "verified")} className="rounded bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-600">Verify</button>
                            <button onClick={() => handlePaymentStatus(r._id, "rejected")} className="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600">Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-700">Reg ID: </span>
                    <span className="font-mono text-xs text-ocean-primary">{r._id}</span>
                    {r.teamId && <span className="ml-3 text-gray-500">Team: {r.teamId}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
