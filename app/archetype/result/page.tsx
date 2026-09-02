"use client";

import {useState, useEffect, useCallback} from "react";
import {useQuery, useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

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

import SharkResult from "@/app/assets/Mascots/Sharkie Result.png";
import OctoResult from "@/app/assets/Mascots/Otto Result.png";
import CrabiResult from "@/app/assets/Mascots/Crabbi Result.png";
import TutoResult from "@/app/assets/Mascots/Tuto Result.png";
import AliResult from "@/app/assets/Mascots/Croco Result.png";

const ARCHETYPE_THEMES: Record<string, {
  cardBg: string;
  text: string;
  subtitle: string;
  mascot: typeof SharkImg;
  pattern?: typeof SharkPattern;
  resultCard: typeof SharkResult;
}> = {
  C: {
    cardBg: "bg-[#9cc5d8]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: SharkImg,
    pattern: SharkPattern,
    resultCard: SharkResult,
  },
  O: {
    cardBg: "bg-[#b08fc4]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: OctoImg,
    pattern: OctoPattern,
    resultCard: OctoResult,
  },
  E: {
    cardBg: "bg-[#6E9868]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: AliImg,
    pattern: AliPattern,
    resultCard: AliResult,
  },
  A: {
    cardBg: "bg-[#d4a574]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: CrabiImg,
    pattern: CrabiPattern,
    resultCard: CrabiResult,
  },
  N: {
    cardBg: "bg-[#587953]",
    text: "text-white",
    subtitle: "text-white/80",
    mascot: TutoImg,
    pattern: TurtyPattern,
    resultCard: TutoResult,
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
  const router = useRouter();
  const registeredResult = useQuery(api.oceanTest.getResult);
  const archetypes = useQuery(api.oceanTest.getArchetypes);
  const saveGuestResult = useMutation(api.oceanTest.saveGuestResult);
  const retakeTest = useMutation(api.oceanTest.retakeTest);

  const [sessionId, setSessionId] = useState("");
  const guestResult = useQuery(
    api.oceanTest.getGuestResult,
    sessionId ? {sessionId} : "skip"
  );

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [debugArchetype, setDebugArchetype] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const handleRetake = useCallback(async () => {
    try {
      const res = await retakeTest({ sessionId: sessionId || undefined });
      if (res.type === "anonymous_guest") {
        localStorage.removeItem("ocean_test_session");
      }
      router.push("/archetype");
    } catch (e: unknown) {
      console.error(e);
    }
  }, [retakeTest, sessionId, router]);

  const result = registeredResult ?? guestResult;

  if (!result || !archetypes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0CB6FF]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"/>
      </div>
    );
  }

  const activeLetter = debugArchetype ?? result.finalArchetype;
  const archetype = archetypes.find((a) => a.letter === activeLetter);
  if (!archetype) return null;

  const theme = ARCHETYPE_THEMES[activeLetter] ?? ARCHETYPE_THEMES.C;

  const shareText = `I got ${archetype.character} — ${archetype.name}! It's your time to test your OCEAN Archetype!`;

  const getResultImageBlob = async (): Promise<Blob> => {
    const imgSrc = theme.resultCard.src;
    const res = await fetch(imgSrc);
    return res.blob();
  };

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
      const blob = await getResultImageBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${archetype.character}-ocean-archetype.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      console.error(e);
    }
    setSaving(false);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const shareFacebook = async () => {
    const blob = await getResultImageBlob();
    const file = new File([blob], `${archetype.character}-ocean.png`, {type: "image/png"});
    if (navigator.share && navigator.canShare?.({files: [file]})) {
      try {
        await navigator.share({files: [file], text: shareText});
        return;
      } catch { /* fallback */
      }
    }
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400");
  };

  const shareInstagram = async () => {
    const blob = await getResultImageBlob();
    const file = new File([blob], `${archetype.character}-ocean.png`, {type: "image/png"});
    if (navigator.share && navigator.canShare?.({files: [file]})) {
      try {
        await navigator.share({files: [file], text: shareText});
        return;
      } catch { /* fallback */
      }
    }
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert("Link copied! Paste it in your Instagram story or DM.");
  };

  const shareLinkedin = async () => {
    const blob = await getResultImageBlob();
    const file = new File([blob], `${archetype.character}-ocean.png`, {type: "image/png"});
    if (navigator.share && navigator.canShare?.({files: [file]})) {
      try {
        await navigator.share({files: [file], text: shareText});
        return;
      } catch { /* fallback */
      }
    }
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
  };

  const shareCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert("Link copied to clipboard!");
  };

  const shareDownload = () => {
    setShowSaveModal(true);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0CB6FF] py-6 px-4 pt-20">
        {/* Background logo */}
        <div className="pointer-events-none absolute top-10 left-0 right-0 flex items-center justify-center"
             aria-hidden="true">
          <Image src={Logo} alt="" width={800} height={800} className="h-[70vh] w-auto opacity-20 object-contain"/>
        </div>

        {/* Home button */}
        <div className="absolute top-12 left-2 md:left-10 flex justify-center pb-6">
          <Link href="/"
                className="flex px-6 py-3 items-center justify-center rounded-full bg-[#0A3D62] text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition-all hover:translate-y-[-2px] hover:shadow-[4px_5px_0_0_rgba(0,0,0,0.2)] active:translate-y-[1px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.2)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </Link>
        </div>

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[5%] top-[10%] w-16 opacity-20 md:w-24">
            <Image src={Coral} alt="" width={80} height={60} className="object-contain"/>
          </div>
          <div className="absolute right-[8%] top-[20%] w-14 opacity-15 md:w-20">
            <Image src={Starfish} alt="" width={64} height={64} className="object-contain"/>
          </div>
          <div className="absolute left-[15%] top-[55%] w-12 opacity-10">
            <Image src={Fishes} alt="" width={64} height={32} className="object-contain"/>
          </div>
          <div className="absolute bottom-[15%] right-[12%] w-14 opacity-15">
            <Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]"/>
          </div>
          <div className="absolute bottom-[30%] left-[8%] w-10 opacity-10">
            <Image src={Fishes} alt="" width={64} height={32} className="object-contain scale-x-[-1]"/>
          </div>
          {/* Wave 1 at top — repeating */}
          <div
            className="absolute top-0 left-0 h-[42px] w-full opacity-80"
            style={{
              backgroundImage: `url('/assets/wave_asset_2.svg')`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "402px 42px",
              backgroundPosition: "top left",
            }}
          />
          {/* Wave 2 at bottom — repeating */}
          <div
            className="absolute bottom-0 left-0 h-[36px] w-full opacity-80"
            style={{
              backgroundImage: `url('/assets/wave_asset_1.svg')`,
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
              <Image src={Title} alt="AI OCEAN" width={160} height={48} className="mx-auto h-10 w-auto object-contain"
                     priority/>
            </Link>
          </div>

          {/* Character card — text left, mascot right */}
          <div className={`${theme.cardBg} relative flex items-center rounded-3xl pb-0 shadow-xl mt-20`}
               style={{clipPath: 'inset(-100px -100px 0 0 round 1.5rem)'}}>

            {/* Text content — left side */}
            <div className="relative z-10 flex flex-col justify-center h-30 md:h-40 p-6">
              <p className={`font-quicksand text-sm font-semibold text-white`}
                 style={{textShadow: "1px 1px 0 rgba(0,0,0,10)"}}>You are</p>
              <h1
                className="font-syncopate text-2xl md:text-4xl font-bold text-white"
                style={{
                  WebkitTextStroke: "1.5px rgba(0,0,0,0.15)",
                  paintOrder: "stroke fill",
                  textShadow: "3px 3px 0 rgba(0,0,0,0.15)"
                }}
              >
                {archetype.character}
              </h1>
              <p className={`font-quicksand text-white font-semibold text-base`}
                 style={{textShadow: "1px 1px 0 rgba(0,0,0,10)"}}>({archetype.name})</p>
            </div>

            {/* Mascot image */}
            <div className="absolute inset-0 flex justify-center">
              <div className={`h-full w-full rounded-3xl relative`}
                   style={{clipPath: 'inset(-100px -100px 0 0 round 1.5rem)'}}>
                {/* Character-specific background pattern */}
                {theme.pattern && (
                  <Image
                    src={theme.pattern}
                    alt=""
                    fill
                    className="object-cover opacity-10 absolute -right-5 md:-right-15 rounded-3xl"
                    style={{objectPosition: 'center'}}
                  />
                )}

                <Image
                  src={theme.mascot}
                  alt={archetype.character}
                  width={192}
                  height={192}
                  className="object-contain absolute -right-5 md:-right-15 -top-10 md:-top-20 h-50 md:h-80 w-auto z-10"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Motto */}
          <p
            className="text-left font-syne text-lg font-bold text-white"
            style={{
              WebkitTextStroke: "0.5px rgba(0,0,0,0.1)",
              paintOrder: "stroke fill",
              textShadow: "2px 2px 0 rgba(0,0,0,0.15)"
            }}
          >
            &ldquo;{archetype.mottoEn}&rdquo;
          </p>

          {/* Description */}
          <div className="space-y-3 text-sm font-semibold leading-relaxed text-white/90"
               style={{textShadow: "1px 1px 0 rgba(0,0,0,0.5)"}}>
            {expandedDesc ? (
              <p>{archetype.descriptionEn}</p>
            ) : (
              <p>
                {archetype.descriptionEn.slice(0, 120)}
                {archetype.descriptionEn.length > 120 && (
                  <button
                    onClick={() => setExpandedDesc(true)}
                    className="ml-1 font-bold text-white underline decoration-2 underline-offset-2 hover:text-white/80 transition-colors"
                  >
                    See More...
                  </button>
                )}
              </p>
            )}
            {expandedDesc && (
              <button
                onClick={() => setExpandedDesc(false)}
                className="font-bold text-white/70 underline decoration-2 underline-offset-2 hover:text-white transition-colors text-xs"
              >
                Show Less
              </button>
            )}
          </div>

          {/* Traits — CharacterSection style */}
          <div className="relative">
            {/* Tab label */}
            <div
              className="inline-block rounded-t-2xl border-t border-l border-r border-white/30 bg-white/20 px-10 py-2 backdrop-blur-sm shadow-[inset_0px_0px_10px_2px_rgba(255,255,255,2)]">
              <h3 className="font-syncopate text-xs font-bold text-white"
                  style={{textShadow: "2px 2px 0 rgba(0,0,0,0.15)"}}>Traits</h3>
            </div>
            {/* Content box */}
            <div className="-mt-px rounded-r-2xl rounded-bl-2xl bg-transparent backdrop-blur-sm">
              {/* Inset inner box */}
              <div
                className="rounded-r-2xl rounded-bl-2xl bg-white/5 p-5 shadow-[inset_0px_0px_10px_0px_rgba(255,255,255,3)]">
                <div className="grid grid-cols-3 gap-4">
                  {archetype.traitsEn.map((t, idx) => (
                    <div key={t} className="flex flex-col items-center gap-2">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/30 backdrop-blur-sm">
                        {idx === 0 && (
                          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        )}
                        {idx === 1 && (
                          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"/>
                          </svg>
                        )}
                        {idx === 2 && (
                          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <span className="font-syne text-sm font-semibold text-white text-center"
                            style={{textShadow: "1px 1px 0 rgba(0,0,0,0.15)"}}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Image src={UxmmLogo} alt="UXmm" width={60} height={30} className="h-8 w-auto"/>
            <Image src={HubLogo} alt="Hub" width={50} height={30} className="h-8 w-auto"/>
          </div>

          {/* Share section */}
          <div>
            <h3 className="font-dynapuff text-center text-base font-bold text-white mb-4"
                style={{textShadow: "2px 2px 0 rgba(0,0,0,0.15)"}}>Share your OCEAN Archetype</h3>
            <div className="flex justify-center items-center gap-3">
              {/* Download button */}
              <div className="flex justify-center pb-4">
                <button onClick={shareDownload}
                        className="flex items-center gap-2 rounded-full bg-white px-6 py-3 border-[1.5px] border-black text-[#0A3D62] font-dynapuff font-bold shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download Result
                </button>
              </div>

              {/* Retake button */}
              <div className="flex justify-center pb-4">
                <button onClick={handleRetake}
                        className="flex items-center gap-2 rounded-full bg-[#0A3D62] px-6 py-3 border-[1.5px] border-black text-white font-dynapuff font-bold shadow-[3px_2px_0_0_#000] transition-all hover:translate-y-[-1px] hover:shadow-[4px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Retake Test
                </button>
              </div>
            </div>
          </div>

          {/* Info badges
          <div className="flex justify-center gap-2 text-xs pb-4">
            {result.wasTieBreaker && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-white"
                style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}>Tie-breaker used</span>
            )}
            {result.allSameAnswers && (
              <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100"
                style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}>Same answers detected</span>
            )}
          </div>
          */}

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
                     className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-ocean-primary text-sm focus:border-[#0CB6FF] focus:outline-none"/>
              <input type="email" placeholder="Email (optional)" value={guestEmail}
                     onChange={(e) => setGuestEmail(e.target.value)}
                     className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-ocean-primary text-sm focus:border-[#0CB6FF] focus:outline-none"/>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowSaveModal(false)}
                      className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveResult} disabled={saving}
                      className="flex-1 rounded-xl bg-[#0CB6FF] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A3D62] disabled:opacity-40">
                {saving ? "Saving…" : "Download Card"}
              </button>
            </div>
            {/*
            <Link href="/auth/signin" className="mt-3 block text-center text-xs text-gray-500 hover:text-[#0A3D62]">
              Or create an account →
            </Link>
            */}
          </div>
        </div>
      )}
    </>
  );
}

export default function ResultPage() {
  return <ResultInner/>;
}
