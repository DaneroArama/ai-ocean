"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

import Coral from "@/app/assets/Coral.webp";
import Fishes from "@/app/assets/Fishes.webp";
import Starfish from "@/app/assets/Starfish.webp";

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const result = registeredResult ?? guestResult;
  const isGuest = !registeredResult && !!guestResult;

  if (!result || !archetypes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#00b4d8] to-[#0077b6]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const archetype = archetypes.find((a) => a.letter === result.finalArchetype);
  if (!archetype) return null;

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
    } catch (e: unknown) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF] py-8 px-4">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-[2%] top-[20%] w-20 opacity-20"><Image src={Coral} alt="" width={80} height={60} className="object-contain" /></div>
          <div className="absolute right-[6%] top-[15%] w-16 opacity-15"><Image src={Starfish} alt="" width={64} height={64} className="object-contain" /></div>
          <div className="absolute left-[40%] top-[65%] w-14 opacity-10"><Image src={Fishes} alt="" width={64} height={32} className="object-contain" /></div>
          <div className="absolute bottom-[20%] right-[4%] w-16 opacity-15"><Image src={Coral} alt="" width={80} height={60} className="object-contain scale-x-[-1]" /></div>
        </div>
        <div className="relative z-10 mx-auto max-w-lg space-y-6">
          <div className="text-center">
            <Link href="/" className="font-syncopate text-lg font-bold text-white">AI OCEAN</Link>
          </div>

          {/* Main result card */}
          <div className="rounded-3xl bg-white/95 p-8 text-center shadow-2xl">
            <div className="text-8xl mb-4">{archetype.emoji}</div>
            <h1 className="font-syncopate text-3xl font-bold text-ocean-deep">{archetype.character}</h1>
            <p className="mt-1 text-lg font-semibold text-ocean-primary">{archetype.name}</p>
            <p className="mt-1 text-sm text-gray-500">{archetype.animal} • Wave: {archetype.wave}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {archetype.traitsEn.map((t) => (
                <span key={t} className="rounded-full bg-ocean-foam px-3 py-1 text-xs font-semibold text-ocean-deep">{t}</span>
              ))}
            </div>
            <p className="mt-5 text-base italic text-gray-600">&ldquo;{archetype.mottoEn}&rdquo;</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{archetype.descriptionEn}</p>
          </div>

          {/* Score breakdown */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-2xl">
            <h3 className="font-syncopate text-sm font-bold text-ocean-deep">Score Breakdown</h3>
            <div className="mt-4 space-y-3">
              {sortedScores.map(({ letter, score, pct, arch }) => (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-8 text-center text-xl">{arch?.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ocean-deep">{arch?.name}</span>
                      <span className="text-gray-500">{score}/15</span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${letter === result.finalArchetype ? "bg-ocean-primary" : "bg-gray-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All archetypes grid */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-2xl">
            <h3 className="font-syncopate text-sm font-bold text-ocean-deep">All Archetypes</h3>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {archetypes.map((a) => (
                <div key={a.letter} className={`rounded-xl p-3 text-center ${a.letter === result.finalArchetype ? "bg-ocean-primary text-white" : "bg-gray-50"}`}>
                  <div className="text-2xl">{a.emoji}</div>
                  <p className="mt-1 text-[10px] font-bold">{a.letter}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {result.wasTieBreaker && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-white">Tie-breaker used</span>
            )}
            {result.allSameAnswers && (
              <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100">Same answers detected</span>
            )}
            <span className={`rounded-full px-3 py-1 ${isGuest ? "bg-white/20 text-white" : "bg-ocean-deep/30 text-white"}`}>
              {isGuest ? "Guest" : "Registered"}
            </span>
          </div>

          {/* Guest actions */}
          {isGuest && (
            <div className="space-y-3">
              {!saved ? (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white shadow-lg hover:bg-ocean-deep"
                >
                  Save My Result
                </button>
              ) : (
                <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
                  Result saved! You can retrieve it with your email.
                </p>
              )}
              <Link href="/auth/signin" className="block w-full rounded-xl border-2 border-white/40 px-6 py-3 text-center font-bold text-white hover:bg-white/10">
                Already have an account? Sign in
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Link href="/test" className="rounded-xl bg-white px-6 py-3 font-bold text-ocean-deep shadow-lg hover:bg-gray-100">
              Retake Test
            </Link>
            <Link href="/dashboard" className="rounded-xl bg-ocean-primary px-6 py-3 font-bold text-white shadow-lg hover:bg-ocean-deep">
              Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Guest save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-syncopate text-xl font-bold text-ocean-deep">Save Your Result</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to save your archetype result. You can retrieve it later.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-ocean-primary focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-ocean-primary focus:outline-none"
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
                className="flex-1 rounded-xl bg-ocean-primary px-4 py-3 text-sm font-bold text-white hover:bg-ocean-deep disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <Link href="/auth/signin" className="mt-3 block text-center text-xs text-gray-500 hover:text-ocean-deep">
              Or create an account →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function ResultPage() {
  return <ResultInner />;
}
