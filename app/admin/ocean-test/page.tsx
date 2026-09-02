"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Archetype = Doc<"oceanArchetypes">;
type Question = Doc<"oceanQuestions">;

const LETTERS = ["O", "C", "E", "A", "N"] as const;

export default function AdminOceanTestPage() {
  const archetypes = useQuery(api.oceanTest.listAllArchetypes);
  const questions = useQuery(api.oceanTest.listAllQuestions);
  const resultsData = useQuery(api.oceanTest.listAllResults);

  const createArchetype = useMutation(api.oceanTest.createArchetype);
  const updateArchetype = useMutation(api.oceanTest.updateArchetype);
  const createQuestion = useMutation(api.oceanTest.createQuestion);
  const updateQuestion = useMutation(api.oceanTest.updateQuestion);
  const deleteQuestion = useMutation(api.oceanTest.deleteQuestion);
  const reorderQuestions = useMutation(api.oceanTest.reorderQuestions);

  const [tab, setTab] = useState<"archetypes" | "questions" | "results">("archetypes");
  const [editingArchetype, setEditingArchetype] = useState<Archetype | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Archetype form
  const [archForm, setArchForm] = useState({
    letter: "O", name: "", character: "", animal: "", emoji: "",
    traitsEn: ["", "", ""], traitsMy: ["", "", ""],
    mottoEn: "", mottoMy: "", descriptionEn: "", descriptionMy: "",
    wave: "", tieBreakerStatementEn: "", tieBreakerStatementMy: "",
  });

  // Question form
  const [qForm, setQForm] = useState({
    id: "", archetypeLetter: "O", statementEn: "", statementMy: "", order: 0,
  });

  const sortedQuestions = useMemo(() =>
    questions ? [...questions].sort((a, b) => a.order - b.order) : [],
  [questions]);

  const questionsByLetter = useMemo(() => {
    const map: Record<string, Question[]> = {};
    for (const l of LETTERS) map[l] = [];
    for (const q of sortedQuestions) {
      (map[q.archetypeLetter] ??= []).push(q);
    }
    return map;
  }, [sortedQuestions]);

  // ── Archetype CRUD ──

  const openCreateArchetype = () => {
    setEditingArchetype(null);
    setArchForm({
      letter: "O", name: "", character: "", animal: "", emoji: "",
      traitsEn: ["", "", ""], traitsMy: ["", "", ""],
      mottoEn: "", mottoMy: "", descriptionEn: "", descriptionMy: "",
      wave: "", tieBreakerStatementEn: "", tieBreakerStatementMy: "",
    });
    setShowForm(true);
  };

  const openEditArchetype = (a: Archetype) => {
    setEditingArchetype(a);
    setArchForm({
      letter: a.letter, name: a.name, character: a.character, animal: a.animal, emoji: a.emoji,
      traitsEn: [...a.traitsEn], traitsMy: [...a.traitsMy],
      mottoEn: a.mottoEn, mottoMy: a.mottoMy,
      descriptionEn: a.descriptionEn, descriptionMy: a.descriptionMy,
      wave: a.wave, tieBreakerStatementEn: a.tieBreakerStatementEn, tieBreakerStatementMy: a.tieBreakerStatementMy,
    });
    setShowForm(true);
  };

  const saveArchetype = async () => {
    try {
      if (editingArchetype) {
        await updateArchetype({ archetypeId: editingArchetype._id, ...archForm });
        setMsg("✅ Archetype updated");
      } else {
        await createArchetype(archForm);
        setMsg("✅ Archetype created");
      }
      setShowForm(false);
    } catch (e: unknown) { setMsg("❌ " + (e instanceof Error ? e.message : "Error")); }
  };

  const toggleArchetypeActive = async (a: Archetype) => {
    await updateArchetype({ archetypeId: a._id, isActive: !a.isActive });
  };

  // ── Question CRUD ──

  const openCreateQuestion = (letter: string) => {
    setEditingQuestion(null);
    const existing = questionsByLetter[letter] ?? [];
    setQForm({
      id: `${letter}${existing.length + 1}`,
      archetypeLetter: letter,
      statementEn: "",
      statementMy: "",
      order: sortedQuestions.length,
    });
    setShowForm(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQForm({
      id: q.id,
      archetypeLetter: q.archetypeLetter,
      statementEn: q.statementEn,
      statementMy: q.statementMy,
      order: q.order,
    });
    setShowForm(true);
  };

  const saveQuestion = async () => {
    if (!qForm.statementEn.trim() || !qForm.statementMy.trim()) {
      setMsg("EN and MY statements required");
      return;
    }
    try {
      if (editingQuestion) {
        await updateQuestion({
          questionId: editingQuestion._id,
          statementEn: qForm.statementEn,
          statementMy: qForm.statementMy,
          order: qForm.order,
        });
        setMsg("✅ Question updated");
      } else {
        await createQuestion(qForm);
        setMsg("✅ Question created");
      }
      setShowForm(false);
    } catch (e: unknown) { setMsg("❌ " + (e instanceof Error ? e.message : "Error")); }
  };

  const toggleQuestionActive = async (q: Question) => {
    await updateQuestion({ questionId: q._id, isActive: !q.isActive });
  };

  const moveQuestion = async (q: Question, dir: number) => {
    const list = questionsByLetter[q.archetypeLetter] ?? [];
    const idx = list.findIndex((x) => x._id === q._id);
    const nidx = idx + dir;
    if (nidx < 0 || nidx >= list.length) return;
    const a = list[idx], b = list[nidx];
    await reorderQuestions({
      orders: [{ questionId: a._id, order: b.order }, { questionId: b._id, order: a.order }],
    });
  };

  const removeQuestion = async (q: Question) => {
    if (!confirm(`Delete "${q.statementEn}"?`)) return;
    await deleteQuestion({ questionId: q._id });
    setMsg("🗑️ Question deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Ocean Test</h1>
          <p className="text-xs text-gray-700">Manage archetypes &amp; personality questions • bilingual EN/MY</p>
        </div>
        <button
          onClick={() => tab === "archetypes" ? openCreateArchetype() : openCreateQuestion("O")}
          className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep"
        >
          + New {tab === "archetypes" ? "Archetype" : "Question"}
        </button>
      </div>

      {msg && <div className="rounded-xl border bg-amber-50 px-4 py-2 text-sm text-amber-800">{msg}</div>}

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl border bg-gray-100 p-1">
        {(["archetypes", "questions", "results"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-ocean-primary text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}>
            {t === "archetypes" ? "Archetypes (5)" : t === "questions" ? `Questions (${questions?.length ?? 0})` : `Results (${resultsData?.results?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* ── Archetypes Tab ── */}
      {tab === "archetypes" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!archetypes ? (
            <div className="col-span-full py-8 text-center text-gray-600">Loading…</div>
          ) : archetypes.map((a) => (
            <div key={a._id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${!a.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl">{a.emoji}</div>
                  <h3 className="mt-1 font-syncopate text-lg font-bold text-ocean-deep">{a.character}</h3>
                  <p className="text-sm text-gray-600">{a.name} • {a.letter}</p>
                </div>
                <button onClick={() => toggleArchetypeActive(a)}
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${a.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                  {a.isActive ? "Active" : "Off"}
                </button>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <p><span className="font-semibold">Animal:</span> {a.animal}</p>
                <p><span className="font-semibold">Wave:</span> {a.wave}</p>
                <p><span className="font-semibold">Traits:</span> {a.traitsEn.join(", ")}</p>
                <p className="line-clamp-2"><span className="font-semibold">Motto:</span> &ldquo;{a.mottoEn}&rdquo;</p>
              </div>
              <button onClick={() => openEditArchetype(a)}
                className="mt-3 w-full rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50">
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Questions Tab ── */}
      {tab === "questions" && (
        <div className="space-y-6">
          {LETTERS.map((letter) => {
            const arch = archetypes?.find((a) => a.letter === letter);
            const qs = questionsByLetter[letter] ?? [];
            return (
              <div key={letter} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{arch?.emoji}</span>
                    <span className="font-syncopate text-sm font-bold text-ocean-deep">{arch?.character} ({letter})</span>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{qs.length} questions</span>
                  </div>
                  <button onClick={() => openCreateQuestion(letter)}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-gray-100">
                    + Add
                  </button>
                </div>
                {qs.length === 0 ? (
                  <div className="px-4 py-4 text-center text-sm text-gray-500">No questions yet</div>
                ) : (
                  <div className="divide-y">
                    {qs.map((q, idx) => (
                      <div key={q._id} className={`flex items-center gap-3 px-4 py-3 transition ${!q.isActive ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                        <span className="w-6 text-center font-mono text-xs text-gray-500">{q.order}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{q.statementEn}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{q.statementMy}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveQuestion(q, -1)} disabled={idx === 0}
                            className="rounded border px-1.5 py-1 text-xs hover:bg-gray-100 disabled:opacity-30">↑</button>
                          <button onClick={() => moveQuestion(q, 1)} disabled={idx === qs.length - 1}
                            className="rounded border px-1.5 py-1 text-xs hover:bg-gray-100 disabled:opacity-30">↓</button>
                          <button onClick={() => toggleQuestionActive(q)}
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${q.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                            {q.isActive ? "On" : "Off"}
                          </button>
                          <button onClick={() => openEditQuestion(q)}
                            className="rounded border px-2 py-1 text-xs font-semibold hover:bg-gray-50">Edit</button>
                          <button onClick={() => removeQuestion(q)}
                            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Results Tab ── */}
      {tab === "results" && (
        <div className="space-y-4">
          {resultsData?.duplicateEmails && resultsData.duplicateEmails.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-bold">⚠️ Duplicate emails detected:</span>{" "}
              {resultsData.duplicateEmails.join(", ")}
              <p className="mt-1 text-xs text-amber-600">Same email used by both registered user and guest.</p>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="max-h-[64vh] overflow-y-auto overscroll-contain" data-lenis-prevent>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">User</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Archetype</th>
                    <th className="px-3 py-2 text-left">Scores</th>
                    <th className="px-3 py-2 text-left">Flags</th>
                    <th className="px-3 py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {!resultsData ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">Loading…</td></tr>
                  ) : resultsData.results.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No results yet.</td></tr>
                  ) : resultsData.results.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-800">{r.displayName || "—"}</div>
                        {r.participantName && r.guestName && (
                          <div className="text-xs text-amber-600">Also: {r.guestName}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={resultsData.duplicateEmails.includes(r.displayEmail ?? "") ? "font-bold text-amber-600" : "font-semibold text-ocean-primary"}>
                          {r.displayEmail || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.userType === "REGISTERED" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                          {r.userType === "REGISTERED" ? "Reg" : "Guest"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-dynapuff font-bold text-ocean-deep">{r.finalArchetype}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">
                        O:{r.scores.O} C:{r.scores.C} E:{r.scores.E} A:{r.scores.A} N:{r.scores.N}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {r.wasTieBreaker && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">Tie</span>}
                          {r.allSameAnswers && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Same</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-gray-500">
                        {new Date(r.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-ocean-medium shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="font-syncopate text-lg font-bold">
                {editingArchetype ? "Edit Archetype" : editingQuestion ? "Edit Question" : "New"}
              </h3>
              <button onClick={() => setShowForm(false)} className="rounded-full border px-3 py-1 text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-6" data-lenis-prevent>

              {/* Archetype form */}
              {(editingArchetype !== null || (showForm && !editingQuestion && tab === "archetypes")) && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold">Letter</label>
                      <select value={archForm.letter} onChange={(e) => setArchForm({ ...archForm, letter: e.target.value })}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" disabled={!!editingArchetype}>
                        {LETTERS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Character Name</label>
                      <input value={archForm.character} onChange={(e) => setArchForm({ ...archForm, character: e.target.value })}
                        placeholder="Sharkie" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Emoji</label>
                      <input value={archForm.emoji} onChange={(e) => setArchForm({ ...archForm, emoji: e.target.value })}
                        placeholder="🦈" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold">Archetype Name</label>
                      <input value={archForm.name} onChange={(e) => setArchForm({ ...archForm, name: e.target.value })}
                        placeholder="The Catalyst" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Animal</label>
                      <input value={archForm.animal} onChange={(e) => setArchForm({ ...archForm, animal: e.target.value })}
                        placeholder="Shark" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold">Wave</label>
                      <input value={archForm.wave} onChange={(e) => setArchForm({ ...archForm, wave: e.target.value })}
                        placeholder="Forward" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>

                  {/* Traits */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold">Traits (EN)</label>
                      {archForm.traitsEn.map((t, i) => (
                        <input key={i} value={t} onChange={(e) => {
                          const arr = [...archForm.traitsEn]; arr[i] = e.target.value; setArchForm({ ...archForm, traitsEn: arr });
                        }} placeholder={`Trait ${i + 1}`} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Traits (MY)</label>
                      {archForm.traitsMy.map((t, i) => (
                        <input key={i} value={t} onChange={(e) => {
                          const arr = [...archForm.traitsMy]; arr[i] = e.target.value; setArchForm({ ...archForm, traitsMy: arr });
                        }} placeholder={`Trait ${i + 1}`} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                      ))}
                    </div>
                  </div>

                  {/* Motto */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold">Motto (EN)</label>
                      <input value={archForm.mottoEn} onChange={(e) => setArchForm({ ...archForm, mottoEn: e.target.value })}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Motto (MY)</label>
                      <input value={archForm.mottoMy} onChange={(e) => setArchForm({ ...archForm, mottoMy: e.target.value })}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold">Description (EN)</label>
                      <textarea value={archForm.descriptionEn} onChange={(e) => setArchForm({ ...archForm, descriptionEn: e.target.value })}
                        rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Description (MY)</label>
                      <textarea value={archForm.descriptionMy} onChange={(e) => setArchForm({ ...archForm, descriptionMy: e.target.value })}
                        rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>

                  {/* Tie-breaker */}
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                    <h4 className="text-xs font-bold text-gray-700">Tie-Breaker Statement</h4>
                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                      <input value={archForm.tieBreakerStatementEn} onChange={(e) => setArchForm({ ...archForm, tieBreakerStatementEn: e.target.value })}
                        placeholder="EN tie-breaker" className="rounded-lg border px-3 py-2 text-sm" />
                      <input value={archForm.tieBreakerStatementMy} onChange={(e) => setArchForm({ ...archForm, tieBreakerStatementMy: e.target.value })}
                        placeholder="MY tie-breaker" className="rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Question form */}
              {(editingQuestion !== null || (showForm && tab === "questions")) && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold">Question ID</label>
                      <input value={qForm.id} onChange={(e) => setQForm({ ...qForm, id: e.target.value })}
                        placeholder="O1" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono" disabled={!!editingQuestion} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Archetype</label>
                      <select value={qForm.archetypeLetter} onChange={(e) => setQForm({ ...qForm, archetypeLetter: e.target.value })}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" disabled={!!editingQuestion}>
                        {LETTERS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Order</label>
                      <input type="number" value={qForm.order} onChange={(e) => setQForm({ ...qForm, order: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Statement (EN)</label>
                    <textarea value={qForm.statementEn} onChange={(e) => setQForm({ ...qForm, statementEn: e.target.value })}
                      rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="I enjoy being around people more than working alone." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Statement (MY)</label>
                    <textarea value={qForm.statementMy} onChange={(e) => setQForm({ ...qForm, statementMy: e.target.value })}
                      rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="တစ်ယောက်တည်းလုပ်တာထက် လူတွေနဲ့အတူလုပ်ရတာ ပိုကြိုက်တယ်။" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2 text-sm">Cancel</button>
              <button onClick={editingArchetype !== null || (tab === "archetypes" && !editingQuestion) ? saveArchetype : saveQuestion}
                className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
                {editingArchetype || editingQuestion ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
