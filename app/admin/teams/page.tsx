"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  readRosterFile,
  exportRosterTemplate,
  type RosterRow,
} from "@/lib/roster-workbook";

const CATEGORY_LABEL: Record<string, string> = {
  engineering: "Engineering",
  design: "Design",
  product: "Product",
  business: "Business",
  team: "Team",
};

/** Multi-select dropdown for team roles. Selected names join with ", ". */
function RolePicker({
  positions,
  selected,
  onChange,
}: {
  positions: { name: string; category: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    );
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    setCustom("");
  };

  const grouped = positions.reduce<Record<string, { name: string }[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border bg-white px-3 py-2 text-left text-sm"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">Select roles…</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {selected.map((n) => (
              <span
                key={n}
                className="rounded-full bg-ocean-surface px-2 py-0.5 text-[11px] font-semibold text-ocean-deep"
              >
                {n}
              </span>
            ))}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-white p-2 shadow-lg">
          {positions.length === 0 && (
            <p className="px-1 py-1 text-xs text-gray-500">
              No roles seeded yet — run <code>seedTeamPositions:seed</code>.
            </p>
          )}
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="mb-2">
              <p className="px-1 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {CATEGORY_LABEL[cat] ?? cat}
              </p>
              {list.map((p) => (
                <label
                  key={p.name}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-ocean-deep hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.name)}
                    onChange={() => toggle(p.name)}
                    className="rounded"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          ))}
          <div className="mt-1 flex gap-1 border-t pt-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Custom role…"
              className="min-w-0 flex-1 rounded border px-2 py-1 text-xs text-ocean-deep"
            />
            <button
              type="button"
              onClick={addCustom}
              className="rounded bg-ocean-light px-2 py-1 text-xs text-white"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTeamsPage() {
  const teams = useQuery(api.teams.listTeams);
  const positions = useQuery(api.teamPositions.listPositions);
  const unassigned = useQuery(api.teams.listUnassignedParticipants);
  const autoCandidates = useQuery(api.teams.countAutoTeamCandidates);
  const createTeam = useMutation(api.teams.createTeam);
  const updateTeam = useMutation(api.teams.updateTeam);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const addMember = useMutation(api.teams.addMemberToTeam);
  const removeMember = useMutation(api.teams.removeMemberFromTeam);
  const addManualMember = useMutation(api.teams.addManualMember);
  const updateTeamMember = useMutation(api.teams.updateTeamMember);
  const autoCreateTeams = useMutation(api.teams.autoCreateTeams);
  const importRoster = useMutation(api.roster.importRoster);

  // Roster import
  const [showImportForm, setShowImportForm] = useState(false);
  const [rosterRows, setRosterRows] = useState<RosterRow[] | null>(null);
  const [rosterFilename, setRosterFilename] = useState("");
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [rosterBusy, setRosterBusy] = useState(false);
  const rosterPreview = useQuery(
    api.roster.previewRosterImport,
    rosterRows && rosterRows.length ? { rows: rosterRows } : "skip",
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Id<"teams"> | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamBadge, setTeamBadge] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Id<"teams"> | null>(null);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [teamSize, setTeamSize] = useState(5);
  const [autoBusy, setAutoBusy] = useState(false);

  // Manual member add form (per selected team)
  const [memberFormTeam, setMemberFormTeam] = useState<Id<"teams"> | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPositions, setNewMemberPositions] = useState<string[]>([]);
  // Inline member edit
  const [editingMember, setEditingMember] = useState<Id<"participants"> | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberPositions, setEditMemberPositions] = useState<string[]>([]);

  const resetMemberForm = () => {
    setMemberFormTeam(null);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPositions([]);
  };

  const handleCreate = async () => {
    try {
      if (editingTeam) {
        await updateTeam({
          teamId: editingTeam,
          name: teamName.trim() || undefined,
          description: teamDesc || undefined,
          code: teamCode.trim() || "",
          badge: teamBadge.trim() || "",
        });
        setMsg("✅ Team updated");
      } else {
        await createTeam({
          name: teamName.trim() || undefined,
          description: teamDesc || undefined,
          code: teamCode.trim() || undefined,
          badge: teamBadge.trim() || undefined,
        });
        setMsg("✅ Team created" + (teamName.trim() ? "" : " — give it a name later"));
      }
      setShowForm(false);
      setEditingTeam(null);
      setTeamName("");
      setTeamDesc("");
      setTeamCode("");
      setTeamBadge("");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const handleAutoCreate = async () => {
    setAutoBusy(true);
    try {
      const res = await autoCreateTeams({ teamSize });
      setMsg(`✅ ${res.message}`);
      setShowAutoForm(false);
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed to auto-create teams"));
    } finally {
      setAutoBusy(false);
    }
  };

  const handleRosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setRosterError(null);
    setRosterRows(null);
    try {
      const rows = await readRosterFile(file);
      setRosterRows(rows);
      setRosterFilename(file.name);
    } catch (err: unknown) {
      setRosterError(err instanceof Error ? err.message : "Could not read the file.");
    }
  };

  const handleRosterImport = async () => {
    if (!rosterRows || !rosterPreview || rosterBusy) return;
    setRosterBusy(true);
    try {
      const res = await importRoster({
        rows: rosterRows,
        filename: rosterFilename,
        expectedRevision: rosterPreview.revision,
      });
      setMsg(
        `✅ Roster imported: ${res.created} created · ${res.updated} updated · ${res.unchanged} unchanged · ${res.promoted} promoted · ${res.attached} team attaches`,
      );
      setShowImportForm(false);
      setRosterRows(null);
      setRosterFilename("");
    } catch (e: unknown) {
      setRosterError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setRosterBusy(false);
    }
  };

  const closeImportForm = () => {
    setShowImportForm(false);
    setRosterRows(null);
    setRosterFilename("");
    setRosterError(null);
  };

  const handleDelete = async (teamId: Id<"teams">) => {
    if (!confirm("Delete this team? Members will be unassigned.")) return;
    try {
      await deleteTeam({ teamId });
      setMsg("✅ Team deleted");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const handleAddMember = async (teamId: Id<"teams">, participantId: Id<"participants">) => {
    try {
      await addMember({ teamId, participantId });
      setMsg("✅ Member added");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const handleRemoveMember = async (teamId: Id<"teams">, participantId: Id<"participants">) => {
    try {
      await removeMember({ teamId, participantId });
      setMsg("✅ Member removed");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const handleAddManualMember = async (teamId: Id<"teams">) => {
    if (!newMemberName.trim()) {
      setMsg("❌ Name is required");
      return;
    }
    try {
      await addManualMember({
        teamId,
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
        position: newMemberPositions.join(", ") || undefined,
      });
      setMsg("✅ Member added");
      resetMemberForm();
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const handleSaveMemberEdit = async (participantId: Id<"participants">) => {
    try {
      await updateTeamMember({
        participantId,
        name: editMemberName.trim() || undefined,
        position: editMemberPositions.join(", ") || undefined,
      });
      setMsg("✅ Member updated");
      setEditingMember(null);
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
  };

  const openEdit = (team: { _id: Id<"teams">; name?: string; description?: string; code?: string; badge?: string }) => {
    setEditingTeam(team._id);
    setTeamName(team.name ?? "");
    setTeamDesc(team.description ?? "");
    setTeamCode(team.code ?? "");
    setTeamBadge(team.badge ?? "");
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Teams Management</h1>
          <p className="text-xs text-gray-700">Create teams and assign participants.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              closeImportForm();
              setShowImportForm(true);
            }}
            className="rounded-xl border border-ocean-primary bg-white px-5 py-2.5 text-sm font-bold text-ocean-primary hover:bg-ocean-foam"
          >
            📄 Import Roster
          </button>
          <button
            onClick={() => setShowAutoForm(true)}
            className="rounded-xl bg-ocean-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-primary"
          >
            ⚡ Auto-Create from Registrations
          </button>
          <button onClick={() => { setEditingTeam(null); setTeamName(""); setTeamDesc(""); setTeamCode(""); setTeamBadge(""); setShowForm(true); }} className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
            + New Team
          </button>
        </div>
      </div>

      {msg && <div className={`rounded-xl border px-4 py-2 text-sm ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{msg}</div>}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Teams List */}
        <div className="lg:col-span-2 space-y-4">
          {!teams ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">👥</div>
              <p>No teams created yet.</p>
              <p className="mt-1 text-xs">Auto-create them from submitted, payment-verified registrations — or add one manually.</p>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team._id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${selectedTeam === team._id ? "ring-2 ring-ocean-primary" : ""}`}>
                <div className="flex items-start justify-between">
                  <div onClick={() => setSelectedTeam(selectedTeam === team._id ? null : team._id)} className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      {team.code && (
                        <span className="rounded-full bg-ocean-deep px-2 py-0.5 text-xs font-bold text-white">{team.code}</span>
                      )}
                      <h3 className={`font-bold text-lg ${team.name ? "text-ocean-deep" : "italic text-gray-400"}`}>
                        {team.name || "Unnamed team"}
                      </h3>
                      {team.badge && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{team.badge}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
                      {team.track && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${team.track === "in_person" ? "bg-ocean-surface text-ocean-deep" : "bg-gray-100 text-gray-600"}`}>
                          {team.track === "in_person" ? "In-Person" : "Online"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{team.members.length} member(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => (memberFormTeam === team._id ? resetMemberForm() : setMemberFormTeam(team._id))}
                      className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      + Add member
                    </button>
                    <button onClick={() => openEdit(team)} className="rounded border px-2 py-1 text-xs font-semibold hover:bg-gray-50">Edit</button>
                    <button onClick={() => handleDelete(team._id)} className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>

                {/* Manual member add form */}
                {memberFormTeam === team._id && (
                  <div className="mt-4 rounded-xl border border-dashed border-ocean-primary/40 bg-ocean-foam/40 p-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        placeholder="Name *"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                      />
                      <RolePicker
                        positions={positions ?? []}
                        selected={newMemberPositions}
                        onChange={setNewMemberPositions}
                      />
                      <input
                        placeholder="Email (optional)"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                      />
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={resetMemberForm} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button
                        onClick={() => handleAddManualMember(team._id)}
                        className="rounded-lg bg-ocean-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-ocean-deep"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Members */}
                {team.members.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="w-8 h-8 rounded-full bg-ocean-primary text-white flex items-center justify-center text-sm font-bold">
                          {member.name?.[0] ?? "?"}
                        </div>
                        {editingMember === member.id ? (
                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            <input
                              value={editMemberName}
                              onChange={(e) => setEditMemberName(e.target.value)}
                              className="w-40 rounded border px-2 py-1 text-sm"
                              placeholder="Name"
                            />
                            <div className="min-w-40 flex-1">
                              <RolePicker
                                positions={positions ?? []}
                                selected={editMemberPositions}
                                onChange={setEditMemberPositions}
                              />
                            </div>
                            <button
                              onClick={() => handleSaveMemberEdit(member.id)}
                              className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMember(null)}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="text-sm text-ocean-primary font-semibold">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                            <span className="rounded-full bg-ocean-surface px-2 py-0.5 text-xs font-semibold text-ocean-deep">
                              {member.position || "—"}
                            </span>
                            <button
                              onClick={() => {
                                setEditingMember(member.id);
                                setEditMemberName(member.name ?? "");
                                setEditMemberPositions(
                                  (member.position ?? "")
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                );
                              }}
                              className="rounded border px-2 py-1 text-xs font-semibold hover:bg-gray-100"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <button onClick={() => handleRemoveMember(team._id, member.id)} className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Unassigned Participants */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-ocean-deep">Unassigned Participants</h3>
            <p className="text-xs text-gray-500">Click a team, then add members.</p>
            {!unassigned ? (
              <p className="mt-4 text-sm text-gray-400">Loading...</p>
            ) : unassigned.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">All participants assigned!</p>
            ) : (
              <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                {unassigned.map((p) => (
                  <div key={p.participantId} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold">
                      {p.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-gray-500 truncate">{p.email}</div>
                    </div>
                    {selectedTeam && (
                      <button onClick={() => handleAddMember(selectedTeam, p.participantId)} className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                        + Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!selectedTeam && unassigned && unassigned.length > 0 && (
              <p className="mt-3 text-xs text-amber-600">Select a team first to add members.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-syncopate text-lg font-bold text-ocean-deep">{editingTeam ? "Edit Team" : "Create Team"}</h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Team name (optional — you can add it later)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-ocean-deep"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Code (e.g. AI01)"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                />
                <input
                  placeholder="Badge (e.g. Recent)"
                  value={teamBadge}
                  onChange={(e) => setTeamBadge(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                />
              </div>
              <textarea
                placeholder="Description (optional)"
                value={teamDesc}
                onChange={(e) => setTeamDesc(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                rows={2}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2 text-sm">Cancel</button>
              <button onClick={handleCreate} className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white">
                {editingTeam ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auto-Create Modal */}
      {showAutoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-syncopate text-lg font-bold">Auto-Create Teams</h3>
            <p className="mt-3 text-sm text-gray-600">
              Groups <strong>submitted + payment-verified</strong> registrations that aren&apos;t on a team yet.
              Splits by track (In-Person / Online) and balances roles across teams. Names are left empty for you to add later.
            </p>
            <div className="mt-4 rounded-xl bg-ocean-foam p-4 text-sm">
              {!autoCandidates ? (
                <p className="text-gray-500">Counting eligible registrations…</p>
              ) : autoCandidates.total === 0 ? (
                <p className="text-gray-500">No eligible registrations right now.</p>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-ocean-deep">{autoCandidates.total} eligible participant(s)</p>
                  <p className="text-xs text-gray-600">
                    In-Person: {autoCandidates.byTrack.in_person ?? 0} • Online: {autoCandidates.byTrack.online ?? 0} • Track unspecified: {autoCandidates.byTrack.unspecified ?? 0}
                  </p>
                  {autoCandidates.capped && (
                    <p className="text-xs text-amber-600">Only the first 300 are placed per run — run again for the rest.</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Team size</label>
              <input
                type="number"
                min={2}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-20 rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowAutoForm(false)} className="rounded-xl border px-5 py-2 text-sm">Cancel</button>
              <button
                onClick={handleAutoCreate}
                disabled={autoBusy || !autoCandidates || autoCandidates.total === 0}
                className="rounded-xl bg-ocean-deep px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-primary disabled:opacity-50"
              >
                {autoBusy ? "Creating…" : "Create Teams"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-syncopate text-lg font-bold text-ocean-deep">
              Import Roster
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Upload an Excel/CSV list of invited people. Only people on this
              roster can sign in. Existing people are matched by email —
              importing never removes anyone. Admins on the roster sign in with
              Google only.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
                Choose file…
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleRosterFile}
                />
              </label>
              <button
                onClick={() => exportRosterTemplate()}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-ocean-primary hover:bg-ocean-foam"
              >
                Download template
              </button>
              {rosterFilename && (
                <span className="text-sm text-gray-500">
                  {rosterFilename} — {rosterRows?.length ?? 0} row(s)
                </span>
              )}
            </div>

            {rosterError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {rosterError}
              </div>
            )}

            {rosterPreview && (
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border">
                {rosterPreview.errors.length > 0 && (
                  <div className="border-b bg-red-50 px-4 py-3 text-sm text-red-700">
                    <p className="font-semibold">
                      Fix these before importing ({rosterPreview.errors.length}):
                    </p>
                    <ul className="mt-1 list-inside list-disc">
                      {rosterPreview.errors.slice(0, 10).map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                      {rosterPreview.errors.length > 10 && (
                        <li>…and {rosterPreview.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Team</th>
                      <th className="px-3 py-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterPreview.entries.map((entry) => (
                      <tr key={entry.email} className="border-t">
                        <td className="px-3 py-1.5 text-ocean-deep">
                          {entry.email}
                        </td>
                        <td className="px-3 py-1.5">{entry.name}</td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              entry.role === "admin"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-ocean-surface text-ocean-deep"
                            }`}
                          >
                            {entry.role}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {entry.team ?? "—"}
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              entry.before === "new"
                                ? "bg-emerald-100 text-emerald-700"
                                : entry.before === "update"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {entry.before === "new"
                              ? "New"
                              : entry.before === "update"
                                ? "Update"
                                : "Unchanged"}
                          </span>
                          {entry.upgradesAdmin && (
                            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              promote
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeImportForm}
                className="rounded-xl border px-5 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRosterImport}
                disabled={
                  rosterBusy ||
                  !rosterRows ||
                  !rosterPreview ||
                  rosterPreview.errors.length > 0
                }
                className="rounded-xl bg-ocean-deep px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-primary disabled:opacity-50"
              >
                {rosterBusy
                  ? "Importing…"
                  : rosterPreview
                    ? `Import ${rosterPreview.entries.length} row(s)`
                    : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
