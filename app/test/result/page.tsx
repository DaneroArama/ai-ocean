"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Title from "@/app/assets/Title.png";
import Logo from "@/app/assets/event_logo.png";
import UxmmLogo from "@/app/assets/uxmm_logo.svg";
import HubLogo from "@/app/assets/uxmm_hub_logo.svg";
import Coral from "@/app/assets/Coral.png";
import Fishes from "@/app/assets/FIshes.png";
import Starfish from "@/app/assets/Starfish.png";

import SharkImg from "@/app/assets/Mascots/Shark.png";
import OctoImg from "@/app/assets/Mascots/Octo.png";
import CrabiImg from "@/app/assets/Mascots/Crabi.png";
import TutoImg from "@/app/assets/Mascots/Tuto.png";
import AliImg from "@/app/assets/Mascots/Ali.png";

import SharkPattern from "@/app/assets/Mascots/Sharkie pattern.png";
import OctoPattern from "@/app/assets/Mascots/Otto Pattern.png";
import CrabiPattern from "@/app/assets/Mascots/Crabbi patten.png";
import TurtyPattern from "@/app/assets/Mascots/Turty Pattern.png";
import AliPattern from "@/app/assets/Mascots/Croco Pattern.png"

const ARCHETYPE_THEMES: Record<string, {
  bg: string;
  cardBg: string;
  imgBg: string;
  badgeBg: string;
  traitBg: string;
  traitBorder: string;
  traitText: string;
  text: string;
  subtitle: string;
  mascot: typeof SharkImg;
  pattern?: typeof SharkPattern;
}> = {
  C: {
    bg: "from-[#94BFD1] to-[#70AAC2]",
    cardBg: "bg-white",
    imgBg: "bg-[#9cc5d8]",
    badgeBg: "bg-[#f5a623]",
    traitBg: "bg-white",
    traitBorder: "border-[#9cc5d8]",
    traitText: "text-[#3a7ca5]",
    text: "text-[#2c5f7c]",
    subtitle: "text-[#5a9bb5]",
    mascot: SharkImg,
    pattern: SharkPattern,
  },
  O: {
    bg: "from-[#C7AAFE] to-[#A676FD]",
    cardBg: "bg-white",
    imgBg: "bg-[#b08fc4]",
    badgeBg: "bg-[#f5a623]",
    traitBg: "bg-white",
    traitBorder: "border-[#b08fc4]",
    traitText: "text-[#7b4a9e]",
    text: "text-[#4a2d6e]",
    subtitle: "text-[#9b6db5]",
    mascot: OctoImg,
    pattern: OctoPattern,
  },
  E: {
    bg: "from-[#99B795] to-[#6E9868]",
    cardBg: "bg-white",
    imgBg: "bg-[#8ec4b5]",
    badgeBg: "bg-[#f5a623]",
    traitBg: "bg-white",
    traitBorder: "border-[#8ec4b5]",
    traitText: "text-[#3a8a6e]",
    text: "text-[#2c6b52]",
    subtitle: "text-[#5aaa90]",
    mascot: AliImg,
    pattern: AliPattern,
  },
  A: {
    bg: "from-[#F8926D] to-[#F66835]",
    cardBg: "bg-white",
    imgBg: "bg-[#d4a574]",
    badgeBg: "bg-[#f5a623]",
    traitBg: "bg-white",
    traitBorder: "border-[#d4a574]",
    traitText: "text-[#a06830]",
    text: "text-[#7a4e22]",
    subtitle: "text-[#c08850]",
    mascot: CrabiImg,
    pattern: CrabiPattern,
  },
  N: {
    bg: "from-[#99B795] to-[#6E9868]",
    cardBg: "bg-white",
    imgBg: "bg-[#587953]",
    badgeBg: "bg-[#f5a623]",
    traitBg: "bg-white",
    traitBorder: "border-[#587953]",
    traitText: "text-[#587953]",
    text: "text-[#587953]",
    subtitle: "text-[#587953]",
    mascot: TutoImg,
    pattern: TurtyPattern,
  },
};

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

