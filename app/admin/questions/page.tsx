"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Opt = { id: string; labelEn: string; labelMy: string };
type Sig = { optionId: string; roleId: Id<"buildathonRoles">; weight: number };
type Question = Doc<"roleDiscoveryQuestions">;
type QuestionType = "single" | "multiple" | "scenario" | "scale" | "longtext" | "yesno" | "single-with-text";
type Phase = "pre-event" | "main-event";

export default function AdminQuestionsPage() {
  const questions = useQuery(api.roleDiscoveryQuestions.listQuestions);
  const roles = useQuery(api.buildathonRoles.listRoles, { activeOnly: false });

  const createQ = useMutation(api.roleDiscoveryQuestions.createQuestion);
  const updateQ = useMutation(api.roleDiscoveryQuestions.updateQuestion);
  const reorder = useMutation(api.roleDiscoveryQuestions.reorderQuestions);

  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterPhase, setFilterPhase] = useState<Phase>("main-event");
  const [qSearch, setQSearch] = useState("");
  const [editing, setEditing] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<{
    phase: Phase; category: string; type: QuestionType;
    textEn: string; textMy: string; options: Opt[]; scoringSignals: Sig[];
    multiTextCount: number; multiTextPlaceholders: string[];
    order: number; version: string; allowNotSure: boolean;
  }>({
    phase: "main-event", category: "collaboration", type: "single", textEn: "", textMy: "",
    options: [{ id: "A", labelEn: "", labelMy: "" }, { id: "B", labelEn: "", labelMy: "" }],
    scoringSignals: [], multiTextCount: 4, multiTextPlaceholders: ["", "", "", ""],
    order: 0, version: "v1", allowNotSure: true,
  });

  const needsOptions = ["single", "scenario", "single-with-text"].includes(form.type);
  const isMultiText = form.type === "multiple";
  const hasScoring = ["single", "scenario"].includes(form.type);

  const categories = useMemo(() => {
    const cats = new Set<string>(["all", "collaboration", "product", "design", "engineering", "research"]);
    questions?.forEach((q) => cats.add(q.category));
    return Array.from(cats);
  }, [questions]);

  const filtered = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      if (q.phase !== filterPhase) return false;
      if (filterCat !== "all" && q.category !== filterCat) return false;
      if (qSearch && !`${q.textEn} ${q.textMy} ${q.category}`.toLowerCase().includes(qSearch.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [questions, filterPhase, filterCat, qSearch]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      phase: filterPhase, category: "collaboration", type: "single", textEn: "", textMy: "",
      options: [{ id: "A", labelEn: "", labelMy: "" }, { id: "B", labelEn: "", labelMy: "" }],
      scoringSignals: [], multiTextCount: 4, multiTextPlaceholders: ["", "", "", ""],
      order: (questions?.filter((q) => q.phase === filterPhase).length ?? 0), version: "v1", allowNotSure: true,
    });
    setShowForm(true);
  };
  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      phase: q.phase, category: q.category, type: q.type, textEn: q.textEn, textMy: q.textMy,
      options: q.options, scoringSignals: q.scoringSignals ?? [],
      multiTextCount: q.multiTextCount ?? 4, multiTextPlaceholders: q.multiTextPlaceholders ?? ["", "", "", ""],
      order: q.order, version: q.version, allowNotSure: !!q.allowNotSure,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.textEn.trim() || !form.textMy.trim()) { setMsg("EN and MY text required"); return; }
    if (needsOptions && form.options.some((o) => !o.labelEn.trim() || !o.labelMy.trim())) { setMsg("All options need EN+MY labels"); return; }
    if (isMultiText && (form.multiTextCount < 2 || form.multiTextCount > 6)) { setMsg("Multi-text count must be 2-6"); return; }
    try {
      if (editing) {
        await updateQ({
          questionId: editing._id, phase: form.phase, textEn: form.textEn, textMy: form.textMy,
          options: form.options, scoringSignals: form.scoringSignals,
          multiTextCount: isMultiText ? form.multiTextCount : undefined,
          multiTextPlaceholders: isMultiText ? form.multiTextPlaceholders.slice(0, form.multiTextCount) : undefined,
          order: form.order, isActive: editing.isActive,
        });
        setMsg("✅ Updated");
      } else {
        await createQ({
          phase: form.phase, category: form.category, type: form.type, textEn: form.textEn, textMy: form.textMy,
          options: form.options, required: true, scoringSignals: form.scoringSignals,
          multiTextCount: isMultiText ? form.multiTextCount : undefined,
          multiTextPlaceholders: isMultiText ? form.multiTextPlaceholders.slice(0, form.multiTextCount) : undefined,
          order: form.order, version: form.version, allowNotSure: form.allowNotSure,
        });
        setMsg("✅ Created");
      }
      setShowForm(false);
    } catch (e: unknown) { setMsg("❌ " + (e instanceof Error ? e.message : "Unknown error")); }
  };

  const toggleActive = async (q: Question) => {
    await updateQ({ questionId: q._id, isActive: !q.isActive });
  };
  const move = async (q: Question, dir: number) => {
    const sorted = [...filtered];
    const idx = sorted.findIndex((x) => x._id === q._id);
    const nidx = idx + dir;
    if (nidx < 0 || nidx >= sorted.length) return;
    const a = sorted[idx], b = sorted[nidx];
    await reorder({ orders: [{ questionId: a._id, order: b.order }, { questionId: b._id, order: a.order }] });
  };

  const addOption = () => {
    const id = String.fromCharCode(65 + form.options.length);
    setForm({ ...form, options: [...form.options, { id, labelEn: "", labelMy: "" }] });
  };
  const addSignal = () => {
    if (!roles?.[0]) return;
    setForm({ ...form, scoringSignals: [...form.scoringSignals, { optionId: form.options[0]?.id ?? "A", roleId: roles[0]._id, weight: 2 }] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Registration Questions</h1>
          <p className="text-xs text-gray-700">Manage pre-event &amp; main-event questions • bilingual EN/MY • shuffled options</p>
        </div>
        <button onClick={openCreate} className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">+ New Question</button>
      </div>

      {msg && <div className="rounded-xl border bg-amber-50 px-4 py-2 text-sm text-amber-800">{msg}</div>}

      {/* Phase toggle */}
      <div className="flex gap-1 rounded-xl border bg-gray-100 p-1">
        {(["pre-event", "main-event"] as Phase[]).map((p) => (
          <button key={p} onClick={() => setFilterPhase(p)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${filterPhase === p ? "bg-ocean-primary text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}>
            {p === "pre-event" ? "Pre-Event" : "Main Event"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-ocean-medium">
        <input placeholder="Search EN/MY/category" value={qSearch} onChange={(e) => setQSearch(e.target.value)} className="min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded-lg border px-3 py-2 text-sm text-ocean-medium">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">{filtered.length} / {questions?.filter((q) => q.phase === filterPhase).length ?? 0}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="max-h-[64vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Category / Type</th><th className="px-3 py-2 text-left">Question (EN)</th><th className="px-3 py-2 text-left">Options</th><th className="px-3 py-2 text-left">Active</th><th className="px-3 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {!questions ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No questions — seed 20–30 for v1.</td></tr>
              ) : filtered.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50 ">
                  <td className="px-3 py-2 font-mono text-xs text-ocean-medium">{q.order}</td>
                  <td className="px-3 py-2"><div className="font-semibold text-ocean-medium">{q.category}</div><div className="text-xs text-gray-600">{q.type} • {q.version} {q.allowNotSure ? "• I'm not sure" : ""}</div></td>
                  <td className="px-3 py-2 max-w-[320px]"><div className="line-clamp-2 font-medium text-gray-800">{q.textEn}</div><div className="line-clamp-1 text-xs text-gray-600">{q.textMy}</div></td>
                  <td className="px-3 py-2 text-xs text-ocean-medium">{q.options?.length} opts • {q.scoringSignals?.length ?? 0} signals</td>
                  <td className="px-3 py-2"><button onClick={() => toggleActive(q)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${q.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>{q.isActive ? "Active" : "Off"}</button></td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1 text-ocean-medium">
                      <button onClick={() => move(q, -1)} className="rounded border px-1.5 py-1 text-xs hover:bg-gray-100">↑</button>
                      <button onClick={() => move(q, 1)} className="rounded border px-1.5 py-1 text-xs hover:bg-gray-100">↓</button>
                      <button onClick={() => openEdit(q)} className="rounded bg-white border px-2.5 py-1 text-xs font-semibold hover:bg-gray-50">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white text-ocean-medium p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-syncopate text-lg font-bold">{editing ? "Edit Question" : "New Question"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-full border px-3 py-1 text-sm">✕</button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value as Phase })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="pre-event">Pre-Event</option>
                <option value="main-event">Main Event</option>
              </select>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="collaboration">collaboration</option><option value="product">product</option><option value="design">design</option><option value="engineering">engineering</option><option value="research">research</option>
              </select>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="single">Single choice</option>
                <option value="multiple">Multiple (text inputs)</option>
                <option value="scenario">Scenario</option>
                <option value="scale">Scale (1-5)</option>
                <option value="longtext">Long text</option>
                <option value="yesno">Yes / No</option>
                <option value="single-with-text">Option + text input</option>
              </select>
              <input placeholder="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="rounded-lg border px-3 py-2 text-sm" />
              <input placeholder="Version (v1)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allowNotSure} onChange={(e) => setForm({ ...form, allowNotSure: e.target.checked })} /> Allow &ldquo;I&apos;m not sure yet&rdquo;</label>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold">EN</label>
              <textarea value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} placeholder="Casual scenario: Your team has three ideas but time for one…" className="min-h-[64px] w-full rounded-lg border px-3 py-2 text-sm" />
              <label className="text-sm font-semibold">MY</label>
              <textarea value={form.textMy} onChange={(e) => setForm({ ...form, textMy: e.target.value })} placeholder="မြန်မာ" className="min-h-[64px] w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            {needsOptions && (
              <div className="mt-4">
                <div className="flex items-center justify-between"><h4 className="text-sm font-bold">Options (id stable, shuffled on read)</h4><button onClick={addOption} className="rounded border px-2 py-1 text-xs">+ Option</button></div>
                <div className="mt-2 grid gap-2">
                  {form.options.map((o, idx) => (
                    <div key={o.id} className="grid gap-2 rounded-lg border bg-gray-50 p-2 md:grid-cols-[64px_1fr_1fr_auto]">
                      <input value={o.id} onChange={(e) => { const arr=[...form.options]; arr[idx].id=e.target.value; setForm({ ...form, options:arr}); }} className="rounded border px-2 py-1.5 text-sm font-mono" placeholder="A" />
                      <input value={o.labelEn} onChange={(e) => { const arr=[...form.options]; arr[idx].labelEn=e.target.value; setForm({ ...form, options:arr}); }} className="rounded border px-2 py-1.5 text-sm" placeholder="EN label" />
                      <input value={o.labelMy} onChange={(e) => { const arr=[...form.options]; arr[idx].labelMy=e.target.value; setForm({ ...form, options:arr}); }} className="rounded border px-2 py-1.5 text-sm" placeholder="MY label" />
                      <button onClick={() => setForm({ ...form, options: form.options.filter((_, i) => i!==idx) })} className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">✕</button>
                    </div>
                  ))}
                </div>
                {form.type === "single-with-text" && (
                  <p className="mt-2 text-xs text-gray-500">First option becomes the &ldquo;text input&rdquo; option. Label shown as placeholder.</p>
                )}
              </div>
            )}

            {isMultiText && (
              <div className="mt-4 rounded-lg border bg-blue-50 p-4">
                <h4 className="text-sm font-bold text-blue-800">Text Input Fields</h4>
                <p className="mt-1 text-xs text-blue-600">Participant types their own answers. Configure how many fields and placeholder text.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[120px_1fr]">
                  <div>
                    <label className="text-xs font-semibold text-blue-700">Number of fields</label>
                    <select value={form.multiTextCount} onChange={(e) => {
                      const count = Number(e.target.value);
                      const ph = [...form.multiTextPlaceholders];
                      while (ph.length < count) ph.push("");
                      setForm({ ...form, multiTextCount: count, multiTextPlaceholders: ph.slice(0, count) });
                    }} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                      {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} fields</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: form.multiTextCount }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-mono text-blue-600">{idx + 1}</span>
                        <input
                          value={form.multiTextPlaceholders[idx] ?? ""}
                          onChange={(e) => {
                            const ph = [...form.multiTextPlaceholders];
                            ph[idx] = e.target.value;
                            setForm({ ...form, multiTextPlaceholders: ph });
                          }}
                          placeholder={`Placeholder for field ${idx + 1}`}
                          className="flex-1 rounded-lg border border-blue-200 px-3 py-1.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!needsOptions && !isMultiText && (
              <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                {form.type === "longtext" && "Participants will see a textarea to type a free-form response. No options needed."}
                {form.type === "yesno" && "Participants will see Yes/No buttons. No options needed."}
                {form.type === "scale" && "Participants will see a scale (1-5). No options needed."}
              </div>
            )}

            {hasScoring && (
              <div className="mt-4">
                <div className="flex items-center justify-between"><h4 className="text-sm font-bold">Scoring signals (hidden, per option → role +weight)</h4><button onClick={addSignal} className="rounded border px-2 py-1 text-xs">+ Signal</button></div>
                <p className="text-xs text-gray-600">Avoid A=PM direct mapping — shuffle keeps identity. Example: Research +2, Product +3.</p>
                <div className="mt-2 grid gap-2">
                  {form.scoringSignals.map((s, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border bg-white p-2 md:grid-cols-[1fr_1fr_80px_auto]">
                      <select value={s.optionId} onChange={(e)=>{const arr=[...form.scoringSignals]; arr[idx].optionId=e.target.value; setForm({...form, scoringSignals:arr});}} className="rounded border px-2 py-1.5 text-sm">
                        {form.options.map((o)=><option key={o.id} value={o.id}>{o.id}</option>)}
                      </select>
                      <select value={s.roleId} onChange={(e)=>{const arr=[...form.scoringSignals]; arr[idx].roleId=e.target.value as Id<"buildathonRoles">; setForm({...form, scoringSignals:arr});}} className="rounded border px-2 py-1.5 text-sm">
                        {roles?.map((r)=><option key={r._id} value={r._id}>{r.nameEn} ({r.category})</option>)}
                      </select>
                      <input type="number" value={s.weight} onChange={(e)=>{const arr=[...form.scoringSignals]; arr[idx].weight=Number(e.target.value); setForm({...form, scoringSignals:arr});}} className="rounded border px-2 py-1.5 text-sm" placeholder="+3" />
                      <button onClick={()=>setForm({...form, scoringSignals: form.scoringSignals.filter((_,i)=>i!==idx)})} className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">✕</button>
                    </div>
                  ))}
                  {form.scoringSignals.length===0 && <p className="text-xs text-gray-600">No signals yet — add per option.</p>}
                </div>
              </div>
            )}

            {!hasScoring && (
              <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                {form.type === "longtext" && "Long text responses are for qualitative data. No auto-scoring — reviewed manually."}
                {form.type === "yesno" && "Yes/No responses don't map to roles. Use for screening or sentiment."}
                {form.type === "scale" && "Scale responses can be scored but need role mapping configured separately."}
                {form.type === "single-with-text" && "Text input responses are qualitative. Only the option selection is scored."}
                {isMultiText && "Text inputs are qualitative data. No auto-scoring — reviewed manually."}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setShowForm(false)} className="rounded-xl border px-5 py-2 text-sm">Cancel</button>
              <button onClick={handleSave} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
