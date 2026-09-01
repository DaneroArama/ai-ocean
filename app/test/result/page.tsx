"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Title from "@/app/assets/Title_white.png";
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
import AliPattern from "@/app/assets/Mascots/Croco Pattern.png";

const ARCHETYPE_THEMES: Record<string, {
  cardBg: string;
  text: string;
  subtitle: string;
  mascot: typeof SharkImg;
  pattern?: typeof SharkPattern;
}> = {
  C: {
    cardBg: "bg-[#9cc5d8]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: SharkImg,
    pattern: SharkPattern,
  },
  O: {
    cardBg: "bg-[#b08fc4]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: OctoImg,
    pattern: OctoPattern,
  },
  E: {
    cardBg: "bg-[#6E9868]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: AliImg,
    pattern: AliPattern,
  },
  A: {
    cardBg: "bg-[#d4a574]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: CrabiImg,
    pattern: CrabiPattern,
  },
  N: {
    cardBg: "bg-[#587953]",
    text: "text-white",
    subtitle: "text-white/80",
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
  const [debugArchetype, setDebugArchetype] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const result = registeredResult ?? guestResult;

  if (!result || !archetypes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0CB6FF]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const activeLetter = debugArchetype ?? result.finalArchetype;
  const archetype = archetypes.find((a) => a.letter === activeLetter);
  if (!archetype) return null;

  const theme = ARCHETYPE_THEMES[activeLetter] ?? ARCHETYPE_THEMES.C;

  const handleSaveResult = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      await saveGuestResult({
        sessionId,
        name: guestName || undefined,
        email: guestEmail || undefined,
      });
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
  const shareText = `I'm ${archetype.character} — ${archetype.name}! Find your OCEAN archetype`;

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
    setShowSaveModal(true);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0CB6FF] py-6 px-4 pt-20">
        {/* Background logo */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 flex items-center justify-center" aria-hidden="true">
          <Image src={Logo} alt="" width={800} height={800} className="h-[70vh] w-auto opacity-20 object-contain" />
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
          {/* Wave 1 at top — repeating */}
          <div
            className="absolute top-0 left-0 h-[42px] w-full opacity-30"
            style={{
              backgroundImage: `url('/assets/wave_asset_1.svg')`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "402px 42px",
              backgroundPosition: "top left",
            }}
          />
          {/* Wave 2 at bottom — repeating */}
          <div
            className="absolute bottom-0 left-0 h-[36px] w-full opacity-20"
            style={{
              backgroundImage: `url('/assets/wave_asset_2.svg')`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "402px 36px",
              backgroundPosition: "bottom left",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-lg space-y-5">
          {/* Header */}
          <div className="text-center">
            <Link href="/">
              <Image src={Title} alt="AI OCEAN" width={160} height={48} className="mx-auto h-10 w-auto object-contain" priority />
            </Link>
          </div>

          {/* Character card — text left, mascot right */}
          <div className={`${theme.cardBg} relative flex items-center rounded-3xl pb-0 shadow-xl mt-20`} style={{ clipPath: 'inset(-100px -100px 0 0 round 1.5rem)' }}>

            {/* Text content — left side */}
            <div className="relative z-10 h-30 md:h-40 p-6">
              <p className={`font-quicksand text-sm ${theme.subtitle}`}>You are</p>
              <h1
                className="font-syncopate text-2xl md:text-4xl font-bold text-white"
                style={{ WebkitTextStroke: "1.5px rgba(0,0,0,0.15)", paintOrder: "stroke fill" }}
              >
                {archetype.character}
              </h1>
              <p className={`font-quicksand text-base ${theme.subtitle}`}>({archetype.name})</p>
            </div>

            {/* Mascot image */}
            <div className="absolute inset-0 flex justify-center">
              <div className={`h-full w-full rounded-3xl relative`} style={{ clipPath: 'inset(-100px -100px 0 0 round 1.5rem)' }}>
                {/* Character-specific background pattern */}
                {theme.pattern && (
                  <Image
                    src={theme.pattern}
                    alt=""
                    fill
                    className="object-cover opacity-2 absolute -right-5 md:-right-15"
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
          </div>

          {/* Motto */}
          <p
            className="text-center font-syne text-lg font-bold text-white"
            style={{ WebkitTextStroke: "0.5px rgba(0,0,0,0.1)", paintOrder: "stroke fill" }}
          >
            &ldquo;{archetype.mottoEn}&rdquo;
          </p>

          {/* Description */}
          <div className="space-y-3 text-sm leading-relaxed text-white/90">
            {archetype.descriptionEn.split(". ").reduce<string[]>((acc, part, i, arr) => {
              if (i % 2 === 0) {
                const next = arr[i + 1] ?? "";
                acc.push(part + (next ? ". " + next : ""));
              }
              return acc;
            }, []).map((para, i, arr) => (
              <p key={i}>
                {i === arr.length - 1 ? (
                  <>
                    {para.slice(0, -3)}
                    <button className="font-bold text-white underline">See More...</button>
                  </>
                ) : para}
              </p>
            ))}
          </div>

          {/* Traits — CharacterSection style */}
          <div className="relative">
            {/* Tab label */}
            <div className="inline-block rounded-t-2xl border-t border-l border-r border-white/30 bg-white/20 px-6 py-2 backdrop-blur-sm">
              <h3 className="font-syne text-lg font-bold text-white uppercase">Traits</h3>
            </div>
            {/* Content box */}
            <div className="-mt-px rounded-r-2xl rounded-bl-2xl border border-white/20 bg-transparent backdrop-blur-sm">
              {/* Inset inner box */}
              <div className="rounded-r-2xl rounded-bl-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)]">
                <div className="flex flex-wrap justify-center gap-6">
                {archetype.traitsEn.map((t, idx) => (
                  <div key={t} className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/30 backdrop-blur-sm">
                      {idx === 0 && (
                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-syne text-base font-semibold text-white">{t}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Image src={UxmmLogo} alt="UXmm" width={60} height={30} className="h-8 w-auto" />
            <Image src={HubLogo} alt="Hub" width={50} height={30} className="h-8 w-auto" />
          </div>

          {/* Share section */}
          <div>
            <h3 className="font-dynapuff text-center text-base font-bold text-white mb-4">Share your OCEAN Archetype</h3>
            <div className="flex justify-center items-center gap-3">
              <button onClick={shareFacebook}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-[1.5px] border-black text-[#1877F2] shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button onClick={shareInstagram}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-[1.5px] border-black text-[#E4405F] shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </button>
              <button onClick={shareLinkedin}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-[1.5px] border-black text-[#0A66C2] shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button onClick={shareCopyLink}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-[1.5px] border-black text-[#0A3D62] shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button onClick={shareDownload}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-[1.5px] border-black text-[#0A3D62] shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex justify-center gap-2 text-xs pb-4">
            {result.wasTieBreaker && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-white">Tie-breaker used</span>
            )}
            {result.allSameAnswers && (
              <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100">Same answers detected</span>
            )}
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
