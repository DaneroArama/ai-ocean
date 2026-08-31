"use client";

import {useState, useEffect} from "react";
import {useQuery, useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Title from "@/app/assets/Title.png";
import Coral from "@/app/assets/Coral.png";
import Fishes from "@/app/assets/FIshes.png";
import Starfish from "@/app/assets/Starfish.png";

import SharkImg from "@/app/assets/Mascots/Shark.png";
import OctoImg from "@/app/assets/Mascots/Octo.png";
import CrabiImg from "@/app/assets/Mascots/Crabi.png";
import TutoImg from "@/app/assets/Mascots/Tuto.png";

const ARCHETYPE_THEMES: Record<string, {
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  accent: string;
  accentText: string;
  traitBg: string;
  traitText: string;
  shareBg: string;
  mascot: typeof SharkImg;
}> = {
  C: {
    bg: "from-[#1a5276] via-[#2471a3] to-[#5dade2]",
    cardBg: "bg-[#1a5276]",
    cardBorder: "border-[#5dade2]/40",
    text: "text-white",
    accent: "text-[#85c1e9]",
    accentText: "text-[#aed6f1]",
    traitBg: "bg-[#85c1e9]/20",
    traitText: "text-[#aed6f1]",
    shareBg: "bg-[#2471a3]",
    mascot: SharkImg,
  },
  O: {
    bg: "from-[#4a235a] via-[#6c3483] to-[#a569bd]",
    cardBg: "bg-[#4a235a]",
    cardBorder: "border-[#a569bd]/40",
    text: "text-white",
    accent: "text-[#d2b4de]",
    accentText: "text-[#d7bde2]",
    traitBg: "bg-[#d2b4de]/20",
    traitText: "text-[#d7bde2]",
    shareBg: "bg-[#6c3483]",
    mascot: OctoImg,
  },
  E: {
    bg: "from-[#0e6251] via-[#117a65] to-[#48c9b0]",
    cardBg: "bg-[#0e6251]",
    cardBorder: "border-[#48c9b0]/40",
    text: "text-white",
    accent: "text-[#76d7c4]",
    accentText: "text-[#a3e4d7]",
    traitBg: "bg-[#76d7c4]/20",
    traitText: "text-[#a3e4d7]",
    shareBg: "bg-[#117a65]",
    mascot: SharkImg,
  },
  A: {
    bg: "from-[#935116] via-[#ca6f1e] to-[#f0b27a]",
    cardBg: "bg-[#935116]",
    cardBorder: "border-[#f0b27a]/40",
    text: "text-white",
    accent: "text-[#f5cba7]",
    accentText: "text-[#fae5d3]",
    traitBg: "bg-[#f5cba7]/20",
    traitText: "text-[#fae5d3]",
    shareBg: "bg-[#ca6f1e]",
    mascot: CrabiImg,
  },
  N: {
    bg: "from-[#1b4f72] via-[#2e86c1] to-[#85c1e9]",
    cardBg: "bg-[#1b4f72]",
    cardBorder: "border-[#85c1e9]/40",
    text: "text-white",
    accent: "text-[#aed6f1]",
    accentText: "text-[#d4e6f1]",
    traitBg: "bg-[#aed6f1]/20",
    traitText: "text-[#d4e6f1]",
    shareBg: "bg-[#2e86c1]",
    mascot: TutoImg,
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
    sessionId ? {sessionId} : "skip"
  );

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const result = registeredResult ?? guestResult;
  const isGuest = !registeredResult && !!guestResult;

  if (!result || !archetypes) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"/>
      </div>
    );
  }

  const archetype = archetypes.find((a) => a.letter === result.finalArchetype);
  if (!archetype) return null;

  const theme = ARCHETYPE_THEMES[result.finalArchetype] ?? ARCHETYPE_THEMES.C;

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
      // TODO: Replace with actual card asset download
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

  return (
    <>
      <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${theme.bg} py-8 px-4`}>
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[2%] top-[20%] w-20 opacity-15"><Image src={Coral} alt="" width={80} height={60}
                                                                               className="object-contain"/></div>
          <div className="absolute right-[6%] top-[15%] w-16 opacity-10"><Image src={Starfish} alt="" width={64}
                                                                                height={64} className="object-contain"/>
          </div>
          <div className="absolute left-[40%] top-[65%] w-14 opacity-10"><Image src={Fishes} alt="" width={64}
                                                                                height={32} className="object-contain"/>
          </div>
          <div className="absolute bottom-[20%] right-[4%] w-16 opacity-10"><Image src={Coral} alt="" width={80}
                                                                                   height={60}
                                                                                   className="object-contain scale-x-[-1]"/>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <Link href="/">
              <Image src={Title} alt="AI OCEAN" width={160} height={48} className="mx-auto h-10 w-auto object-contain"
                     priority/>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center mx-auto justify-center gap-6">
            {/* Main result card */}
            <div
              className={`${theme.cardBg} rounded-3xl border-2 ${theme.cardBorder} p-6 shadow-2xl w-full max-w-lg mb-6`}>
              {/* Character name badge */}
              <span
                className="inline-block rounded-full bg-[#FFD15A] px-4 py-1 font-dynapuff text-sm font-bold text-[#0A3D62]">
              {archetype.character}
            </span>

              {/* Archetype title */}
              <h1 className="mt-3 font-dynapuff text-3xl font-bold text-white"
                  style={{WebkitTextStroke: "1.5px rgba(0,0,0,0.15)"}}>
                {archetype.name}
              </h1>

              {/* Mascot image */}
              <div className="relative my-4 flex justify-center">
                <div
                  className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
                  <Image
                    src={theme.mascot}
                    alt={archetype.character}
                    fill
                    className="object-contain p-4 drop-shadow-xl"
                    priority
                  />
                </div>
              </div>

              {/* Traits */}
              <div className="flex flex-wrap gap-2">
                {archetype.traitsEn.map((t) => (
                  <span key={t}
                        className={`${theme.traitBg} ${theme.traitText} rounded-full px-4 py-1 font-dynapuff text-xs font-semibold`}>
                  {t}
                </span>
                ))}
              </div>

              {/* Motto */}
              <p className={`mt-5 font-dynapuff text-lg font-bold ${theme.accent}`}
                 style={{WebkitTextStroke: "0.5px rgba(0,0,0,0.1)"}}>
                &ldquo;{archetype.mottoEn}&rdquo;
              </p>

              {/* Description paragraphs */}
              <div className={`mt-4 space-y-3 ${theme.accentText} text-sm leading-relaxed`}>
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

            <div className="space-y-6">
              {/* Score breakdown */}
              <div className="rounded-3xl bg-white/95 p-6 shadow-2xl">
                <h3 className="font-dynapuff text-sm font-bold text-[#0A3D62]">Score Breakdown</h3>
                <div className="mt-4 space-y-3">
                  {sortedScores.map(({letter, score, pct, arch}) => (
                    <div key={letter} className="flex items-center gap-3">
                      <Image src={ARCHETYPE_THEMES[letter]?.mascot || SharkImg} alt="mascot" width={32} height={32}
                             className="w-8 h-8"/>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0A3D62]">{arch?.name}</span>
                          <span className="text-gray-500">{score}/15</span>
                        </div>
                        <div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${letter === result.finalArchetype ? "bg-[#FFD15A]" : "bg-gray-300"}`}
                            style={{width: `${pct}%`}}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share + Download */}
              <div className="rounded-3xl bg-white/95 p-6 shadow-2xl">
                <h3 className="font-dynapuff text-center text-sm font-bold text-[#0A3D62]">Share your OCEAN
                  Archetype</h3>
                <div className="mt-4 flex justify-center gap-3">
                  {/* Facebook */}
                  <button onClick={shareFacebook}
                          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0A3D62] text-[#0A3D62] transition-all hover:bg-[#0A3D62] hover:text-white active:scale-95">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  {/* Instagram */}
                  <button onClick={shareInstagram}
                          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0A3D62] text-[#0A3D62] transition-all hover:bg-[#0A3D62] hover:text-white active:scale-95">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </button>
                  {/* LinkedIn */}
                  <button onClick={shareLinkedin}
                          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0A3D62] text-[#0A3D62] transition-all hover:bg-[#0A3D62] hover:text-white active:scale-95">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  {/* Copy link */}
                  <button onClick={shareCopyLink}
                          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0A3D62] text-[#0A3D62] transition-all hover:bg-[#0A3D62] hover:text-white active:scale-95">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Guest actions */}
              {isGuest && !saved && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full rounded-2xl bg-white px-6 py-3 font-dynapuff font-bold text-[#0A3D62] shadow-lg transition-all hover:bg-gray-100 active:scale-95"
                  style={{boxShadow: "0 4px 0 #0A3D62/30, 0 6px 16px rgba(0,0,0,0.15)"}}
                >
                  Download My Card ↓
                </button>
              )}

              {isGuest && saved && (
                <p className="rounded-2xl bg-green-500/20 p-3 text-center font-dynapuff text-sm text-white">
                  Result saved &amp; download started!
                </p>
              )}

              {/* Info badges */}

              {result.wasTieBreaker && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-white">Tie-breaker used</span>
              )}
              {result.allSameAnswers && (
                <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100">Same answers detected</span>
              )}

              {/* Retake */}
              <div className="flex justify-center">
                <Link href="/test"
                      className="rounded-full bg-white px-8 py-3 font-dynapuff font-bold text-[#0A3D62] shadow-lg transition-all hover:bg-gray-100 active:scale-95">
                  Retake Test
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest save / download modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-dynapuff text-xl font-bold text-[#0A3D62]">Save &amp; Download</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to save your result and download your archetype card.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-[#0CB6FF] focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-[#0CB6FF] focus:outline-none"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResult}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#0CB6FF] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A3D62] disabled:opacity-40"
              >
                {saving ? "Saving…" : "Download Card ↓"}
              </button>
            </div>
            <Link href="/auth/signin" className="mt-3 block text-center text-xs text-gray-500 hover:text-[#0A3D62]">
              Or create an account →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function ResultPage() {
  return <ResultInner/>;
}
