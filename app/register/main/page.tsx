"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const STEPS = ["Basic Info", "Role & Background", "Event Preferences", "Payment", "Review"] as const;

const POSITION_CATEGORIES = [
  { value: "po_ba_business", label: "PO/BA/Business" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "project_product_management", label: "Project/Product Management" },
  { value: "other", label: "Other" },
] as const;

const SUB_ROLES = [
  "Business Analyst", "Business Owner", "Project Manager", "Product Owner",
  "Product Designer", "UI Designer", "UX Designer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Other",
] as const;

const EXPERIENCE_OPTIONS = [
  { value: "no_experience", label: "No Experience (0)" },
  { value: "less_than_1", label: "Less than 1 year" },
  { value: "1_to_3", label: "1 to 3 years" },
  { value: "3_and_above", label: "3 years and above" },
] as const;

const PAYMENT_METHODS = [
  { value: "mmqr", label: "MMQR" },
  { value: "aya_pay", label: "AYA Pay" },
  { value: "cb_pay", label: "CB Pay" },
  { value: "kbz_pay", label: "KBZ Pay" },
  { value: "wave_money", label: "Wave Money" },
  { value: "ctzpay", label: "CTZPay" },
] as const;

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 shrink-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === current ? "bg-ocean-primary text-white" : i < current ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`hidden text-xs font-semibold md:inline ${i === current ? "text-ocean-deep" : "text-gray-400"}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 w-6 ${i < current ? "bg-emerald-500" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function RegistrationInner() {
  const { participant } = useAuth();
  const [step, setStep] = useState(0);
  const [regId, setRegId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [basic, setBasic] = useState({ name: "", email: "", phone: "", telegramUsername: "" });
  const [roleInfo, setRoleInfo] = useState({
    positionCategory: "" as string,
    subRole: "",
    experienceYears: "" as string,
    organization: "",
    portfolioLink: "",
  });
  const [eventPrefs, setEventPrefs] = useState({
    preferredTrack: "" as string,
    bringLaptop: null as boolean | null,
    attendanceCommitment: null as boolean | null,
  });
  const [payment, setPayment] = useState({
    method: "" as string,
    receipt: null as string | null,
    receiptFile: null as File | null,
    discountCode: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const myRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const createDraft = useMutation(api.buildathonRegistrations.createDraft);
  const updateReg = useMutation(api.buildathonRegistrations.updateRegistration);
  const submitReg = useMutation(api.buildathonRegistrations.submitRegistration);

  // Load existing draft
  useEffect(() => {
    if (participant && !basic.email) {
      setBasic((b) => ({ ...b, email: participant.email, name: participant.name ?? "" }));
    }
  }, [participant, basic.email]);

  useEffect(() => {
    if (myRegs && myRegs.length > 0 && !regId) {
      const draft = myRegs.find((r) => r.state !== "submitted") ?? myRegs[0];
      if (draft) {
        setRegId(draft._id);
        setBasic({
          name: draft.basicInfo.name,
          email: draft.basicInfo.email,
          phone: draft.basicInfo.phone,
          telegramUsername: draft.basicInfo.telegramUsername,
        });
        if (draft.roleInfo) {
          setRoleInfo({
            positionCategory: draft.roleInfo.positionCategory,
            subRole: draft.roleInfo.subRole,
            experienceYears: draft.roleInfo.experienceYears,
            organization: draft.roleInfo.organization ?? "",
            portfolioLink: draft.roleInfo.portfolioLink ?? "",
          });
        }
        if (draft.eventPreferences) {
          setEventPrefs({
            preferredTrack: draft.eventPreferences.preferredTrack,
            bringLaptop: draft.eventPreferences.bringLaptop,
            attendanceCommitment: draft.eventPreferences.attendanceCommitment,
          });
        }
        if (draft.payment) {
          setPayment((p) => ({
            ...p,
            method: draft.payment.method,
            receipt: draft.payment.receipt,
            discountCode: draft.payment.discountCode ?? "",
          }));
        }
        const stateToStep: Record<string, number> = { draft: 0, assessment: 1, recommended: 2, role_selected: 3, submitted: 4 };
        setStep(stateToStep[draft.state] ?? 0);
      }
    }
  }, [myRegs, regId, basic]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMsg("❌ File too large. Max 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPayment((p) => ({ ...p, receipt: reader.result as string, receiptFile: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBasicNext = async () => {
    if (!basic.name || !basic.email || !basic.phone) {
      setMsg("Name, email, and phone are required");
      return;
    }
    try {
      if (!regId) {
        const res = await createDraft({
          basicInfo: basic,
          roleInfo: { positionCategory: "other" as "other", subRole: "", experienceYears: "no_experience" as "no_experience" },
          eventPreferences: { preferredTrack: "in_person" as "in_person", bringLaptop: true, attendanceCommitment: true },
          payment: { method: "mmqr" as "mmqr", receipt: "" },
        });
        setRegId(res.registrationId);
      } else {
        await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, basicInfo: basic });
      }
      setMsg(null);
      next();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  const handleRoleNext = async () => {
    if (!roleInfo.positionCategory || !roleInfo.subRole || !roleInfo.experienceYears) {
      setMsg("Please fill all required fields");
      return;
    }
    if (regId) {
      await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, roleInfo: roleInfo as any });
    }
    setMsg(null);
    next();
  };

  const handleEventPrefsNext = async () => {
    if (!eventPrefs.preferredTrack || eventPrefs.bringLaptop === null || eventPrefs.attendanceCommitment === null) {
      setMsg("Please complete all fields");
      return;
    }
    if (regId) {
      await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, eventPreferences: eventPrefs as any });
    }
    setMsg(null);
    next();
  };

  const handlePaymentNext = async () => {
    if (!payment.method || !payment.receipt) {
      setMsg("Payment method and receipt are required");
      return;
    }
    if (regId) {
      await updateReg({
        registrationId: regId as Id<"buildathonRegistrations">,
        payment: { method: payment.method as any, receipt: payment.receipt, discountCode: payment.discountCode || undefined },
      });
    }
    setMsg(null);
    next();
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setMsg("Please agree to the terms and conditions");
      return;
    }
    if (!regId) return;
    try {
      await submitReg({ registrationId: regId as Id<"buildathonRegistrations"> });
      setMsg("✅ Registration submitted!");
      setStep(STEPS.length);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  if (!participant) return null;

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep md:text-2xl">Into The AI Ocean Registration</h1>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">← Dashboard</Link>
      </div>

      {/* Event Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 space-y-2">
        <p className="font-bold">📅 Event Dates:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Bootcamp (In-person & Online): 17th & 18th October 2026 (Sat & Sun) 9am-5pm</li>
          <li>Building & Mentorship (Online): 19th-23rd October 2026 (Mon-Fri)</li>
          <li>Judging Panel (Online): 25th October 2026 (Sunday) 12pm-2pm</li>
          <li>Final Pitching & Awards (In-person & Online): 1st November 2026 (Sun) 12pm-5pm</li>
        </ul>
        <p className="text-xs"><strong>Location:</strong> CTZPay Office, Yangon Innovation Center (YIC)</p>
        <p className="text-xs"><strong>Fees:</strong> 80,000 MMK</p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <Stepper current={step} />
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-ocean-primary transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {step < STEPS.length ? `${progressPct}% — ${STEPS[step]}` : "Complete"}
        </p>
      </div>

      {msg && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
          {msg}
        </div>
      )}

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Basic Information <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="Enter your full name" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address *</label>
              <input type="email" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="your@email.com" value={basic.email} onChange={(e) => setBasic({ ...basic, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number *</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="09xxxxxxxx" value={basic.phone} onChange={(e) => setBasic({ ...basic, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telegram Username *</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="@username" value={basic.telegramUsername} onChange={(e) => setBasic({ ...basic, telegramUsername: e.target.value })} />
              <p className="mt-1 text-xs text-gray-500">To be used while you&apos;re joining for buildathon</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleBasicNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 1: Role & Background */}
      {step === 1 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Role & Background <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Position Category *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {POSITION_CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setRoleInfo({ ...roleInfo, positionCategory: cat.value })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${roleInfo.positionCategory === cat.value ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sub Role *</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" value={roleInfo.subRole} onChange={(e) => setRoleInfo({ ...roleInfo, subRole: e.target.value })}>
                <option value="">Select sub role</option>
                {SUB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Experience Years *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setRoleInfo({ ...roleInfo, experienceYears: opt.value })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${roleInfo.experienceYears === opt.value ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Organization/Company</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="If applicable" value={roleInfo.organization} onChange={(e) => setRoleInfo({ ...roleInfo, organization: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Portfolio / GitHub / LinkedIn Link</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="https://..." value={roleInfo.portfolioLink} onChange={(e) => setRoleInfo({ ...roleInfo, portfolioLink: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handleRoleNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2: Event Preferences */}
      {step === 2 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Event Preferences <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Preferred Event Track *</label>
              <p className="text-xs text-gray-500">Please note that you cannot change after submission.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, preferredTrack: "in_person" })} className={`rounded-lg border px-4 py-4 text-center text-sm transition ${eventPrefs.preferredTrack === "in_person" ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  📍 In-Person (Yangon)
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, preferredTrack: "online" })} className={`rounded-lg border px-4 py-4 text-center text-sm transition ${eventPrefs.preferredTrack === "online" ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  💻 Online
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Will you bring your own laptop and charger? *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, bringLaptop: true })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.bringLaptop === true ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  ✅ Yes, I will bring my own laptop and charger
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, bringLaptop: false })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.bringLaptop === false ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  ❌ No, I need assistance
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Attendance Commitment *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, attendanceCommitment: true })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.attendanceCommitment === true ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  ✅ Yes, I can attend all days of the event
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, attendanceCommitment: false })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.attendanceCommitment === false ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                  ❌ No, I cannot commit to all days
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handleEventPrefsNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">💳 Payment & Administrative Info</h3>
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">
            <p className="font-bold text-amber-800">Registration Fee: 80,000 MMK</p>
            <p className="mt-2 text-amber-700">Secure your spot at the buildathon by submitting the registration fee. As seats are limited, completing this step is essential for confirmation.</p>
            <div className="mt-3 rounded-lg bg-white p-3 text-xs">
              <p><strong>Payment Info:</strong></p>
              <p>Number: <span className="font-mono">09260567664</span></p>
              <p>Name: <strong>Wai Yi Mon Soe</strong></p>
              <p className="mt-2 text-amber-600">Please add the note: <strong>Into The AI Ocean 2026 - {basic.name}</strong></p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Method *</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setPayment({ ...payment, method: m.value })} className={`rounded-lg border px-3 py-3 text-center text-sm transition ${payment.method === m.value ? "border-ocean-primary bg-ocean-50 font-bold" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Receipt *</label>
              <p className="text-xs text-gray-500">Upload the payment receipt. Max 10MB. PDF or image.</p>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleReceiptChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-ocean-primary hover:bg-ocean-50">
                {payment.receipt ? (
                  <div className="space-y-2">
                    {payment.receiptFile?.type.startsWith("image/") ? (
                      <img src={payment.receipt} alt="Receipt" className="mx-auto max-h-32 rounded-lg object-contain" />
                    ) : (
                      <div className="text-3xl">📄</div>
                    )}
                    <p className="text-xs text-gray-500">{payment.receiptFile?.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">✓ Receipt uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl">📄</div>
                    <p className="text-sm text-gray-600">Click to upload receipt</p>
                    <p className="text-xs text-gray-400">PNG, JPG or PDF. Max 10MB.</p>
                  </div>
                )}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Partnership Discount Code</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="Enter code (optional)" value={payment.discountCode} onChange={(e) => setPayment({ ...payment, discountCode: e.target.value })} />
              <p className="mt-1 text-xs text-gray-500">Enter Partnership Organization Discount Code. Discounts will be refunded after full payment is made and verified.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handlePaymentNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">Review →</button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Review & Submit</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-bold text-gray-700 mb-2">Basic Info</h4>
              <p>{basic.name}</p>
              <p className="text-gray-500">{basic.email} | {basic.phone}</p>
              <p className="text-gray-500">Telegram: {basic.telegramUsername}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-bold text-gray-700 mb-2">Role & Background</h4>
              <p>{POSITION_CATEGORIES.find((c) => c.value === roleInfo.positionCategory)?.label} → {roleInfo.subRole}</p>
              <p className="text-gray-500">{EXPERIENCE_OPTIONS.find((e) => e.value === roleInfo.experienceYears)?.label}</p>
              {roleInfo.organization && <p className="text-gray-500">{roleInfo.organization}</p>}
              {roleInfo.portfolioLink && <p className="text-gray-500 text-xs truncate">{roleInfo.portfolioLink}</p>}
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-bold text-gray-700 mb-2">Event Preferences</h4>
              <p>Track: {eventPrefs.preferredTrack === "in_person" ? "📍 In-Person (Yangon)" : "💻 Online"}</p>
              <p>Laptop: {eventPrefs.bringLaptop ? "✅ Bringing own" : "❌ Need assistance"}</p>
              <p>Attendance: {eventPrefs.attendanceCommitment ? "✅ All days" : "❌ Cannot commit all"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-bold text-gray-700 mb-2">Payment</h4>
              <p>Method: {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label}</p>
              {payment.receipt ? (
                <p className="text-emerald-600">✓ Receipt uploaded</p>
              ) : (
                <p className="text-amber-600">⚠ No receipt uploaded</p>
              )}
              {payment.discountCode && <p className="text-gray-500">Code: {payment.discountCode}</p>}
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <span className="font-bold text-gray-700">Reg ID: </span>
              <span className="font-mono text-xs">{regId ?? "—"}</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 accent-ocean-primary" />
              <div className="text-xs text-gray-600">
                <p>I agree to the terms and conditions. I understand that my personal information will be used solely for event logistics and communication related to Into the AI Ocean. I consent to the processing of my data for event organization purposes.</p>
                <p className="mt-2 text-gray-500">⚠ Your personal information will be used solely for event logistics and communication related to Into the AI Ocean. We will not share your data with third parties without your consent.</p>
              </div>
            </label>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handleSubmit} disabled={!agreedToTerms} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
              Submit Registration
            </button>
          </div>
        </div>
      )}

      {/* Complete */}
      {step >= STEPS.length && (
        <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Registration Complete!</h3>
          <p className="mt-2 text-sm text-gray-600">Your registration is submitted. We&apos;ll verify your payment and confirm your spot.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <AuthGuard>
      <RegistrationInner />
    </AuthGuard>
  );
}
