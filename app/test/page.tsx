"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import Title from "@/app/assets/Title.png";
import BlueTitle from "@/app/assets/Title_coloured.png";
import Logo from "@/app/assets/event_logo.png";
import ProgressIndicator from "@/app/assets/event_logo_yellow.png";
import UxmmLogo from "@/app/assets/uxmm_logo.svg";
import HubLogo from "@/app/assets/uxmm_hub_logo.svg";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Ali from "@/app/assets/Mascots/Ali.png";
import Coral from "@/app/assets/Coral.png";
import Fishes from "@/app/assets/FIshes.png";
import Starfish from "@/app/assets/Starfish.png";

const RATING_LABELS = {
  en: ["Not like me at all", "Not really like me", "In between", "Quite like me", "Very much like me"],
  my: ["ဟင့်အင်း ဟုတ်ဘူး", "ဟုတ်တော့ဟုတ်ဘူးလေ", "ဒီလိုပါဘဲ..", "ဟုတ်သားဘဲ", "အမှန်ဘဲတော်"],
};

const BG_COLORS = [
  "from-[#FFE8E8] via-[#FFF0F0] to-[#FFD6D6]",
  "from-[#D6EEFF] via-[#E8F6FF] to-[#C5E8FF]",
  "from-[#E8FFE8] via-[#F0FFF0] to-[#D6FFD6]",
  "from-[#F0E8FF] via-[#F5F0FF] to-[#E4D6FF]",
];

const ARCHETYPE_MASCOTS: Record<string, typeof Shark> = {
  O: Octo,
  C: Shark,
  E: Ali,
  A: Crabi,
  N: Tuto,
};

const ALL_MASCOTS = [Shark, Octo, Crabi, Tuto, Ali];

const INTRO_MASCOTS = [
  { name: "Tuto", src: Tuto, className: "left-[-25%] top-[2%] w-64 md:left-[8%] md:w-[300px]", mobileRotation: 130, desktopRotation: -30 },
  { name: "Octo", src: Octo, className: "right-[-30%] top-[5%] w-64 md:right-[10%] md:w-[300px]", mobileRotation: -20, desktopRotation: -30 },
  { name: "Shark", src: Shark, className: "left-[20%] top-[20%] md:left-[40%] w-56 -translate-x-1/2 md:w-[300px]", mobileRotation: 0, desktopRotation: 10 },
  { name: "Crabi", src: Crabi, className: "left-[-20%] bottom-[-8%] w-72 md:left-[10%] md:w-[300px]", mobileRotation: 20, desktopRotation: 15 },
  { name: "Ali", src: Ali, className: "right-[-30%] bottom-[12%] w-72 md:right-[10%] md:bottom-[12%] md:w-[300px]", mobileRotation: -20, desktopRotation: -25 },
];

const BUBBLES = [
  { left: "8%", size: 14 },
  { left: "15%", size: 10 },
  { left: "22%", size: 18 },
  { left: "30%", size: 8 },
  { left: "38%", size: 14 },
  { left: "45%", size: 10 },
  { left: "52%", size: 16 },
  { left: "60%", size: 12 },
  { left: "68%", size: 9 },
  { left: "75%", size: 14 },
  { left: "82%", size: 11 },
  { left: "90%", size: 16 },
];

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

