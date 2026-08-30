"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";

const MAIN_EVENT_STEPS = ["Assessment", "Recommended", "Choose Role", "Preferences", "Review"] as const;

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {MAIN_EVENT_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 shrink-0">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === current ? "bg-ocean-primary text-white" : i < current ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>{i < current ? "✓" : i + 1}</div>
          <span className={`hidden text-xs font-semibold md:inline ${i === current ? "text-ocean-deep" : "text-gray-400"}`}>{s}</span>
          {i < MAIN_EVENT_STEPS.length - 1 && <div className={`mx-1 h-0.5 w-6 ${i < current ? "bg-emerald-500" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function MainEventInner() {
  const { participant } = useAuth();
  const [step, setStep] = useState(0);
  const [regId, setRegId] = useState<string | null>(null);

  const [basic, setBasic] = useState({ name: "", email: "", phone: "", university: "", organization: "" });
  const [bg, setBg] = useState({ currentProfession: "", occupation: "", experienceLevel: "student" as "none" | "student" | "junior" | "mid" | "senior" });
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [prefs, setPrefs] = useState({ teamSize: "4", theme: "" });
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [otherRole, setOtherRole] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const myRegs = useQuery(api.buildathonRegistrations.getMyBuildathonRegistrations);
  const roles = useQuery(api.buildathonRoles.listRoles, { activeOnly: false });
  const questions = useQuery(api.roleDiscoveryQuestions.getRoleDiscoveryActiveQuestions, { version: "v1" });
  const recommendation = useQuery(
    api.roleDiscoveryAnswers.getRecommendation,
    regId ? { registrationId: regId as Id<"buildathonRegistrations"> } : "skip"
  );

  const updateReg = useMutation(api.buildathonRegistrations.updateRegistration);
  const submitAnswer = useMutation(api.roleDiscoveryAnswers.submitRoleDiscoveryAnswer);
  const confirmRole = useMutation(api.buildathonRegistrations.confirmRoleSelection);
  const submitReg = useMutation(api.buildathonRegistrations.submitRegistration);
  const calculateRec = useMutation(api.roleDiscoveryAnswers.calculateRecommendations);

  /* eslint-disable react-hooks/set-state-in-effect */
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
        if (draft.preferences) setPrefs({ teamSize: draft.preferences.teamSize ?? "4", theme: draft.preferences.theme ?? "" });
        if (draft.selectedRoleId) setSelectedRoleId(draft.selectedRoleId);

        // Map state to step
        const stateToStep: Record<string, number> = { draft: 0, assessment: 0, recommended: 1, role_selected: 2, submitted: 4 };
        const mappedStep = stateToStep[draft.state] ?? 0;
        setStep(mappedStep);
      }
    }
  }, [myRegs, regId, basic]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const next = () => setStep((s) => Math.min(s + 1, MAIN_EVENT_STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Assessment state
  const [answers, setAnswers] = useState<Record<string, { optionIds: string[]; isNotSure: boolean; start: number }>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});
  const [multiTextResponses, setMultiTextResponses] = useState<Record<string, string[]>>({});

  const toggleAnswer = (qId: string, optId: string, type: string, allowNotSure: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qId] ?? { optionIds: [], isNotSure: false, start: Date.now() };
      if (allowNotSure && optId === "__NOT_SURE__") {
        return { ...prev, [qId]: { optionIds: [], isNotSure: !cur.isNotSure, start: cur.start } };
      }
      if (cur.isNotSure) return prev;
      let nextIds: string[];
      if (type === "single" || type === "scenario" || type === "single-with-text") nextIds = [optId];
      else if (type === "yesno") nextIds = [optId];
      else {
        nextIds = cur.optionIds.includes(optId) ? cur.optionIds.filter((id) => id !== optId) : [...cur.optionIds, optId];
      }
      return { ...prev, [qId]: { ...cur, optionIds: nextIds } };
    });
  };

  const setTextResponse = (qId: string, value: string) => {
    setTextResponses((prev) => ({ ...prev, [qId]: value }));
  };

  const setMultiTextResponse = (qId: string, idx: number, value: string) => {
    setMultiTextResponses((prev) => {
      const arr = [...(prev[qId] ?? [])];
      arr[idx] = value;
      return { ...prev, [qId]: arr };
    });
  };

  const submitAssessment = async () => {
    if (!regId || !questions) return;
    setMsg(null);
    try {
      for (const q of questions) {
        const ans = answers[q._id];
        if (!ans || (ans.optionIds.length === 0 && !ans.isNotSure)) continue;
        const responseMs = Date.now() - ans.start;
        await submitAnswer({ registrationId: regId as Id<"buildathonRegistrations">, questionId: q._id, optionIds: ans.optionIds, isNotSure: ans.isNotSure, responseMs });
      }
      try {
        await calculateRec({ registrationId: regId as Id<"buildathonRegistrations"> });
      } catch (e) {
        console.log("calculateRecommendations failed or no roles seeded", e);
      }
      await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, interests, skills });
      next();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Unknown error"); }
  };

  const handleChooseRole = async () => {
    if (!regId) return;
    const finalRoleId = selectedRoleId === "other" ? undefined : selectedRoleId as Id<"buildathonRoles">;
    if (selectedRoleId === "other" && otherRole.trim()) {
      await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, preferences: { ...prefs, extra: { otherRole: otherRole.trim() } } });
    }
    await confirmRole({ registrationId: regId as Id<"buildathonRegistrations">, selectedRoleId: finalRoleId });
    next();
  };

  const handlePrefsNext = async () => {
    if (!regId) return;
    await updateReg({ registrationId: regId as Id<"buildathonRegistrations">, preferences: prefs });
    next();
  };

  const handleSubmit = async () => {
    if (!regId) return;
    try {
      await submitReg({ registrationId: regId as Id<"buildathonRegistrations"> });
      setMsg("✅ Submitted! Your Buildathon registration is complete.");
      setStep(MAIN_EVENT_STEPS.length);
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Unknown error"); }
  };

  if (!participant) return null;

  const hasDraft = myRegs && myRegs.length > 0;

  const progressPct = Math.round(((step + 1) / MAIN_EVENT_STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-syncopate text-xl font-bold text-ocean-deep md:text-2xl">Main Event Registration</h1>
        <Link href="/register" className="text-xs text-gray-500 hover:underline">← Pre-Event</Link>
      </div>

      {!hasDraft && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need to complete pre-registration first. <Link href="/register" className="font-semibold underline">Go to Pre-Event Registration →</Link>
        </div>
      )}

      {hasDraft && (
        <>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <Stepper current={step} />
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-ocean-primary transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {step < MAIN_EVENT_STEPS.length ? `${progressPct}% — ${MAIN_EVENT_STEPS[step]}` : "Complete"}
            </p>
          </div>

          {msg && <div className="rounded-xl border bg-amber-50 px-4 py-3 text-sm text-amber-800">{msg}</div>}

          {/* Step 0: Assessment */}
          {step === 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm text-ocean-medium">
              <h3 className="font-semibold">Role Discovery Assessment</h3>
              <p className="text-xs text-gray-500">Casual, situational — &ldquo;What would you naturally want to do?&rdquo; Not an exam. Shuffle keeps scoring hidden.</p>
              {!questions ? <p className="mt-4 text-sm text-gray-400">Loading questions… (seed 20–30 via admin)</p> : questions.length === 0 ? <p className="mt-4 text-sm text-amber-700">No questions yet — ask admin to seed Buildathon Role Discovery v1.</p> : (
                <div className="mt-4 space-y-5 max-h-[52vh] overflow-y-auto overscroll-contain pr-1" data-lenis-prevent>
                  {questions.map((q) => {
                    const disabled = answers[q._id]?.isNotSure;
                    return (
                      <div key={q._id} className="rounded-xl border bg-gray-50 p-4">
                        <p className="mt-1 text-sm font-medium">{q.textEn}</p>
                        <p className="text-xs text-gray-500">{q.textMy}</p>

                        {/* Single / Multiple / Scenario */}
                        {(q.type === "single" || q.type === "multiple" || q.type === "scenario") && (
                          <div className="mt-3 grid gap-2">
                            {q.options.map((opt) => {
                              const sel = answers[q._id]?.optionIds.includes(opt.id);
                              return (
                                <label key={opt.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm ${sel ? "border-ocean-primary bg-ocean-50" : ""} ${disabled ? "opacity-40" : ""}`}>
                                  <input type={q.type === "multiple" ? "checkbox" : "radio"} name={q._id} checked={sel} disabled={disabled} onChange={() => toggleAnswer(q._id, opt.id, q.type, !!q.allowNotSure)} className="accent-ocean-primary" />
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
                              const sel = answers[q._id]?.optionIds.includes(opt.id);
                              return (
                                <div key={opt.id}>
                                  <label className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm ${sel ? "border-ocean-primary bg-ocean-50" : ""} ${disabled ? "opacity-40" : ""}`}>
                                    <input type="radio" name={q._id} checked={sel} disabled={disabled} onChange={() => toggleAnswer(q._id, opt.id, q.type, !!q.allowNotSure)} className="accent-ocean-primary" />
                                    <span>{opt.labelEn} <span className="text-xs text-gray-400">/ {opt.labelMy}</span></span>
                                  </label>
                                  {sel && (
                                    <input
                                      type="text"
                                      placeholder="Add more details..."
                                      value={textResponses[`${q._id}_${opt.id}`] ?? ""}
                                      onChange={(e) => setTextResponse(`${q._id}_${opt.id}`, e.target.value)}
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
                              const sel = answers[q._id]?.optionIds.includes(opt.toLowerCase());
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => toggleAnswer(q._id, opt.toLowerCase(), q.type, !!q.allowNotSure)}
                                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${sel ? "border-ocean-primary bg-ocean-50 text-ocean-deep" : "border-gray-200 bg-white hover:bg-gray-50"} ${disabled ? "opacity-40" : ""}`}
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
                            value={textResponses[q._id] ?? ""}
                            onChange={(e) => setTextResponse(q._id, e.target.value)}
                            disabled={disabled}
                            className="mt-3 min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-40"
                          />
                        )}

                        {/* Scale */}
                        {q.type === "scale" && (
                          <div className="mt-3 flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => {
                              const sel = answers[q._id]?.optionIds.includes(String(n));
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => toggleAnswer(q._id, String(n), q.type, !!q.allowNotSure)}
                                  className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition ${sel ? "border-ocean-primary bg-ocean-50 text-ocean-deep" : "border-gray-200 bg-white hover:bg-gray-50"} ${disabled ? "opacity-40" : ""}`}
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
                                value={multiTextResponses[q._id]?.[idx] ?? ""}
                                onChange={(e) => setMultiTextResponse(q._id, idx, e.target.value)}
                                disabled={disabled}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-40"
                              />
                            ))}
                          </div>
                        )}

                        {/* Allow not sure */}
                        {q.allowNotSure && (
                          <label className={`mt-2 flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-sm ${answers[q._id]?.isNotSure ? "border-amber-400 bg-amber-50" : "bg-white"}`}>
                            <input type="checkbox" checked={answers[q._id]?.isNotSure} onChange={() => toggleAnswer(q._id, "__NOT_SURE__", q.type, true)} /> I&apos;m not sure yet.
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={submitAssessment} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">See Recommendations →</button>
              </div>
            </div>
          )}

          {/* Step 1: Recommended */}
          {step === 1 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Recommended Roles</h3>
              <p className="text-xs text-gray-500">These are possibilities, not labels — &ldquo;Not sure where you fit? Let&apos;s explore.&rdquo;</p>
              {!recommendation ? (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p>No recommendation yet — submit assessment or wait for calculation.</p>
                  {roles && roles.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {roles.slice(0, 3).map((r, i) => (
                        <div key={r._id} className="rounded-lg border bg-white px-3 py-2 text-sm">{["🥇","🥈","🥉"][i]} {r.nameEn} — {r.category}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommendation.rankedRoles?.map((rr, i) => {
                    const role = roles?.find((r) => r._id === rr.roleId);
                    return (
                      <div key={rr.roleId} className="rounded-xl border bg-gradient-to-r from-white to-ocean-50 p-4">
                        <div className="flex items-center justify-between"><span className="font-bold">{["🥇","🥈","🥉"][i]} {role?.nameEn ?? rr.roleId}</span><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow">{rr.affinity}%</span></div>
                        <p className="mt-1 text-xs text-gray-600">{rr.explanationEn}</p>
                      </div>
                    );
                  })}
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs inline-block">Confidence: {recommendation.confidence} ({recommendation.confidenceScore}%)</div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={next} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">Choose Your Role →</button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Role */}
          {step === 2 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Which role would you like to explore?</h3>
              <p className="text-xs text-gray-500">You may choose different from recommendation — you decide.</p>
              <div className="mt-4 grid gap-2">
                {(recommendation?.rankedRoles ?? roles?.slice(0, 3) ?? []).map((rr) => {
                  const rid = "roleId" in rr ? rr.roleId : rr._id;
                  const role = roles?.find((r) => r._id === rid);
                  const isSel = selectedRoleId === rid;
                  return (
                    <button key={rid} onClick={() => setSelectedRoleId(rid)} className={`rounded-xl border px-4 py-3 text-left text-sm ${isSel ? "border-ocean-primary bg-ocean-50" : "bg-white hover:bg-gray-50"}`}>
                      {role?.nameEn ?? rid} <span className="text-xs text-gray-400">{role?.category}</span>
                    </button>
                  );
                })}
                <button onClick={() => setSelectedRoleId("other")} className={`rounded-xl border-2 border-dashed px-4 py-3 text-left text-sm ${selectedRoleId === "other" ? "border-amber-400 bg-amber-50" : "bg-white"}`}>Other</button>
                {selectedRoleId === "other" && <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Your chosen role" value={otherRole} onChange={(e) => setOtherRole(e.target.value)} />}
              </div>
              <div className="mt-6 flex justify-between"><button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button><button onClick={handleChooseRole} disabled={!selectedRoleId} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40">Confirm →</button></div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Buildathon Preferences</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Team size pref (3-5)" value={prefs.teamSize} onChange={(e) => setPrefs({ ...prefs, teamSize: e.target.value })} />
                <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Theme / track" value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })} />
              </div>
              <div className="mt-6 flex justify-between"><button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button><button onClick={handlePrefsNext} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">Review →</button></div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Review & Submit</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div><span className="font-semibold">Name:</span> {basic.name} — {basic.email}</div>
                <div><span className="font-semibold">Profession:</span> {bg.currentProfession || "—"} | <span className="font-semibold">Interests:</span> {interests.join(", ") || "—"}</div>
                <div><span className="font-semibold">Selected role:</span> {selectedRoleId === "other" ? otherRole : roles?.find((r) => r._id === selectedRoleId)?.nameEn ?? "—"}</div>
                <div><span className="font-semibold">Reg ID:</span> <span className="font-mono text-xs">{regId ?? "—"}</span></div>
              </div>
              <div className="mt-6 flex justify-between"><button onClick={back} className="rounded-xl border px-5 py-2 text-sm">Back</button><button onClick={handleSubmit} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Submit Registration</button></div>
            </div>
          )}

          {/* Complete */}
          {step >= MAIN_EVENT_STEPS.length && (
            <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Registration Complete!</h3>
              <p className="mt-2 text-sm text-gray-600">Your Buildathon registration is submitted. Good luck!</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/dashboard" className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MainEventPage() {
  return (
    <AuthGuard>
      <MainEventInner />
    </AuthGuard>
  );
}