function ResultInner() {
  const registeredResult = useQuery(api.oceanTest.getResult);
  const archetypes = useQuery(api.oceanTest.getArchetypes);
  const saveGuestResult = useMutation(api.oceanTest.saveGuestResult);

  const [sessionId, setSessionId] = useState("");
  const guestResult = useQuery(
    api.oceanTest.getGuestResult,
    sessionId ? { sessionId } : "skip"
  );

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [debugArchetype, setDebugArchetype] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const result = registeredResult ?? guestResult;
  const isGuest = !registeredResult && !!guestResult;

  if (!result || !archetypes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#b8d4e3] via-[#c9dfe8] to-[#dce9ef]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const activeLetter = debugArchetype ?? result.finalArchetype;
  const archetype = archetypes.find((a) => a.letter === activeLetter);
  if (!archetype) return null;

  const theme = ARCHETYPE_THEMES[activeLetter] ?? ARCHETYPE_THEMES.C;

  const sortedScores = (Object.entries(result.scores) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([letter, score]) => ({
      letter,
      score,
      pct: Math.round((score / 15) * 100),
      arch: archetypes.find((a) => a.letter === letter),
    }));

  const handleSaveResult = async () => {
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
      const link = document.createElement("a");
      link.href = "/assets/card-placeholder.png";
      link.download = `${archetype.character}-ocean-archetype.png`;
      link.click();
    } catch (e: unknown) {
      console.error(e);
    }
    setSaving(false);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `I'm ${archetype.character} — ${archetype.name}! 🌊 Find your OCEAN archetype`;

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };
  const shareInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert("Link copied! Paste it in your Instagram story or DM.");
  };
  const shareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };
  const shareCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };
  const shareDownload = () => {
    const link = document.createElement("a");
    link.href = "/assets/card-placeholder.png";
    link.download = `${archetype.character}-ocean-archetype.png`;
    link.click();
  };

  return (
    <>
      <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${theme.bg} py-6 px-4 pt-20`}>
        {/* Background logo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Image src={Logo} alt="" width={800} height={800} className="h-[70vh] md:h-[150vh] w-auto opacity-20 object-contain" />
        </div>

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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

        <div className="relative z-10 mx-auto max-w-lg space-y-5">
          {/* Header */}
          <div className="text-center">
            <Link href="/">
              <Image src={Title} alt="AI OCEAN" width={160} height={48} className="mx-auto h-10 w-auto object-contain" priority />
            </Link>
          </div>

          {/* Main result card */}
          <div className={`${theme.cardBg} rounded-3xl p-4 shadow-xl border-4 ${theme.traitBorder} relative`}>
            {/* Character name badge - positioned on border */}
            <span 
              className={`absolute -top-4 left-6 text-2xl font-bold text-[#FFA700]`}
              style={{
                WebkitTextStroke: '5px #ffffff',
                paintOrder: 'stroke fill'
              }}
            >
              {archetype.character}
            </span>

            {/* Archetype title with "the" prefix */}
            <div className="mb-4">
              <h1 className={`font-quicksand text-sm ${theme.subtitle} font-normal`}>
                the <span 
                  className={`text-3xl font-bold ${theme.text}`}
                  style={{
                    textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
                    WebkitTextStroke: '4px #ffffff',
                    paintOrder: 'stroke fill',
                  }}
                >
                  {archetype.name}
                </span>
              </h1>
            </div>

            {/* Mascot image */}
            <div className="relative mb-5 flex justify-center overflow-visible">
              <div className={`h-30 md:h-40 w-full rounded-3xl ${theme.imgBg} relative`} style={{ clipPath: 'inset(-100px -100px 0 0 round 1.5rem)' }}>
                {/* Character-specific background pattern */}
                {theme.pattern && (
                  <Image
                    src={theme.pattern}
                    alt=""
                    fill
                    className="object-cover opacity-2"
                    style={{ objectPosition: 'center' }}
                  />
                )}
                
                <Image
                  src={theme.mascot}
                  alt={archetype.character}
                  width={192}
                  height={192}
                  className="object-contain drop-shadow-lg absolute -right-5 md:-right-15 -top-10 md:-top-20 h-50 md:h-80 w-auto z-10"
                  priority
                />
              </div>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 mb-2 justify-start">
              {archetype.traitsEn.map((t) => (
                <span key={t} className={`${theme.traitBg} ${theme.traitBorder} ${theme.traitText} rounded-full border-2 px-2 py-1 font-quicksand text-xs font-semibold`}>
                  {t}
                </span>
              ))}
            </div>

            {/* Motto */}
            <p className={`text-left mt-4 font-quicksand text-base font-bold ${theme.text} text-center`}>
              &ldquo;{archetype.mottoEn}&rdquo;
            </p>

            {/* Description */}
            <div className={`mt-2 space-y-3 ${theme.text} text-sm leading-relaxed`}>
              {archetype.descriptionEn.split(". ").reduce<string[]>((acc, part, i, arr) => {
                if (i % 2 === 0) {
                  const next = arr[i + 1] ?? "";
                  acc.push(part + (next ? ". " + next : ""));
                }
                return acc;
              }, []).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Share section */}
          <div className="">
            <h3 className="font-quicksand text-center text-lg font-bold text-white mb-6">Share your OCEAN Archetype</h3>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <button onClick={shareFacebook}
                className={`flex px-4 py-2 items-center justify-center rounded-full bg-white border-[0.7px] border-black ${theme.text} transition-all hover:${theme.imgBg} active:scale-95 shadow-[3px_2px_0_0_#000000]`}>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button onClick={shareInstagram}
                className={`flex px-4 py-2 items-center justify-center rounded-full bg-white border-[0.7px] border-black ${theme.text} transition-all hover:${theme.imgBg} active:scale-95 shadow-[3px_2px_0_0_#000000]`}>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </button>
              <button onClick={shareLinkedin}
                className={`flex px-4 py-2 items-center justify-center rounded-full bg-white border-[0.7px] border-black ${theme.text} transition-all hover:${theme.imgBg} active:scale-95 shadow-[3px_2px_0_0_#000000]`}>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button onClick={shareCopyLink}
                className={`flex px-4 py-2 items-center justify-center rounded-full bg-white border-[0.7px] border-black ${theme.text} transition-all hover:${theme.imgBg} active:scale-95 shadow-[3px_2px_0_0_#000000]`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button onClick={shareDownload}
                className={`flex px-4 py-2 items-center justify-center rounded-full bg-white border-[0.7px] border-black ${theme.text} transition-all hover:${theme.imgBg} active:scale-95 shadow-[3px_2px_0_0_#000000]`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex justify-center gap-2 text-xs pb-4">
            {result.wasTieBreaker && (
              <span className="rounded-full bg-white/40 px-3 py-1 text-[#0A3D62]">Tie-breaker used</span>
            )}
            {result.allSameAnswers && (
              <span className="rounded-full bg-amber-400/40 px-3 py-1 text-amber-700">Same answers detected</span>
            )}
          </div>

          {/* Logos */}
          <div className="flex items-center justify-center gap-4 pb-8">
            <Image src={UxmmLogo} alt="UXmm" width={60} height={30} className="h-8 w-auto" />
            <Image src={HubLogo} alt="Hub" width={50} height={30} className="h-8 w-auto" />
          </div>
        </div>
      </div>

      {/* Guest save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-dynapuff text-xl font-bold text-[#0A3D62]">Save &amp; Download</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to save your result and download your archetype card.
            </p>
            <div className="mt-4 space-y-3">
              <input type="text" placeholder="Name (optional)" value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-[#0CB6FF] focus:outline-none" />
              <input type="email" placeholder="Email (optional)" value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-[#0CB6FF] focus:outline-none" />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowSaveModal(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveResult} disabled={saving}
                className="flex-1 rounded-xl bg-[#0CB6FF] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A3D62] disabled:opacity-40">
                {saving ? "Saving…" : "Download Card ↓"}
              </button>
            </div>
            <Link href="/auth/signin" className="mt-3 block text-center text-xs text-gray-500 hover:text-[#0A3D62]">
              Or create an account →
            </Link>
          </div>
        </div>
      )}

      {/* Debug: switch archetype */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/60">DEBUG:</span>
          {["C", "O", "E", "A", "N"].map((letter) => (
            <button
              key={letter}
              onClick={() => setDebugArchetype(debugArchetype === letter ? null : letter)}
              className={`h-8 w-8 rounded-full font-dynapuff text-xs font-bold transition-all ${
                (debugArchetype ?? result.finalArchetype) === letter
                  ? "bg-[#FFD15A] text-[#0A3D62] scale-110"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {letter}
            </button>
          ))}
          {debugArchetype && (
            <button
              onClick={() => setDebugArchetype(null)}
              className="ml-1 text-xs text-white/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function ResultPage() {
  return <ResultInner />;
}
