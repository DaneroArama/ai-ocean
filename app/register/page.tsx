"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";

const PRE_EVENT_STEPS = ["Basic Info", "Background", "Interests", "Additional Questions"] as const;

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {PRE_EVENT_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 shrink-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === current ? "bg-ocean-primary text-white" : i < current ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>{i < current ? "✓" : i + 1}</div>
          <span className={`hidden text-xs font-semibold md:inline ${i === current ? "text-ocean-deep" : "text-gray-400"}`}>{s}</span>
          {i < PRE_EVENT_STEPS.length - 1 && <div className={`mx-1 h-0.5 w-6 ${i < current ? "bg-emerald-500" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function RegisterInner() {
  const { participant } = useAuth();
  const [step, setStep] = useState(0);
  const [regId, setRegId] = useState<string | null>(null);

  const [basic, setBasic] = useState({ name: "", email: "", phone: "", university: "", organization: "" });
  const [bg, setBg] = useState({ currentProfession: "", occupation: "", experienceLevel: "student" as "none" | "student" | "junior" | "mid" | "senior" });
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Dynamic pre-event questions state
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, { optionIds: string[]; isNotSure: boolean }>>({});
  const [questionTextResponses, setQuestionTextResponses] = useState<Record<string, string>>({});
  const [questionMultiTextResponses, setQuestionMultiTextResponses] = useState<Record<string, string[]>>({});

  const myRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const preEventQuestions = useQuery(api.roleDiscoveryQuestions.getActiveQuestions, { phase: "pre-event" });

  const createDraft = useMutation(api.buildathonRegistrations.createDraft);
  const updateReg = useMutation(api.buildathonRegistrations.updateRegistration);

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
          university: draft.basicInfo.university ?? "",
          organization: draft.basicInfo.organization ?? "",
        });
        if (draft.background) setBg(draft.background as typeof bg);
        if (draft.interests) setInterests(draft.interests);
        if (draft.skills) setSkills(draft.skills);
      }
    }
  }, [myRegs, regId, basic]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const next = () => setStep((s) => Math.min(s + 1, PRE_EVENT_STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleBasicNext = async () => {
    if (!basic.name || !basic.email) { setMsg("Name and email required"); return; }
    try {
      if (!regId) {
        const res = await createDraft({ basicInfo: basic, assessmentVersion: "v1" });
        setRegId(res.registrationId);
      } else {
        await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, basicInfo: basic });
      }
      setMsg(null); next();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Unknown error"); }
  };

  const handleBgNext = async () => {
    if (!regId) return;
    await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, background: bg });
    next();
  };

  const handleInterestsNext = async () => {
    if (!regId) return;
    await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, interests, skills });
    setMsg(null); next();
  };

  const handleQuestionsComplete = async () => {
    if (!regId) return;
    // Store dynamic question responses in the registration
    const dynamicResponses = {
      answers: questionAnswers,
      textResponses: questionTextResponses,
      multiTextResponses: questionMultiTextResponses,
    };
    await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, dynamicResponses: dynamicResponses as Record<string, unknown> });
    setMsg("✅ Pre-registration complete! You can now participate in the main event.");
    setStep(PRE_EVENT_STEPS.length);
  };

  const toggleQuestionAnswer = (qId: string, optId: string, type: string) => {
    setQuestionAnswers((prev) => {
      const cur = prev[qId] ?? { optionIds: [], isNotSure: false };
      let nextIds: string[];
      if (type === "single" || type === "scenario" || type === "single-with-text" || type === "yesno") nextIds = [optId];
      else nextIds = cur.optionIds.includes(optId) ? cur.optionIds.filter((id) => id !== optId) : [...cur.optionIds, optId];
      return { ...prev, [qId]: { ...cur, optionIds: nextIds } };
    });
  };

  const setQuestionTextResponse = (qId: string, value: string) => {
    setQuestionTextResponses((prev) => ({ ...prev, [qId]: value }));
  };

  const setQuestionMultiTextResponse = (qId: string, idx: number, value: string) => {
    setQuestionMultiTextResponses((prev) => {
      const arr = [...(prev[qId] ?? [])];
      arr[idx] = value;
      return { ...prev, [qId]: arr };
    });
  };

  if (!participant) return null;

  const progressPct = Math.round(((step + 1) / PRE_EVENT_STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep md:text-2xl">Pre-Event Registration</h1>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">← Dashboard</Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <Stepper current={step} />
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-ocean-primary transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {step < PRE_EVENT_STEPS.length ? `${progressPct}% — ${PRE_EVENT_STEPS[step]}` : "Complete"}
        </p>
      </div>

      {msg && <div className="rounded-xl border bg-amber-50 px-4 py-3 text-sm text-amber-800">{msg}</div>}

      {step === 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-ocean-medium">
          <h3 className="font-semibold">Basic Information</h3>
          <p className="text-xs text-gray-500">Keep current profession / interests / selected role separate per brief §4.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Full name" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Email" value={basic.email} onChange={(e) => setBasic({ ...basic, email: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Phone" value={basic.phone} onChange={(e) => setBasic({ ...basic, phone: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="University" value={basic.university} onChange={(e) => setBasic({ ...basic, university: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm md:col-span-2" placeholder="Organization" value={basic.organization} onChange={(e) => setBasic({ ...basic, organization: e.target.value })} />
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleBasicNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">Continue →</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-ocean-medium">
          <h3 className="font-semibold">Background</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Current profession (e.g. Frontend Developer)" value={bg.currentProfession} onChange={(e) => setBg({ ...bg, currentProfession: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Occupation" value={bg.occupation} onChange={(e) => setBg({ ...bg, occupation: e.target.value })} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={bg.experienceLevel} onChange={(e) => setBg({ ...bg, experienceLevel: e.target.value as "none" | "student" | "junior" | "mid" | "senior" })}>
              <option value="none">No experience</option><option value="student">Student</option><option value="junior">Junior</option><option value="mid">Mid</option><option value="senior">Senior</option>
            </select>
          </div>
          <div className="mt-6 flex justify-between"><button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button><button onClick={handleBgNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">Continue →</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-ocean-medium">
          <h3 className="font-semibold">Interests & Skills</h3>
          <p className="text-xs text-gray-400">Comma separated — kept separate from recommended/selected role.</p>
          <input className="mt-3 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Interests: AI, Product, UX" value={interests.join(", ")} onChange={(e) => setInterests(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          <input className="mt-3 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Skills: React, Figma, Research" value={skills.join(", ")} onChange={(e) => setSkills(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          <div className="mt-6 flex justify-between"><button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button><button onClick={handleInterestsNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">Continue →</button></div>
        </div>
      )}

      {/* Step 3: Dynamic pre-event questions */}
      {step === 3 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-ocean-medium">
          <h3 className="font-semibold">Additional Questions</h3>
          <p className="text-xs text-gray-500">Help us understand you better for the buildathon.</p>
          {!preEventQuestions ? (
            <p className="mt-4 text-sm text-gray-400">Loading questions…</p>
          ) : preEventQuestions.length === 0 ? (
            <p className="mt-4 text-sm text-amber-700">No additional questions yet.</p>
          ) : (
            <div className="mt-4 space-y-5 max-h-[52vh] overflow-auto pr-1">
              {preEventQuestions.map((q) => (
                <div key={q._id} className="rounded-xl border bg-gray-50 p-4">
                  <p className="mt-1 text-sm font-medium">{q.textEn}</p>
                  <p className="text-xs text-gray-500">{q.textMy}</p>

                  {/* Single / Scenario */}
                  {(q.type === "single" || q.type === "scenario") && (
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt) => {
                        const sel = questionAnswers[q._id]?.optionIds.includes(opt.id);
                        return (
                          <label key={opt.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm ${sel ? "border-ocean-primary bg-ocean-50" : ""}`}>
                            <input type="radio" name={q._id} checked={!!sel} onChange={() => toggleQuestionAnswer(q._id, opt.id, q.type)} className="accent-ocean-primary" />
                            <span>{opt.labelEn} <span className="text-xs text-gray-400">/ {opt.labelMy}</span></span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Single with text */}
                  {q.type === "single-with-text" && (
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt) => {
                        const sel = questionAnswers[q._id]?.optionIds.includes(opt.id);
                        return (
                          <div key={opt.id}>
                            <label className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm ${sel ? "border-ocean-primary bg-ocean-50" : ""}`}>
                              <input type="radio" name={q._id} checked={!!sel} onChange={() => toggleQuestionAnswer(q._id, opt.id, q.type)} className="accent-ocean-primary" />
                              <span>{opt.labelEn} <span className="text-xs text-gray-400">/ {opt.labelMy}</span></span>
                            </label>
                            {sel && (
                              <input
                                type="text"
                                placeholder="Add more details..."
                                value={questionTextResponses[`${q._id}_${opt.id}`] ?? ""}
                                onChange={(e) => setQuestionTextResponse(`${q._id}_${opt.id}`, e.target.value)}
                                className="mt-2 w-full rounded-lg border border-ocean-primary/30 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Yes/No */}
                  {q.type === "yesno" && (
                    <div className="mt-3 flex gap-3">
                      {["Yes", "No"].map((opt) => {
                        const sel = questionAnswers[q._id]?.optionIds.includes(opt.toLowerCase());
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleQuestionAnswer(q._id, opt.toLowerCase(), q.type)}
                            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${sel ? "border-ocean-primary bg-ocean-50 text-ocean-deep" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Long text */}
                  {q.type === "longtext" && (
                    <textarea
                      placeholder="Type your response here..."
                      value={questionTextResponses[q._id] ?? ""}
                      onChange={(e) => setQuestionTextResponse(q._id, e.target.value)}
                      className="mt-3 min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                  )}

                  {/* Scale */}
                  {q.type === "scale" && (
                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const sel = questionAnswers[q._id]?.optionIds.includes(String(n));
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => toggleQuestionAnswer(q._id, String(n), q.type)}
                            className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition ${sel ? "border-ocean-primary bg-ocean-50 text-ocean-deep" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple (text inputs) */}
                  {q.type === "multiple" && (
                    <div className="mt-3 space-y-2">
                      {Array.from({ length: q.multiTextCount ?? 4 }).map((_, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={q.multiTextPlaceholders?.[idx] ?? `Field ${idx + 1}`}
                          value={questionMultiTextResponses[q._id]?.[idx] ?? ""}
                          onChange={(e) => setQuestionMultiTextResponse(q._id, idx, e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button>
            <button onClick={handleQuestionsComplete} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Complete Pre-Registration →</button>
          </div>
        </div>
      )}

      {step >= PRE_EVENT_STEPS.length && (
        <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Pre-Registration Complete!</h3>
          <p className="mt-2 text-sm text-gray-600">Your basic info has been saved. When the main event opens, you can continue with the assessment.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register/main" className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
              Continue to Main Event →
            </Link>
            <Link href="/dashboard" className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-50">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthGuard>
      <RegisterInner />
    </AuthGuard>
  );
}
