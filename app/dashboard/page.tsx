"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { validateReceiptFile, uploadReceiptFile, friendlyErrorMessage } from "@/lib/uploads";

const PAYMENT_METHODS: Record<string, string> = {
  mmqr: "MMQR", aya_pay: "AYA Pay", cb_pay: "CB Pay",
  kbz_pay: "KBZ Pay", wave_money: "Wave Money", ctzpay: "CTZPay",
};

function DashboardInner() {
  const { participant } = useAuth();
  const { signOut } = useAuthActions();
  const updateRegistration = useMutation(api.buildathonRegistrations.updateRegistration);
  const generateReceiptUploadUrl = useMutation(api.buildathonRegistrations.generateReceiptUploadUrl);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const myRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const myTeam = useQuery(api.teams.getMyTeam);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !myReg || uploading) return;
    const problem = validateReceiptFile(file);
    if (problem) {
      setMsg(problem);
      return;
    }
    setUploading(true);
    setMsg(null);
    try {
      const uploadUrl = await generateReceiptUploadUrl({ registrationId: myReg._id });
      const storageId = await uploadReceiptFile(uploadUrl, file);
      await updateRegistration({
        registrationId: myReg._id,
        payment: { method: myReg.payment?.method ?? "mmqr", receipt: storageId },
        paymentStatus: "pending",
      });
      setMsg("✅ Receipt uploaded! Waiting for admin verification.");
    } catch (error) {
      setMsg(friendlyErrorMessage(error, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  if (!participant) return null;

  const myReg = myRegs?.[0];
  const hasRegistered = !!myReg;
  const hasReceipt = !!myReg?.payment?.receipt;
  const paymentStatus = myReg?.paymentStatus;
  const isReady = paymentStatus === "verified" && myTeam;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-syncopate text-2xl font-bold text-ocean-deep">Dashboard</h1>
          <p className="text-sm text-ocean-deep">Welcome, {participant.name ?? participant.email}</p>
        </div>
        <div className="flex gap-2">
          {participant.role === "admin" && (
            <Link href="/admin" className="rounded-xl bg-ocean-primary px-4 py-2 text-sm font-bold text-white hover:bg-ocean-deep">Admin Panel</Link>
          )}
          <button onClick={() => void signOut()} className="rounded-xl border bg-white hover:border-ocean-primary px-4 py-2 text-sm font-semibold text-ocean-primary hover:bg-gray-50">Sign out</button>
        </div>
      </div>

      {msg && <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>{msg}</div>}

      {isReady && (
        <div className="mb-6 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="font-syncopate text-xl font-bold text-emerald-800">You&apos;re All Set!</h2>
              <p className="text-sm text-emerald-700">Payment verified and team assigned. Ready to go!</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
        {/* Profile */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-primary text-2xl font-bold text-white shrink-0">
              {participant.name?.[0] ?? participant.email?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-ocean-deep">{participant.name ?? "Participant"}</h2>
              <p className="text-sm text-ocean-deep truncate">{participant.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {hasRegistered && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${myReg.state === "submitted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {myReg.state === "submitted" ? "Registered" : "In Progress"}
                  </span>
                )}
                {paymentStatus && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentStatus === "verified" ? "bg-emerald-100 text-emerald-700" : paymentStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {paymentStatus === "verified" ? "Paid" : paymentStatus === "rejected" ? "Rejected" : "Payment Pending"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-2 lg:row-span-2">
          <h3 className="font-semibold text-ocean-deep">Payment</h3>
          <div className="mt-4">
            {!hasReceipt ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-800">No Receipt Uploaded</p>
                      <p className="text-sm text-amber-600">Upload your payment receipt to complete registration.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-xs text-ocean-primary space-y-1">
                  <p className="font-bold">Payment Info:</p>
                  <p>Number: 09260567664</p>
                  <p>Name: Wai Yi Mon Soe</p>
                  <p className="text-amber-600">Note: Into The AI Ocean 2026 - {participant.name}</p>
                </div>
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ocean-primary px-6 py-3 text-sm font-bold text-white hover:bg-ocean-deep ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading ? "Uploading..." : "Upload Receipt"}
                  <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            ) : paymentStatus === "verified" ? (
              <div className="rounded-xl bg-emerald-50 p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-emerald-800">Payment Verified</p>
                  <p className="text-sm text-emerald-600">Your payment is approved. Ready to go!</p>
                </div>
              </div>
            ) : paymentStatus === "rejected" ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-50 p-4 flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-bold text-red-800">Payment Rejected</p>
                    <p className="text-sm text-red-600">Please upload a valid receipt.</p>
                  </div>
                </div>
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading ? "Uploading..." : "Upload New Receipt"}
                  <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 p-4 flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="font-bold text-amber-800">Pending Verification</p>
                  <p className="text-sm text-amber-600">Your receipt is being reviewed.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-2">
          <h3 className="font-semibold text-ocean-deep">Your Team</h3>
          <div className="mt-4">
            {myTeam ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-ocean-50 p-4">
                  <p className="font-bold text-ocean-primary">{myTeam.name}</p>
                  {myTeam.description && <p className="text-xs text-ocean-deep mt-1">{myTeam.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {myTeam.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-primary text-xs text-white">{member.name?.[0] ?? "?"}</div>
                      <span className="text-sm">{member.name}</span>
                      {member.id === participant._id && <span className="text-xs text-emerald-600">(You)</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : hasRegistered ? (
              <div className="rounded-xl bg-amber-50 p-4 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-bold text-amber-800">Waiting for Team Assignment</p>
                  <p className="text-sm text-amber-600">Admin will assign you to a team soon.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-center text-ocean-deep text-sm">Register first to be assigned to a team.</div>
            )}
          </div>
        </div>

        {/* Registration Summary */}
        {hasRegistered && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold text-ocean-deep">Registration Summary</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              {myReg.roleInfo && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-ocean-deep">Role</p>
                  <p className="font-semibold text-ocean-primary">{myReg.roleInfo.subRole}</p>
                </div>
              )}
              {myReg.eventPreferences && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-ocean-deep">Track</p>
                  <p className="font-semibold text-ocean-primary">{myReg.eventPreferences.preferredTrack === "in_person" ? "In-Person" : "Online"}</p>
                </div>
              )}
              {myReg.payment && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-ocean-deep">Payment Method</p>
                  <p className="font-semibold text-ocean-primary">{PAYMENT_METHODS[myReg.payment.method] ?? myReg.payment.method}</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-ocean-deep">Reg ID</p>
                <p className="font-mono text-xs text-ocean-primary">{myReg._id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2 lg:col-span-4">
          <h3 className="font-semibold text-ocean-deep">Quick Actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {!hasRegistered && (
              <Link href="/register/main" className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">Register for Event</Link>
            )}
            {hasRegistered && myReg.state !== "submitted" && (
              <Link href="/register/main" className="rounded-xl bg-ocean-primary px-6 py-3 text-sm font-bold text-white hover:bg-ocean-deep">Complete Registration</Link>
            )}
            <Link href="/" className="rounded-xl border bg-white px-6 py-3 text-sm text-ocean-primary font-semibold hover:bg-gray-50">Back to Home</Link>
          </div>
        </div>
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