// ─── Splash Screen ───────────────────────────────────────────────────────────

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });

      document.documentElement.style.overflow = "hidden";

      tl.set(".splash-title", { autoAlpha: 0, scale: 0.5, y: 50, rotation: -6 })
        .set(".splash-logo", { autoAlpha: 0, scale: 0, y: 30 })
        .set(".splash-bubble", { willChange: "transform" })
        .set(root, { autoAlpha: 1, filter: "blur(0px)" });

      tl.to(".splash-title", {
        autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.9, ease: "back.out(1.6)",
      }).to(
        ".splash-logo",
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "back.out(2)" },
        "-=0.4",
      );

      gsap.to(".splash-bob", {
        y: -10, rotation: 2,
        duration: () => gsap.utils.random(1.6, 2.4),
        repeat: -1, yoyo: true, ease: "sine.inOut",
        delay: () => gsap.utils.random(0, 0.6),
      });

      gsap.utils.toArray<HTMLElement>(".splash-bubble").forEach((bubble) => {
        gsap.fromTo(bubble, { y: 60 }, {
          y: -window.innerHeight,
          duration: () => gsap.utils.random(3.5, 6),
          repeat: -1, delay: () => gsap.utils.random(0, 3), ease: "none",
        });
      });

      tl.to(root, {
        opacity: 0, autoAlpha: 0,
        filter: "blur(24px)", duration: 1.2, ease: "power2.inOut",
      }, "+=1.5");
    }, root);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0A3D62] via-[#0CB6FF] to-[#5DADE2]"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <Image src={Logo} alt="" width={800} height={800} className="h-[80vh] w-auto opacity-[0.06] object-contain" />
      </div>

      {BUBBLES.map((bubble, i) => (
        <span
          key={i}
          className="splash-bubble absolute bottom-[-40px] rounded-full border-2 border-white/60 bg-white/20 opacity-40"
          style={{ left: bubble.left, width: bubble.size, height: bubble.size }}
        />
      ))}

      <div className="relative flex w-[min(92vw,600px)] flex-col items-center justify-center">
        <div className="splash-bob splash-title opacity-0">
          <Image src={Title} alt="Into the Ai Ocean" width={728} height={182}
            className="h-auto w-[min(78vw,420px)] drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]" priority />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="splash-logo opacity-0">
            <Image src={UxmmLogo} alt="UXmm" width={80} height={40} className="h-10 w-auto" />
          </div>
          <div className="splash-logo opacity-0">
            <Image src={HubLogo} alt="Hub" width={60} height={40} className="h-10 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Start Screen ────────────────────────────────────────────────────────────

function StartScreen({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      document.documentElement.style.overflow = "hidden";

      const isMobile = window.innerWidth < 768; // md breakpoint

      gsap.fromTo(".start-mascot",
        { autoAlpha: 0, scale: 0, y: 40, rotation: (i, el) => {
          const mobileRot = parseFloat(el.dataset.mobileRotation || "0");
          const desktopRot = parseFloat(el.dataset.desktopRotation || "0");
          return isMobile ? mobileRot : desktopRot;
        }},
        { autoAlpha: 1, scale: 1, y: 0, rotation: (i, el) => {
          const mobileRot = parseFloat(el.dataset.mobileRotation || "0");
          const desktopRot = parseFloat(el.dataset.desktopRotation || "0");
          return isMobile ? mobileRot : desktopRot;
        },
          duration: 0.6, stagger: 0.12,
          ease: "back.out(2.2)", delay: 0.2,
        });
      gsap.fromTo(".start-text", { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.8,
      });
      gsap.fromTo(".start-btn", { autoAlpha: 0, scale: 0.8 }, {
        autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)", delay: 1.2,
      });
      gsap.fromTo(".start-title", { autoAlpha: 0, y: -20 }, {
        autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.3,
      });
      gsap.to(".start-bob", {
        y: -8,
        duration: () => gsap.utils.random(1.8, 2.6),
        repeat: -1, yoyo: true, ease: "sine.inOut",
        delay: () => gsap.utils.random(0, 0.5),
      });
    }, root);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#D6EEFF] via-[#E8F6FF] to-[#C5E8FF]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src={Logo} alt="" width={1200} height={1200} className="h-[90vh] w-auto opacity-[0.08] object-contain" />
        </div>
        <div className="absolute left-[5%] top-[10%] w-16 opacity-20 md:w-24">
          <Image src={Coral} alt="" width={80} height={60} className="object-contain" />
        </div>
        <div className="absolute right-[8%] top-[20%] w-14 opacity-15 md:w-20">
          <Image src={Starfish} alt="" width={64} height={64} className="object-contain" />
        </div>
        <div className="absolute left-[15%] top-[55%] w-12 opacity-10">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain" />
        </div>
        <div className="absolute bottom-[15%] right-[12%] w-14 opacity-15">
          <Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" />
        </div>
        <div className="absolute bottom-[30%] left-[8%] w-10 opacity-10">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]" />
        </div>
        <div className="absolute right-[5%] bottom-[10%] w-12 opacity-15">
          <Image src={Starfish} alt="" width={64} height={64} className="object-contain" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {INTRO_MASCOTS.map((m) => (
          <div key={m.name} className={`start-mascot start-bob absolute opacity-0 ${m.className}`} 
            data-mobile-rotation={m.mobileRotation}
            data-desktop-rotation={m.desktopRotation}>
            <Image src={m.src} alt={m.name} width={160} height={160}
              className="h-auto w-full object-contain drop-shadow-lg" />
          </div>
        ))}
      </div>

      <div className="start-title absolute top-10 z-10 opacity-0">
        <Image src={BlueTitle} alt="AI OCEAN" width={180} height={54}
          className="h-12 w-auto object-contain" priority />
      </div>

      <div className="start-text relative z-10 mt-8 text-center opacity-0">
        <h1 className="text-4xl font-normal text-ocean-light md:text-6xl"
          style={{ WebkitTextStroke: "6px #ffffff", paintOrder: "stroke fill" }}>
          How do you<br />Ride the Wave?
        </h1>
        <p className="mt-4 font-quicksand text-xl font-semibold text-[#FFB02E] md:text-2xl"
          style={{ WebkitTextStroke: "5px #ffffff", paintOrder: "stroke fill" }}>
          Discover your OCEAN archetype
        </p>
        <button
          onClick={onStart}
          className="start-btn mt-8 rounded-full bg-[#FFA700] px-8 py-3 font-dynapuff text-base font-bold text-white opacity-0 transition-all hover:scale-105 hover:from-[#FFD86B] hover:to-[#FFB02E] active:scale-95"
          style={{ boxShadow: "0 4px 0 #ffffff, 0 6px 16px rgba(0,0,0,0.2)" }}
        >
          Start Test
        </button>
      </div>
    </div>
  );
}

