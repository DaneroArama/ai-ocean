"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Title from "@/app/assets/Title.webp";
import Shark from "@/app/assets/Mascots/Shark.webp";
import Octo from "@/app/assets/Mascots/Octo.webp";
import Crabi from "@/app/assets/Mascots/Crabi.webp";
import Tuto from "@/app/assets/Mascots/Tuto.webp";
import Ali from "@/app/assets/Mascots/Ali.webp";
import Coral from "@/app/assets/Coral.webp";
import Fishes from "@/app/assets/Fishes.webp";
import Starfish from "@/app/assets/Starfish.webp";

const RATING_LABELS = [
  "Not like me at all",
  "Not really like me",
  "In between",
  "Quite like me",
  "Very much like me",
];

const ARCHETYPE_MASCOTS: Record<string, typeof Shark> = {
  O: Octo,
  C: Shark,
  E: Ali,
  A: Crabi,
  N: Tuto,
};

const ALL_MASCOTS = [Shark, Octo, Crabi, Tuto, Ali];

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "ocean_test_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function TestInner() {
  const questions = useQuery(api.oceanTest.getQuestions);
  const archetypes = useQuery(api.oceanTest.getArchetypes);
  const registeredResult = useQuery(api.oceanTest.getResult);
  const submitTest = useMutation(api.oceanTest.submitTest);
  const saveGuestResult = useMutation(api.oceanTest.saveGuestResult);

  const [sessionId, setSessionId] = useState("");
  const guestResult = useQuery(
    api.oceanTest.getGuestResult,
    sessionId ? { sessionId } : "skip"
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    scores: Record<string, number>;
    finalArchetype: string;
    wasTieBreaker: boolean;
    allSame: boolean;
    tied: string[];
    userType: string;
  } | null>(null);
  const [tieBreakerMode, setTieBreakerMode] = useState(false);
  const [tiedArchetypes, setTiedArchetypes] = useState<string[]>([]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const totalQuestions = tieBreakerMode ? 16 : (questions?.length ?? 15);
  const isLastQuestion = currentIdx >= totalQuestions - 1;

  const currentAnswer = tieBreakerMode
    ? answers["TIE"]
    : questions?.[currentIdx]
      ? answers[questions[currentIdx].id]
      : undefined;

  const handleAnswer = useCallback((score: number) => {
    if (tieBreakerMode) {
      setAnswers((prev) => ({ ...prev, TIE: score }));
    } else if (questions?.[currentIdx]) {
      setAnswers((prev) => ({ ...prev, [questions[currentIdx].id]: score }));
    }
  }, [tieBreakerMode, questions, currentIdx]);

  const handleNext = useCallback(async () => {
    if (currentAnswer === undefined) return;

    if (isLastQuestion && !tieBreakerMode) {
      setSubmitting(true);
      try {
        const answerArray = Object.entries(answers)
          .filter(([k]) => k !== "TIE")
          .map(([questionId, score]) => ({ questionId, score }));
        const res = await submitTest({
          answers: answerArray,
          sessionId: sessionId || undefined,
        });
        const uniqueScores = new Set(answerArray.map((a) => a.score));
        if (res.tied.length > 1 && !res.wasTieBreaker) {
          setTiedArchetypes(res.tied);
          setTieBreakerMode(true);
          setCurrentIdx(15);
          setSubmitting(false);
          return;
        }
        setResult({ ...res, allSame: uniqueScores.size === 1 });
      } catch (e: unknown) {
        console.error(e);
      }
      setSubmitting(false);
      return;
    }

    if (tieBreakerMode && isLastQuestion) {
      setSubmitting(true);
      try {
        const answerArray = Object.entries(answers)
          .filter(([k]) => k !== "TIE")
          .map(([questionId, score]) => ({ questionId, score }));
        answerArray.push({ questionId: "TIE", score: answers["TIE"] ?? 1 });
        const res = await submitTest({
          answers: answerArray,
          sessionId: sessionId || undefined,
        });
        const uniqueScores = new Set(answerArray.map((a) => a.score));
        setResult({ ...res, allSame: uniqueScores.size === 1 });
      } catch (e: unknown) {
        console.error(e);
      }
      setSubmitting(false);
      return;
    }

    setCurrentIdx((i) => i + 1);
  }, [currentAnswer, isLastQuestion, tieBreakerMode, answers, submitTest, sessionId]);

  const handleBack = useCallback(() => {
    setCurrentIdx((i) => Math.max(0, i - 1));
  }, []);

  const handleSaveResult = useCallback(async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      await saveGuestResult({
        sessionId,
        name: guestName || undefined,
        email: guestEmail || undefined,
      });
      setSaved(true);
      setShowSaveModal(false);
    } catch (e: unknown) {
      console.error(e);
    }
    setSaving(false);
  }, [sessionId, guestName, guestEmail, saveGuestResult]);

  // Existing result check
  const existingResult = result ? null : (registeredResult ?? guestResult);
  if (existingResult && !result) {
    const existingArchetype = archetypes?.find((a) => a.letter === existingResult.finalArchetype);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF] p-4">
        <div className="w-full max-w-7xl rounded-3xl bg-white/95 p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4">{existingArchetype?.emoji}</div>
          <h2 className="font-syncopate text-2xl font-bold text-ocean-deep">
            You already took the test!
          </h2>
          <p className="mt-2 text-gray-600">
            Your archetype: <span className="font-bold">{existingResult.finalArchetype}</span>
          </p>
          <Link href="/test/result" className="mt-6 inline-block rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white hover:bg-ocean-deep">
            View Result →
          </Link>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    const archetype = archetypes?.find((a) => a.letter === result.finalArchetype);
    const isGuest = result.userType === "GUEST";
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF] p-4">
          <div className="w-full max-w-7xl rounded-3xl bg-white/95 p-8 text-center shadow-2xl">
            <div className="text-7xl mb-4">{archetype?.emoji}</div>
            <h2 className="font-syncopate text-3xl font-bold text-ocean-deep">
              {archetype?.character}
            </h2>
            <p className="mt-1 text-lg font-semibold text-ocean-primary">{archetype?.name}</p>
            <p className="mt-1 text-sm text-gray-500">{archetype?.animal} • Wave: {archetype?.wave}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {archetype?.traitsEn.map((t) => (
                <span key={t} className="rounded-full bg-ocean-foam px-3 py-1 text-xs font-semibold text-ocean-deep">{t}</span>
              ))}
            </div>
            <p className="mt-5 text-base italic text-gray-600">&ldquo;{archetype?.mottoEn}&rdquo;</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{archetype?.descriptionEn}</p>
            {result.allSame && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                You selected the same answer for every statement. Consider retaking the test for a more accurate result.
              </p>
            )}
            {isGuest && (
              <div className="mt-6 space-y-3">
                {!saved ? (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white hover:bg-ocean-deep"
                  >
                    Save My Result
                  </button>
                ) : (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    Result saved! You can retrieve it with your email.
                  </p>
                )}
                <Link href="/auth/signin" className="block w-full rounded-xl border-2 border-ocean-primary px-6 py-3 font-bold text-ocean-deep hover:bg-ocean-50">
                  Already have an account? Sign in
                </Link>
              </div>
            )}
            {!isGuest && (
              <Link href="/test/result" className="mt-6 inline-block rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white hover:bg-ocean-deep">
                View Full Result →
              </Link>
            )}
            <Link href="/" className="mt-4 block text-sm text-gray-500 hover:text-ocean-deep">
              Back to Home
            </Link>
          </div>
        </div>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Save Your Result</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your details to save your archetype result.
              </p>
              <div className="mt-4 space-y-3">
                <input type="text" placeholder="Name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-ocean-primary focus:outline-none" />
                <input type="email" placeholder="Email (optional)" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-ocean-primary focus:outline-none" />
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowSaveModal(false)} className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveResult} disabled={saving} className="flex-1 rounded-xl bg-ocean-primary px-4 py-3 text-sm font-bold text-white hover:bg-ocean-deep disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
              </div>
              <Link href="/auth/signin" className="mt-3 block text-center text-xs text-gray-500 hover:text-ocean-deep">Or create an account →</Link>
            </div>
          </div>
        )}
      </>
    );
  }

  // Loading
  if (!questions || !archetypes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  // Determine mascot for current question
  const getMascotForQuestion = (idx: number) => {
    if (tieBreakerMode) {
      const tiedLetter = tiedArchetypes[0];
      return ARCHETYPE_MASCOTS[tiedLetter] ?? Shark;
    }
    const q = questions[idx];
    if (q) return ARCHETYPE_MASCOTS[q.archetypeLetter] ?? Shark;
    return ALL_MASCOTS[idx % ALL_MASCOTS.length];
  };
  const MascotComponent = getMascotForQuestion(currentIdx);

  // Tie-breaker mode
  if (tieBreakerMode) {
    const tiedData = archetypes.filter((a) => tiedArchetypes.includes(a.letter));
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF]">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[2%] top-[20%] w-20 opacity-20"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
          <div className="absolute right-[4%] top-[15%] w-16 opacity-15"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
          <div className="absolute left-[50%] top-[60%] w-14 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
          <div className="absolute bottom-[20%] right-[8%] w-16 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        </div>

        {/* Navbar */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
          <div className="w-10" />
          <Link href="/">
            <Image src={Title} alt="AI OCEAN" width={160} height={48} className="h-10 w-auto object-contain" priority />
          </Link>
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </div>

        {/* Yellow progress bar */}
        <div className="relative z-10 h-1 bg-white/30">
          <div className="h-full bg-[#FFD15A] transition-all" style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
        </div>

        {/* Wave counter */}
        <div className="relative z-10 px-4 py-2 md:px-8">
          <p className="text-xs font-semibold text-white/70">Wave 1</p>
          <p className="font-syncopate text-lg font-bold text-white">
            {String(currentIdx + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
          </p>
        </div>

        {/* Question area */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4 w-full max-w-7xl">
          <div className="mb-6 flex items-end gap-3">
            <div className="w-20 shrink-0 md:w-24">
              <Image src={MascotComponent} alt="" width={120} height={120} className="h-auto w-full object-contain drop-shadow-lg" />
            </div>
            <div className="relative max-w-md rounded-2xl bg-[#90E0EF]/80 px-6 py-4 shadow-lg backdrop-blur-sm">
              <p className="font-quicksand text-sm font-bold text-ocean-deep">
                Almost done. Which of these sounds most like you at work?
              </p>
              <div className="absolute -bottom-2 left-6 h-0 w-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-[#90E0EF]/80 border-r-[8px] border-r-transparent" />
            </div>
          </div>

          <div className="w-full max-w-lg space-y-3">
            {tiedData.map((a, idx) => (
              <button
                key={a.letter}
                onClick={() => handleAnswer(idx + 1)}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${
                  answers["TIE"] === idx + 1
                    ? "border-[#FFD15A] bg-white shadow-lg"
                    : "border-white/40 bg-white/80 hover:bg-white"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  answers["TIE"] === idx + 1 ? "bg-[#FFD15A] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.emoji}</span>
                  <div>
                    <p className="font-bold text-ocean-deep">{a.character}</p>
                    <p className="text-sm text-gray-600">{a.tieBreakerStatementEn}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
          <button onClick={handleBack} className="rounded-full bg-white/30 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/40">
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={answers["TIE"] === undefined || submitting}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ocean-deep shadow-lg hover:bg-gray-100 disabled:opacity-40"
          >
            {submitting ? "Calculating…" : "Finish →"}
          </button>
        </div>
      </div>
    );
  }

  // Normal question mode
  const currentQuestion = questions[currentIdx];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF]">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[2%] top-[25%] w-20 opacity-20"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
        <div className="absolute right-[6%] top-[12%] w-16 opacity-15"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
        <div className="absolute left-[40%] top-[65%] w-14 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
        <div className="absolute bottom-[25%] right-[3%] w-16 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        <div className="absolute bottom-[10%] left-[10%] w-12 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]" /></div>
      </div>

      {/* Navbar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
        <div className="w-10" />
        <Link href="/">
          <Image src={Title} alt="AI OCEAN" width={160} height={48} className="h-10 w-auto object-contain" priority />
        </Link>
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </Link>
      </div>

      {/* Yellow progress bar */}
      <div className="relative z-10 h-1 bg-white/30">
        <div className="h-full bg-[#FFD15A] transition-all" style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
      </div>

      {/* Wave counter */}
      <div className="relative z-10 px-4 py-2 md:px-8">
        <p className="font-syncopate text-xs font-normal text-white/70">Wave 1</p>
        <p className="font-syncopate text-lg font-bold text-white">
          {String(currentIdx + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
        </p>
      </div>

      {/* Question area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4">
        {/* Mascot + speech bubble */}
        <div className="mb-8 flex items-end gap-3">
          <div className="w-20 shrink-0 md:w-24">
            <Image src={MascotComponent} alt="" width={120} height={120} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
          <div className="relative max-w-md rounded-2xl bg-[#90E0EF]/80 px-6 py-4 shadow-lg backdrop-blur-sm">
            <p className="font-quicksand text-sm font-bold text-ocean-deep">
              {currentQuestion?.statementEn}
            </p>
            <div className="absolute -bottom-2 left-6 h-0 w-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-[#90E0EF]/80 border-r-[8px] border-r-transparent" />
          </div>
        </div>

        {/* Answer options */}
        <div className="w-full max-w-lg space-y-3">
          {RATING_LABELS.map((label, idx) => {
            const score = idx + 1;
            return (
              <button
                key={score}
                onClick={() => handleAnswer(score)}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${
                  currentAnswer === score
                    ? "border-[#FFD15A] bg-white shadow-lg"
                    : "border-white/40 bg-white/80 hover:bg-white"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  currentAnswer === score ? "bg-[#FFD15A] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {score}
                </span>
                <span className="font-quicksand font-semibold text-ocean-deep">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <button
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="rounded-full bg-white/30 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/40 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined || submitting}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ocean-deep shadow-lg hover:bg-gray-100 disabled:opacity-40"
        >
          {submitting ? "Calculating…" : isLastQuestion ? "Finish →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default function TestPage() {
  return <TestInner />;
}
