"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { validateReceiptFile, uploadReceiptFile, friendlyErrorMessage } from "@/lib/uploads";

const STEPS = ["Basic Info", "Role & Background", "Event Preferences", "Create Account", "Payment", "Confirm"] as const;

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

const ACCOUNT_INPUT = "mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30";

function signUpErrorMessage(error: unknown): string {
  const raw = (error instanceof Error ? error.message : "")
    .replace(/^Error:\s*/i, "")
    .replace(/^(Uncaught Error:\s*)+/i, "")
    .trim();
  if (!raw) return "❌ Could not create your account. Please try again.";
  const text = raw.toLowerCase();
  if (text.includes("already") || text.includes("exists") || text.includes("taken")) {
    return "❌ An account with this email already exists — please sign in instead.";
  }
  if (text.includes("password") && text.includes("8")) {
    return "❌ Password must be at least 8 characters.";
  }
  return `❌ ${raw}`;
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 shrink-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === current ? "bg-ocean-primary text-white" : i < current ? "bg-emerald-500 text-white" : "bg-ocean-surface text-ocean-deep"}`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`hidden text-xs font-semibold md:inline ${i === current ? "text-ocean-deep" : "text-ocean-medium"}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 w-6 ${i < current ? "bg-emerald-500" : "bg-ocean-surface"}`} />}
        </div>
      ))}
    </div>
  );
}

function RegistrationInner() {
  const router = useRouter();
  const { participant, isAuthenticated } = useAuth();
  const { signIn } = useAuthActions();
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
    receiptId: null as string | null,
    receiptMime: null as string | null,
    discountCode: "",
  });
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Create Account step (email + password)
  const [account, setAccount] = useState({ email: "", password: "", confirm: "" });
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Anonymous draft — guestId lives in localStorage, data lives in Convex
  const [guestId, setGuestId] = useState<string | null>(null);
  const restoredRef = useRef(false);
  const ensureTriedRef = useRef(false);

  const myRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const guestDraft = useQuery(api.guestDrafts.getGuestDraft, guestId ? { guestId } : "skip");
  const saveGuestDraft = useMutation(api.guestDrafts.saveGuestDraft);
  const claimGuestDraft = useMutation(api.guestDrafts.claimGuestDraft);
  const ensure = useMutation(api.participants.ensureCurrentParticipant);
  const updateReg = useMutation(api.buildathonRegistrations.updateRegistration);
  const submitReg = useMutation(api.buildathonRegistrations.submitRegistration);
  const generateReceiptUploadUrl = useMutation(api.buildathonRegistrations.generateReceiptUploadUrl);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const KEY = "ai-ocean:guestId";
    const fallbackId = () =>
      `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    try {
      let id = window.localStorage.getItem(KEY);
      if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
        id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : fallbackId();
        window.localStorage.setItem(KEY, id);
      }
      setGuestId(id);
    } catch {
      setGuestId(fallbackId());
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Load existing draft
  /* eslint-disable react-hooks/set-state-in-effect */
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
          phone: draft.basicInfo.phone ?? "",
          telegramUsername: draft.basicInfo.telegramUsername ?? "",
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
          const savedReceiptUrl = draft.receiptFile?.url ?? null;
          setPayment((p) => ({
            ...p,
            method: draft.payment?.method ?? "",
            receipt: savedReceiptUrl,
            receiptFile: null,
            receiptId: savedReceiptUrl ? draft.payment?.receipt ?? null : null,
            receiptMime: draft.receiptFile?.contentType ?? null,
            discountCode: draft.payment?.discountCode ?? "",
          }));
        }
        // An existing registration means the account step is already behind them
        setStep(draft.state === "submitted" || draft.payment ? 5 : 4);
      }
    }
  }, [myRegs, regId, basic]);

  // Restore anonymous progress from the guest draft (once)
  useEffect(() => {
    if (restoredRef.current) return;
    if (myRegs && myRegs.length > 0) {
      restoredRef.current = true;
      return;
    }
    if (!guestDraft) return;
    restoredRef.current = true;
    if (guestDraft.basicInfo) {
      setBasic({
        name: guestDraft.basicInfo.name,
        email: guestDraft.basicInfo.email,
        phone: guestDraft.basicInfo.phone,
        telegramUsername: guestDraft.basicInfo.telegramUsername ?? "",
      });
    }
    if (guestDraft.roleInfo) {
      setRoleInfo({
        positionCategory: guestDraft.roleInfo.positionCategory,
        subRole: guestDraft.roleInfo.subRole,
        experienceYears: guestDraft.roleInfo.experienceYears,
        organization: guestDraft.roleInfo.organization ?? "",
        portfolioLink: guestDraft.roleInfo.portfolioLink ?? "",
      });
    }
    if (guestDraft.eventPreferences) {
      setEventPrefs({
        preferredTrack: guestDraft.eventPreferences.preferredTrack,
        bringLaptop: guestDraft.eventPreferences.bringLaptop,
        attendanceCommitment: guestDraft.eventPreferences.attendanceCommitment,
      });
    }
    if (!regId) {
      if (guestDraft.eventPreferences) setStep(3);
      else if (guestDraft.roleInfo) setStep(2);
      else if (guestDraft.basicInfo) setStep(1);
    }
  }, [guestDraft, myRegs, regId]);

  // Prefill the account email with the contact email from the form
  useEffect(() => {
    if (!account.email && basic.email) setAccount((a) => ({ ...a, email: basic.email }));
  }, [basic.email, account.email]);

  // After sign-up (or when already signed in): create the profile + claim the draft
  useEffect(() => {
    if (!claiming || !isAuthenticated) return;
    if (participant === null) {
      if (!ensureTriedRef.current) {
        ensureTriedRef.current = true;
        ensure({}).catch((e: unknown) => {
          setMsg(friendlyErrorMessage(e, "Could not set up your account. Please try again."));
          setClaiming(false);
        });
      }
      return;
    }
    if (!participant || !guestId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await claimGuestDraft({ guestId });
        if (cancelled) return;
        setRegId(res.registrationId);
        setClaiming(false);
        setMsg(null);
        setStep((s) => Math.max(s, 4));
      } catch (e: unknown) {
        if (cancelled) return;
        setMsg(friendlyErrorMessage(e, "Could not link your form to your new account."));
        setClaiming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [claiming, isAuthenticated, participant, guestId, claimGuestDraft, ensure]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateReceiptFile(file);
    if (problem) {
      setMsg(problem);
      return;
    }
    setPayment((p) => {
      if (p.receipt?.startsWith("blob:")) URL.revokeObjectURL(p.receipt);
      return {
        ...p,
        receipt: URL.createObjectURL(file),
        receiptFile: file,
        receiptId: null,
        receiptMime: file.type || null,
      };
    });
    setMsg(null);
  };

  const requireGuest = () => {
    if (regId || guestId) return true;
    setMsg("❌ Could not save your answers. Please refresh the page and try again.");
    return false;
  };

  const handleBasicNext = async () => {
    if (!basic.name || !basic.email || !basic.phone) {
      setMsg("❌ Name, email, and phone are required.");
      return;
    }
    if (!requireGuest()) return;
    try {
      if (regId) {
        await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, basicInfo: basic });
      } else {
        await saveGuestDraft({ guestId: guestId as string, basicInfo: basic });
      }
      setMsg(null);
      next();
    } catch (e: unknown) {
      setMsg(friendlyErrorMessage(e, "Could not save your details. Please try again."));
    }
  };

  const handleRoleNext = async () => {
    if (!roleInfo.positionCategory || !roleInfo.subRole || !roleInfo.experienceYears) {
      setMsg("❌ Please fill all required fields.");
      return;
    }
    if (!requireGuest()) return;
    const payload = roleInfo as { positionCategory: "po_ba_business" | "design" | "development" | "project_product_management" | "other"; subRole: string; experienceYears: "no_experience" | "less_than_1" | "1_to_3" | "3_and_above"; organization?: string; portfolioLink?: string };
    try {
      if (regId) {
        await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, roleInfo: payload });
      } else {
        await saveGuestDraft({ guestId: guestId as string, roleInfo: payload });
      }
      setMsg(null);
      next();
    } catch (e: unknown) {
      setMsg(friendlyErrorMessage(e, "Could not save your role details. Please try again."));
    }
  };

  const handleEventPrefsNext = async () => {
    if (!eventPrefs.preferredTrack || eventPrefs.bringLaptop === null || eventPrefs.attendanceCommitment === null) {
      setMsg("❌ Please complete all fields.");
      return;
    }
    if (!requireGuest()) return;
    const payload = eventPrefs as { preferredTrack: "in_person" | "online"; bringLaptop: boolean; attendanceCommitment: boolean };
    try {
      if (regId) {
        await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, eventPreferences: payload });
      } else {
        await saveGuestDraft({ guestId: guestId as string, eventPreferences: payload });
      }
      setMsg(null);
      next();
    } catch (e: unknown) {
      setMsg(friendlyErrorMessage(e, "Could not save your event preferences. Please try again."));
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingAccount || claiming) return;
    const email = account.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("❌ Please enter a valid email address.");
      return;
    }
    if (account.password.length < 8) {
      setMsg("❌ Password must be at least 8 characters.");
      return;
    }
    if (account.password !== account.confirm) {
      setMsg("❌ Passwords do not match.");
      return;
    }
    if (!requireGuest()) return;
    setCreatingAccount(true);
    setMsg(null);
    try {
      await signIn("password", {
        flow: "signUp",
        email,
        password: account.password,
        ...(basic.name ? { name: basic.name } : {}),
      });
      setClaiming(true);
    } catch (err: unknown) {
      setMsg(signUpErrorMessage(err));
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleContinueWithAccount = () => {
    if (claiming || !participant) return;
    setMsg(null);
    setClaiming(true);
  };

  const handleOAuthFromStep = async (provider: "google" | "github") => {
    setMsg(null);
    try {
      await signIn(provider, { redirectTo: `${window.location.origin}/register/main` });
    } catch (err: unknown) {
      setMsg(friendlyErrorMessage(err, "Sign-in failed. Please try again."));
    }
  };

  const handlePaymentNext = async () => {
    if (uploadingReceipt) return;
    if (!payment.method) {
      setMsg("❌ Please select a payment method.");
      return;
    }
    if (!payment.receipt && !payment.receiptId) {
      setMsg("❌ Please upload your payment receipt.");
      return;
    }
    if (!regId) {
      setMsg("❌ Registration not found. Please go back to the first step and try again.");
      return;
    }
    setUploadingReceipt(true);
    try {
      let receiptValue = payment.receiptId;
      if (payment.receiptFile) {
        const uploadUrl = await generateReceiptUploadUrl({ registrationId: regId as Id<"buildathonRegistrations"> });
        receiptValue = await uploadReceiptFile(uploadUrl, payment.receiptFile);
      }
      if (!receiptValue) {
        setMsg("❌ Please upload your payment receipt.");
        return;
      }
      await updateReg({
        registrationId: regId as Id<"buildathonRegistrations">,
        payment: {
          method: payment.method as "mmqr" | "aya_pay" | "cb_pay" | "kbz_pay" | "wave_money" | "ctzpay",
          receipt: receiptValue,
          discountCode: payment.discountCode || undefined,
        },
      });
      setPayment((p) => ({ ...p, receiptId: receiptValue, receiptFile: null }));
      setMsg(null);
      next();
    } catch (e: unknown) {
      setMsg(friendlyErrorMessage(e, "Could not save your payment details. Please try again."));
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setMsg("❌ Please agree to the terms and conditions.");
      return;
    }
    if (!regId) {
      setMsg("❌ Your account is not linked yet. Please finish the Create Account step first.");
      return;
    }
    try {
      await submitReg({ registrationId: regId as Id<"buildathonRegistrations"> });
      setMsg("✅ Registration submitted! Taking you to your dashboard…");
      setStep(STEPS.length);
      router.replace("/dashboard");
    } catch (e: unknown) {
      setMsg(friendlyErrorMessage(e, "Could not submit your registration. Please try again."));
    }
  };

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep md:text-2xl">Into The AI Ocean Registration</h1>
        {participant ? (
          <Link href="/dashboard" className="text-xs text-ocean-medium hover:underline">← Dashboard</Link>
        ) : (
          <Link href="/" className="text-xs text-ocean-medium hover:underline">← Home</Link>
        )}
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

      <div className="rounded-2xl border border-ocean-surface bg-white p-4 shadow-sm">
        <Stepper current={step} />
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ocean-surface/50">
          <div className="h-full bg-ocean-primary transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-ocean-medium">
          {step < STEPS.length ? `${progressPct}% — ${STEPS[step]}` : "Complete"}
        </p>
      </div>

      {msg && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : msg.startsWith("❌") ? "bg-red-50 text-red-800 border-red-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
          {msg}
        </div>
      )}

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="rounded-2xl border border-ocean-surface bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Basic Information <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ocean-deep">Full Name *</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="Enter your full name" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Email Address *</label>
              <input type="email" className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="your@email.com" value={basic.email} onChange={(e) => setBasic({ ...basic, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Phone Number *</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="09xxxxxxxx" value={basic.phone} onChange={(e) => setBasic({ ...basic, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Telegram Username *</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="username" value={basic.telegramUsername} onChange={(e) => setBasic({ ...basic, telegramUsername: e.target.value })} />
              <p className="mt-1 text-xs text-ocean-medium">To be used while you&apos;re joining for buildathon</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleBasicNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 1: Role & Background */}
      {step === 1 && (
        <div className="rounded-2xl border border-ocean-surface bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Role & Background <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ocean-deep">Position Category *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {POSITION_CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setRoleInfo({ ...roleInfo, positionCategory: cat.value })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${roleInfo.positionCategory === cat.value ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Sub Role *</label>
              <select className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" value={roleInfo.subRole} onChange={(e) => setRoleInfo({ ...roleInfo, subRole: e.target.value })}>
                <option value="">Select sub role</option>
                {SUB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Experience Years *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setRoleInfo({ ...roleInfo, experienceYears: opt.value })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${roleInfo.experienceYears === opt.value ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Organization/Company</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="If applicable" value={roleInfo.organization} onChange={(e) => setRoleInfo({ ...roleInfo, organization: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Portfolio / GitHub / LinkedIn Link</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="https://..." value={roleInfo.portfolioLink} onChange={(e) => setRoleInfo({ ...roleInfo, portfolioLink: e.target.value })} />
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
        <div className="rounded-2xl border border-ocean-surface bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Event Preferences <span className="text-red-500">*</span></h3>
          <div className="mt-4 space-y-5">
            <div>
              <label className="text-sm font-medium text-ocean-deep">Preferred Event Track *</label>
              <p className="text-xs text-ocean-medium">Please note that you cannot change after submission.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, preferredTrack: "in_person" })} className={`rounded-lg border px-4 py-4 text-center text-sm transition ${eventPrefs.preferredTrack === "in_person" ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                  📍 In-Person (Yangon)
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, preferredTrack: "online" })} className={`rounded-lg border px-4 py-4 text-center text-sm transition ${eventPrefs.preferredTrack === "online" ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                  💻 Online
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Will you bring your own laptop and charger? *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, bringLaptop: true })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.bringLaptop === true ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                  ✅ Yes, I will bring my own laptop and charger
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, bringLaptop: false })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.bringLaptop === false ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                  ❌ No, I need assistance
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Attendance Commitment *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, attendanceCommitment: true })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.attendanceCommitment === true ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                  ✅ Yes, I can attend all days of the event
                </button>
                <button type="button" onClick={() => setEventPrefs({ ...eventPrefs, attendanceCommitment: false })} className={`rounded-lg border px-4 py-3 text-left text-sm transition ${eventPrefs.attendanceCommitment === false ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
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

      {/* Step 3: Create Account */}
      {step === 3 && (
        <div className="rounded-2xl border border-ocean-surface bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Create Your Account</h3>
          <p className="mt-2 text-sm text-ocean-medium">
            Your answers so far are saved. Create an account with your email and password so we can save your
            registration, verify your payment, and keep you updated.
          </p>

          {isAuthenticated ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                {participant ? (
                  <>
                    ✓ Signed in as <strong>{participant.email}</strong>
                    {participant.name ? <span> ({participant.name})</span> : null}
                  </>
                ) : (
                  <span>Setting up your account…</span>
                )}
              </div>
              <div className="flex justify-between">
                <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
                <button
                  onClick={handleContinueWithAccount}
                  disabled={claiming || !participant}
                  className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {claiming ? "Linking your form…" : "Continue →"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleCreateAccount} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-ocean-deep">Email Address *</label>
                  <input
                    type="email"
                    autoComplete="email"
                    className={ACCOUNT_INPUT}
                    placeholder="your@email.com"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ocean-deep">Password *</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={ACCOUNT_INPUT}
                    placeholder="At least 8 characters"
                    value={account.password}
                    onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ocean-deep">Confirm Password *</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={ACCOUNT_INPUT}
                    placeholder="Repeat your password"
                    value={account.confirm}
                    onChange={(e) => setAccount({ ...account, confirm: e.target.value })}
                  />
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
                  <button
                    type="submit"
                    disabled={creatingAccount || claiming}
                    className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingAccount || claiming ? "Creating your account…" : "Create account & continue →"}
                  </button>
                </div>
              </form>

              <div className="mt-5 flex items-center gap-3 text-xs text-ocean-medium">
                <div className="h-px flex-1 bg-ocean-surface" />
                OR
                <div className="h-px flex-1 bg-ocean-surface" />
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuthFromStep("google")}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-ocean-surface bg-white px-4 py-3 text-sm font-semibold text-ocean-primary transition hover:bg-ocean-foam"
                >
                  🔵 Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthFromStep("github")}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  ⚫ Continue with GitHub
                </button>
              </div>

              <p className="mt-4 text-xs text-ocean-medium">
                Already have an account?{" "}
                <Link href={`/auth/signin?next=${encodeURIComponent("/register/main")}`} className="font-semibold text-ocean-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div className="rounded-2xl border border-ocean-surface bg-white text-ocean-primary p-6 shadow-sm">
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
              <label className="text-sm font-medium text-ocean-deep">Payment Method *</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setPayment({ ...payment, method: m.value })} className={`rounded-lg border px-3 py-3 text-center text-sm transition ${payment.method === m.value ? "border-ocean-primary bg-ocean-foam font-bold text-ocean-deep" : "border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:bg-ocean-foam"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Payment Receipt *</label>
              <p className="text-xs text-ocean-medium">Upload the payment receipt. Max 10MB. PDF or image.</p>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleReceiptChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 w-full rounded-xl border-2 border-dashed border-ocean-surface bg-ocean-foam p-6 text-center transition hover:border-ocean-primary hover:bg-white">
                {payment.receipt ? (
                  <div className="space-y-2">
                    {payment.receiptMime === "application/pdf" || payment.receiptFile?.name.toLowerCase().endsWith(".pdf") ? (
                      <div className="text-3xl">📄</div>
                    ) : (
                      <img src={payment.receipt} alt="Receipt" className="mx-auto max-h-32 rounded-lg object-contain" />
                    )}
                    <p className="text-xs text-ocean-medium">{payment.receiptFile?.name ?? "Receipt"}</p>
                    <p className={`text-xs font-medium ${payment.receiptId && !payment.receiptFile ? "text-emerald-600" : "text-ocean-primary"}`}>
                      {payment.receiptId && !payment.receiptFile ? "✓ Receipt uploaded" : "✓ Receipt selected — uploads when you continue"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl">📄</div>
                    <p className="text-sm text-ocean-medium">Click to upload receipt</p>
                    <p className="text-xs text-ocean-medium">PNG, JPG or PDF. Max 10MB.</p>
                  </div>
                )}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-deep">Partnership Discount Code</label>
              <input className="mt-1 w-full rounded-lg border border-ocean-surface bg-ocean-foam px-3 py-2.5 text-sm text-ocean-deep transition placeholder:text-ocean-medium focus:border-ocean-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-primary/30" placeholder="Enter code (optional)" value={payment.discountCode} onChange={(e) => setPayment({ ...payment, discountCode: e.target.value })} />
              <p className="mt-1 text-xs text-ocean-medium">Enter Partnership Organization Discount Code. Discounts will be refunded after full payment is made and verified.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handlePaymentNext} disabled={uploadingReceipt} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-60">
              {uploadingReceipt ? "Uploading receipt…" : "Confirm →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && (
        <div className="rounded-2xl border border-ocean-surface bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-ocean-deep">Review & Submit</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-lg bg-ocean-foam p-4">
              <h4 className="font-bold text-ocean-deep mb-2">Basic Info</h4>
              <p className="text-ocean-medium">{basic.name}</p>
              <p className="text-ocean-medium">{basic.email} | {basic.phone}</p>
              <p className="text-ocean-medium">Telegram: {basic.telegramUsername}</p>
            </div>
            <div className="rounded-lg bg-ocean-foam p-4">
              <h4 className="font-bold text-ocean-deep mb-2">Role & Background</h4>
              <p>{POSITION_CATEGORIES.find((c) => c.value === roleInfo.positionCategory)?.label} → {roleInfo.subRole}</p>
              <p className="text-ocean-medium">{EXPERIENCE_OPTIONS.find((e) => e.value === roleInfo.experienceYears)?.label}</p>
              {roleInfo.organization && <p className="text-ocean-medium">{roleInfo.organization}</p>}
              {roleInfo.portfolioLink && <p className="text-ocean-medium text-xs truncate">{roleInfo.portfolioLink}</p>}
            </div>
            <div className="rounded-lg bg-ocean-foam text-ocean-primary p-4">
              <h4 className="font-bold text-ocean-deep mb-2">Event Preferences</h4>
              <p>Track: {eventPrefs.preferredTrack === "in_person" ? "📍 In-Person (Yangon)" : "💻 Online"}</p>
              <p>Laptop: {eventPrefs.bringLaptop ? "✅ Bringing own" : "❌ Need assistance"}</p>
              <p>Attendance: {eventPrefs.attendanceCommitment ? "✅ All days" : "❌ Cannot commit all"}</p>
            </div>
            <div className="rounded-lg bg-ocean-foam p-4">
              <h4 className="font-bold text-ocean-deep mb-2">Payment</h4>
              <p>Method: {PAYMENT_METHODS.find((m) => m.value === payment.method)?.label}</p>
              {payment.receipt ? (
                <p className="text-emerald-600">✓ Receipt uploaded</p>
              ) : (
                <p className="text-amber-600">⚠ No receipt uploaded</p>
              )}
              {payment.discountCode && <p className="text-ocean-medium">Code: {payment.discountCode}</p>}
            </div>
            <div className="rounded-lg bg-ocean-foam p-4">
              <span className="font-bold text-ocean-deep">Reg ID: </span>
              <span className="font-mono text-xs text-ocean-primary">{regId ?? "—"}</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 rounded-xl border border-ocean-surface bg-ocean-foam p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 accent-ocean-primary" />
              <div className="text-xs text-ocean-deep">
                <p>I agree to the terms and conditions. I understand that my personal information will be used solely for event logistics and communication related to Into the AI Ocean. I consent to the processing of my data for event organization purposes.</p>
                <p className="mt-2 text-ocean-medium">⚠ Your personal information will be used solely for event logistics and communication related to Into the AI Ocean. We will not share your data with third parties without your consent.</p>
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
        <div className="rounded-2xl border border-ocean-surface bg-white p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Registration Complete!</h3>
          <p className="mt-2 text-sm text-ocean-medium">Your registration is submitted. We&apos;ll verify your payment and confirm your spot.</p>
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
  return <RegistrationInner />;
}
