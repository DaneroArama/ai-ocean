"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Title from "@/app/assets/Title.png";
import BlueTitle from "@/app/assets/Title_coloured.png";
import Shell1 from "@/app/assets/Shell_1.png";
import Shell2 from "@/app/assets/Shell_2.png";
import Logo from "@/app/assets/event_logo.png"
import ProgressIndicator from "@/app/assets/event_logo_yellow.png"
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Ali from "@/app/assets/Mascots/Ali.png";
import Coral from "@/app/assets/Coral.png";
import Fishes from "@/app/assets/FIshes.png";
import Starfish from "@/app/assets/Starfish.png";

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
  const rawQuestions = useQuery(api.oceanTest.getQuestions);
  const archetypes = useQuery(api.oceanTest.getArchetypes);
  const registeredResult = useQuery(api.oceanTest.getResult);
  const submitTest = useMutation(api.oceanTest.submitTest);
  const saveGuestResult = useMutation(api.oceanTest.saveGuestResult);

  // Shuffle questions on the client (Convex queries must be deterministic)
  const [questions, setQuestions] = useState<typeof rawQuestions>(undefined);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (rawQuestions && !questions) {
      const a = [...rawQuestions];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      setQuestions(a);
    }
  }, [rawQuestions, questions]);

  const [sessionId, setSessionId] = useState("");
  const guestResult = useQuery(
    api.oceanTest.getGuestResult,
    sessionId ? { sessionId } : "skip"
  );
  const [showIntro, setShowIntro] = useState(true);
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

  const handleAnswerAndAdvance = useCallback((score: number) => {
    handleAnswer(score);
    setTimeout(() => {
      if (isLastQuestion && !tieBreakerMode) {
        handleNext();
      } else if (tieBreakerMode && isLastQuestion) {
        handleNext();
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 300);
  }, [handleAnswer, isLastQuestion, tieBreakerMode, handleNext]);

  // Intro screen
  if (showIntro) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#D6EEFF] via-[#E8F6FF] to-[#C5E8FF]">
        {/* Background assets at low opacity */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[5%] top-[10%] w-16 opacity-20 md:w-24"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
          <div className="absolute right-[8%] top-[20%] w-14 opacity-15 md:w-20"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
          <div className="absolute left-[15%] top-[55%] w-12 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
          <div className="absolute bottom-[15%] right-[12%] w-14 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
          <div className="absolute bottom-[30%] left-[8%] w-10 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]" /></div>
          <div className="absolute right-[5%] bottom-[10%] w-12 opacity-15"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
        </div>

        {/* Mascots */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[2%] top-[8%] w-20 rotate-[-15deg] md:left-[8%] md:w-28">
            <Image src={Tuto} alt="" width={140} height={160} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
          <div className="absolute right-[2%] top-[5%] w-24 rotate-[10deg] md:right-[10%] md:w-32">
            <Image src={Octo} alt="" width={160} height={150} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
          <div className="absolute left-1/2 top-[22%] w-28 -translate-x-1/2 md:w-40">
            <Image src={Shark} alt="" width={200} height={180} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
          <div className="absolute bottom-[12%] left-[4%] w-24 rotate-[5deg] md:left-[10%] md:w-32">
            <Image src={Crabi} alt="" width={160} height={160} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
          <div className="absolute bottom-[10%] right-[4%] w-28 rotate-[-8deg] md:right-[10%] md:w-36">
            <Image src={Ali} alt="" width={180} height={160} className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10 mt-8 text-center">
          <h1
            className="font-dynapuff text-4xl font-normal leading-tight text-ocean-light md:text-6xl"
            style={{
              WebkitTextStroke: "6px #ffffff",
              paintOrder: "stroke fill",
            }}
          >
            How do you<br />Ride the Wave?
          </h1>
          <p
            className="mt-4 font-dynapuff text-xl font-normal text-[#FFB02E] md:text-2xl"
            style={{
              WebkitTextStroke: "10px #ffffff",
              paintOrder: "stroke fill",
            }}
          >
            Discover your OCEAN archetype
          </p>
          <button
            onClick={() => setShowIntro(false)}
            className="mt-8 rounded-full bg-[#FFA700] px-8 py-3 font-dynapuff text-base font-bold text-white transition-all hover:scale-105 hover:from-[#FFD86B] hover:to-[#FFB02E] active:scale-95"
            style={{
              boxShadow: "0 4px 0 #ffffff, 0 6px 16px rgba(0,0,0,0.2)",
            }}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // Existing result check
  const existingResult = result ? null : (registeredResult ?? guestResult);
  if (existingResult && !result) {
    const existingArchetype = archetypes?.find((a) => a.letter === existingResult.finalArchetype);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF] p-4">
        <div className="w-full max-w-7xl rounded-3xl bg-white/95 p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4">{existingArchetype?.emoji}</div>
          <h2 className="font-dynapuff text-2xl font-bold text-ocean-deep">
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
            <h2 className="font-dynapuff text-3xl font-bold text-ocean-deep">
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
                <Link href="/test/result" className="block w-full rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white hover:bg-ocean-deep">
                  View Full Result →
                </Link>
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
              <h3 className="font-dynapuff text-xl font-bold text-ocean-deep">Save Your Result</h3>
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

  // Submitting
  if (submitting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#D6EEFF] via-[#E8F6FF] to-[#C5E8FF]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[5%] top-[20%] w-16 opacity-20 md:w-24"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
          <div className="absolute right-[8%] top-[12%] w-14 opacity-15 md:w-20"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
        </div>
        <div className="relative z-10 text-center">
          <Image src={Logo} alt="" width={64} height={64} className="mx-auto mb-4 h-16 w-16 animate-bounce object-contain" />
          <h2 className="font-dynapuff text-2xl font-bold text-[#0A3D62]">Calculating your archetype...</h2>
          <p className="mt-2 text-[#0A3D62]/70">Hang tight, riding the wave!</p>
        </div>
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
            <Image src={BlueTitle} alt="AI OCEAN" width={160} height={48} className="h-10 w-auto object-contain" priority />
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
          <p className="font-dynapuff text-lg font-bold text-white">
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
              <p className="font-dynapuff text-sm font-bold text-ocean-deep">
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#D6EEFF] via-[#E8F6FF] to-[#C5E8FF]">
      {/* Background assets at low opacity */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[5%] top-[20%] w-16 opacity-20 md:w-24"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
        <div className="absolute right-[8%] top-[12%] w-14 opacity-15 md:w-20"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
        <div className="absolute left-[40%] top-[65%] w-12 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
        <div className="absolute bottom-[20%] right-[5%] w-14 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        <div className="absolute bottom-[10%] left-[10%] w-10 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]" /></div>
      </div>

      {/* Header: Title + Question Counter */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
        <Link href="/">
          <Image src={BlueTitle} alt="AI OCEAN" width={140} height={42} className="h-9 w-auto object-contain" priority />
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-[#0A3D62] px-3 py-1.5">
          <Image src={Logo} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
          <span className="font-dynapuff text-sm font-bold text-white">
            {currentIdx + 1}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Comic-style progress bar */}
      <div className="relative z-10 px-4 py-3 md:px-8">
        <div className="relative h-3 w-full rounded-full border-2 border-white shadow-xl bg-white/60">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-linear-to-t from-[#FFD15A] to-[#FFA726] transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
          {/* Shell following progress */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `calc(${((currentIdx + 1) / totalQuestions) * 100}% - 12px)` }}
          >
            <Image src={ProgressIndicator} alt="" width={24} height={24} className="h-6 w-6 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-4">
        <p className="font-dynapuff text-center text-xl font-normal leading-snug text-[#0A3D62] md:text-2xl lg:text-3xl">
          {currentQuestion?.statementEn}
        </p>

        {/* Answer options — 3D pill buttons */}
        <div className="mt-8 w-full max-w-md space-y-3">
          {RATING_LABELS.map((label, idx) => {
            const score = idx + 1;
            return (
              <button
                key={score}
                onClick={() => handleAnswerAndAdvance(score)}
                className={`w-full rounded-full border-[2.5px] border-[#0A3D62]/80 bg-white px-6 py-3.5 text-center font-dynapuff text-sm font-semibold text-[#0A3D62] transition-all active:translate-y-[2px] active:shadow-none ${
                  currentAnswer === score
                    ? "bg-[#0A3D62] text-white shadow-none translate-y-[2px]"
                    : "shadow-[0_4px_0_#0A3D62]/30 hover:shadow-[0_5px_0_#0A3D62]/40 hover:translate-y-[-1px]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom nav: Home + Previous */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3D62] text-white shadow-lg transition-all hover:bg-[#0A3D62]/80 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </Link>
        <button
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3D62] text-white shadow-lg transition-all hover:bg-[#0A3D62]/80 active:scale-95 disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function TestPage() {
  return <TestInner />;
}
