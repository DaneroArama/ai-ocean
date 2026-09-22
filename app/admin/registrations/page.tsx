"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!allRegs) return [];
    return allRegs.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        return (
          r.basicInfo.name.toLowerCase().includes(q) ||
          r.basicInfo.email.toLowerCase().includes(q) ||
          r.basicInfo.phone.includes(q) ||
          (r.basicInfo.telegramUsername ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRegs, search]);

  const handlePaymentStatus = async (regId: Id<"buildathonRegistrations">, status: "pending" | "verified" | "rejected") => {
    try {
      await updatePaymentStatus({ registrationId: regId, status });
      setMsg(`✅ Payment ${status}`);
    } catch (e) {
      setMsg("❌ Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Registrations</h1>
        <p className="text-xs text-gray-700">{filtered.length} total registration(s)</p>
      </div>

      {msg && <div className={`rounded-xl border px-4 py-2 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{msg}</div>}

      <input placeholder="Search name, email, phone, telegram..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border px-4 py-2.5 text-sm" />

      {!allRegs ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No registrations found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{r.basicInfo.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.state === "submitted" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>{r.state}</span>
                    {r.paymentStatus && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        r.paymentStatus === "verified" ? "bg-emerald-100 text-emerald-700" :
                        r.paymentStatus === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{r.paymentStatus}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{r.basicInfo.email} | {r.basicInfo.phone}{r.basicInfo.telegramUsername ? ` | @${r.basicInfo.telegramUsername}` : ""}</p>
                </div>
                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>

              {expanded === r._id && (
                <div className="border-t p-4 space-y-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3">
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
                        <>
                          <p>{r.eventPreferences.preferredTrack === "in_person" ? "📍 In-Person" : "💻 Online"}</p>
                          <p>Laptop: {r.eventPreferences.bringLaptop ? "✅" : "❌"}</p>
                          <p>Attendance: {r.eventPreferences.attendanceCommitment ? "✅ All days" : "❌"}</p>
                        </>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <h4 className="font-bold text-gray-700 mb-1">Payment</h4>
                      {r.payment && (
                        <>
                          <p>{PAYMENT_METHODS[r.payment.method] ?? r.payment.method}</p>
                          {r.payment.discountCode && <p className="text-gray-500">Code: {r.payment.discountCode}</p>}
                        </>
                      )}
                      {r.payment?.receipt && (
                        <div className="mt-2">
                          <img src={r.payment.receipt} alt="Receipt" className="max-h-40 rounded-lg border" />
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
                    <span className="font-mono text-xs">{r._id}</span>
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