// ─── Test Question Screen ────────────────────────────────────────────────────

function TestQuestion() {
  const rawQuestions = useQuery(api.oceanTest.getQuestions);
  const archetypes = useQuery(api.oceanTest.getArchetypes);
  const registeredResult = useQuery(api.oceanTest.getResult);
  const submitTest = useMutation(api.oceanTest.submitTest);
  const router = useRouter();

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [tieBreakerMode, setTieBreakerMode] = useState(false);
  const [tiedArchetypes, setTiedArchetypes] = useState<string[]>([]);
  const [lang, setLang] = useState<"en" | "my">("en");
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");
  const questionRef = useRef<HTMLDivElement>(null);

  // Random bg colors — no 2 in a row
  const lastBgRef = useRef(0);
  const [bgIdx, setBgIdx] = useState(0);

  // Ref to always have latest answers (avoids stale closures)
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Change bg color on question change — no 2 in a row
  useEffect(() => {
    if (currentIdx === 0) return;
    let next = Math.floor(Math.random() * BG_COLORS.length);
    while (next === lastBgRef.current) next = Math.floor(Math.random() * BG_COLORS.length);
    lastBgRef.current = next;
    setBgIdx(next);
  }, [currentIdx]);

  // Question transition animation
  useEffect(() => {
    if (!questionRef.current) return;
    const el = questionRef.current;
    gsap.fromTo(el,
      { opacity: 0, x: animDir === "next" ? 60 : -60 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [currentIdx, animDir]);

  const currentAnswer = tieBreakerMode
    ? answers["TIE"]
    : questions?.[currentIdx]
      ? answers[questions[currentIdx].id]
      : undefined;

  const totalQuestions = tieBreakerMode ? 16 : (questions?.length ?? 15);
  const isLastQuestion = currentIdx >= totalQuestions - 1;

  const handleNext = useCallback(async (overrideScore?: number) => {
    // Use ref for always-fresh answers (avoids stale closures)
    const latestAnswers = answersRef.current;
    const hasAnswer = overrideScore !== undefined
      ? true
      : tieBreakerMode
        ? latestAnswers["TIE"] !== undefined
        : questions?.[currentIdx]
          ? latestAnswers[questions[currentIdx].id] !== undefined
          : false;
    if (!hasAnswer) return;

    if (isLastQuestion && !tieBreakerMode) {
      setSubmitting(true);
      try {
        const answerArray = Object.entries(latestAnswers)
          .filter(([k]) => k !== "TIE")
          .map(([questionId, score]) => ({ questionId, score }));
        const res = await submitTest({
          answers: answerArray,
          sessionId: sessionId || undefined,
        });
        if (res.tied.length > 1 && !res.wasTieBreaker) {
          setTiedArchetypes(res.tied);
          setTieBreakerMode(true);
          setCurrentIdx(15);
          setSubmitting(false);
          return;
        }
        router.push("/test/result");
      } catch (e: unknown) {
        console.error(e);
      }
      setSubmitting(false);
      return;
    }

    if (tieBreakerMode && isLastQuestion) {
      setSubmitting(true);
      try {
        const answerArray = Object.entries(latestAnswers)
          .filter(([k]) => k !== "TIE")
          .map(([questionId, score]) => ({ questionId, score }));
        answerArray.push({ questionId: "TIE", score: overrideScore ?? latestAnswers["TIE"] ?? 1 });
        await submitTest({
          answers: answerArray,
          sessionId: sessionId || undefined,
        });
        router.push("/test/result");
      } catch (e: unknown) {
        console.error(e);
      }
      setSubmitting(false);
      return;
    }

    setCurrentIdx((i) => i + 1);
  }, [tieBreakerMode, isLastQuestion, currentIdx, questions, submitTest, sessionId, router]);

  const handleBack = useCallback(() => {
    setAnimDir("prev");
    setCurrentIdx((i) => Math.max(0, i - 1));
  }, []);

  const handleAnswer = useCallback((score: number) => {
    if (tieBreakerMode) {
      const next = { ...answersRef.current, TIE: score };
      setAnswers(next);
      answersRef.current = next;
    } else if (questions?.[currentIdx]) {
      const next = { ...answersRef.current, [questions[currentIdx].id]: score };
      setAnswers(next);
      answersRef.current = next;
    }
  }, [tieBreakerMode, questions, currentIdx]);

  const handleAnswerAndAdvance = useCallback((score: number) => {
    handleAnswer(score);
    if (isLastQuestion) {
      handleNext(score);
    } else {
      setAnimDir("next");
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
      }, 300);
    }
  }, [handleAnswer, isLastQuestion, handleNext]);

  const getMascotForQuestion = (idx: number) => {
    if (tieBreakerMode) {
      const tiedLetter = tiedArchetypes[0];
      return ARCHETYPE_MASCOTS[tiedLetter] ?? Shark;
    }
    const q = questions?.[idx];
    if (q) return ARCHETYPE_MASCOTS[q.archetypeLetter] ?? Shark;
    return ALL_MASCOTS[idx % ALL_MASCOTS.length];
  };
  const MascotComponent = getMascotForQuestion(currentIdx);

  // Existing result — redirect to result page
  const existingResult = registeredResult ?? guestResult;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (existingResult) {
      router.replace("/test/result");
    }
  }, [existingResult, router]);

  if (existingResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0CB6FF]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
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
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={Logo} alt="" width={800} height={800} className="h-[60vh] w-auto opacity-[0.04] object-contain" />
          </div>
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

  // Tie-breaker mode
  if (tieBreakerMode) {
    const tiedData = archetypes.filter((a) => tiedArchetypes.includes(a.letter));
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={Logo} alt="" width={800} height={800} className="h-[60vh] w-auto opacity-[0.06] object-contain" />
          </div>
          <div className="absolute left-[2%] top-[20%] w-20 opacity-20"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
          <div className="absolute right-[4%] top-[15%] w-16 opacity-15"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
          <div className="absolute left-[50%] top-[60%] w-14 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
          <div className="absolute bottom-[20%] right-[8%] w-16 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        </div>

        <div className="relative z-10 flex items-center justify-center px-4 py-3 md:px-8">
          <Link href="/"><Image src={BlueTitle} alt="AI OCEAN" width={160} height={48} className="h-10 w-auto object-contain" priority /></Link>
        </div>
        <div className="relative z-10 h-1 bg-white/30">
          <div className="h-full bg-[#FFD15A] transition-all" style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
        </div>
        <div className="relative z-10 px-4 py-2 md:px-8">
          <p className="text-xs font-semibold text-white/70">Wave 1</p>
          <p className="font-dynapuff text-lg font-bold text-white">
            {String(currentIdx + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
          </p>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4 w-full max-w-7xl">
          <div className="mb-6 flex items-end gap-3">
            <div className="w-20 shrink-0 md:w-24">
              <Image src={MascotComponent} alt="" width={120} height={120} className="h-auto w-full object-contain drop-shadow-lg" />
            </div>
            <div className="relative max-w-md rounded-2xl bg-[#90E0EF]/80 px-6 py-4 shadow-lg backdrop-blur-sm">
              <p className="font-dynapuff text-sm font-bold text-ocean-deep">Almost done. Which of these sounds most like you at work?</p>
              <div className="absolute -bottom-2 left-6 h-0 w-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-[#90E0EF]/80 border-r-[8px] border-r-transparent" />
            </div>
          </div>
          <div className="w-full max-w-lg space-y-3">
            {tiedData.map((a, idx) => (
              <button key={a.letter} onClick={() => handleAnswer(idx + 1)}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${answers["TIE"] === idx + 1 ? "border-[#FFD15A] bg-white shadow-lg" : "border-white/40 bg-white/80 hover:bg-white"}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${answers["TIE"] === idx + 1 ? "bg-[#FFD15A] text-white" : "bg-gray-100 text-gray-500"}`}>
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

        <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
          <div className="w-10" />
          <button onClick={() => handleNext()} disabled={answers["TIE"] === undefined || submitting}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ocean-deep shadow-lg hover:bg-gray-100 disabled:opacity-40">
            {submitting ? "Calculating…" : "Finish →"}
          </button>
        </div>
      </div>
    );
  }

  // Normal question mode
  const currentQuestion = questions[currentIdx];

  return (
    <div className={`relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b ${BG_COLORS[bgIdx]}`}>
      {/* Big event logo bg */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src={Logo} alt="" width={800} height={800} className="h-[65vh] w-auto opacity-[0.06] object-contain" />
        </div>
        <div className="absolute left-[5%] top-[20%] w-16 opacity-20 md:w-24"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
        <div className="absolute right-[8%] top-[12%] w-14 opacity-15 md:w-20"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
        <div className="absolute left-[40%] top-[65%] w-12 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
        <div className="absolute bottom-[20%] right-[5%] w-14 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        <div className="absolute bottom-[10%] left-[10%] w-10 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]" /></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
        <Link href="/"><Image src={BlueTitle} alt="AI OCEAN" width={140} height={42} className="h-9 w-auto object-contain" priority /></Link>
        <div className="flex items-center gap-2">
          {/* Language changer */}
          <button onClick={() => setLang(lang === "en" ? "my" : "en")}
            className="rounded-full border-2 border-[#0A3D62]/30 bg-white/80 px-3 py-1 font-syne text-xs font-bold text-[#0A3D62] transition-all hover:bg-[#0A3D62] hover:text-white active:scale-95">
            {lang === "en" ? "မြန်မာ" : "ENG"}
          </button>
          <div className="flex items-center gap-2 rounded-full bg-[#0A3D62] px-3 py-1.5">
            <Image src={Logo} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
            <span className="font-dynapuff text-sm font-bold text-white">{currentIdx + 1}/{totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-4 py-3 md:px-8">
        <div className="relative h-3 w-full rounded-full border-2 border-white shadow-xl bg-white/60">
          <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-t from-[#FFD15A] to-[#FFA726] transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `calc(${((currentIdx + 1) / totalQuestions) * 100}% - 12px)` }}>
            <Image src={ProgressIndicator} alt="" width={24} height={24} className="h-6 w-6 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Question + answers with animation */}
      <div ref={questionRef} className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-4">
        <p className="font-dynapuff text-center text-xl font-normal leading-snug text-[#0A3D62] md:text-2xl lg:text-3xl">
          {lang === "en" ? currentQuestion?.statementEn : currentQuestion?.statementMy}
        </p>
        <div className="mt-8 w-full max-w-md space-y-3">
          {RATING_LABELS[lang].map((label, idx) => {
            const score = idx + 1;
            const isSelected = currentAnswer === score;
            return (
              <button key={score} onClick={() => handleAnswerAndAdvance(score)}
                className={`w-full rounded-full border-[2.5px] px-6 py-3.5 text-center font-dynapuff text-sm font-semibold transition-all active:translate-y-[2px] active:shadow-none ${
                  isSelected
                    ? "border-[#0A3D62] bg-[#0A3D62] text-white shadow-none translate-y-[2px] scale-[1.02]"
                    : "border-[#0A3D62]/60 bg-white text-[#0A3D62] shadow-[0_4px_0_#0A3D62]/25 hover:shadow-[0_6px_0_#0A3D62]/35 hover:translate-y-[-2px] hover:scale-[1.01] hover:bg-[#0A3D62]/5"
                }`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8">
        <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3D62] text-white shadow-lg transition-all hover:bg-[#0A3D62]/80 active:scale-95">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </Link>
        <button onClick={handleBack} disabled={currentIdx === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3D62] text-white shadow-lg transition-all hover:bg-[#0A3D62]/80 active:scale-95 disabled:opacity-40">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TestPage() {
  const [phase, setPhase] = useState<"splash" | "start" | "test">("splash");

  if (phase === "splash") {
    return <SplashScreen onComplete={() => setPhase("start")} />;
  }

  if (phase === "start") {
    return <StartScreen onStart={() => setPhase("test")} />;
  }

  return <TestQuestion />;
}
