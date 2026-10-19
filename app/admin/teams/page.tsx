"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TRACK_FILTERS = [
  { key: "all", label: "All" },
  { key: "in_person", label: "In-Person" },
  { key: "online", label: "Online" },
] as const;

/** Trailing-edge debounce so filtering runs once the admin stops typing. */
function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Wraps every occurrence of `query` in a <mark> inside `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q || !text) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded-sm bg-amber-100 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Convex wraps mutation errors in "Uncaught Error: …" — strip it for display. */
function errMsg(e: unknown, fallback: string) {
  let raw = e instanceof Error ? e.message : "";
  const uncaught = raw.match(/Uncaught Error:\s*([\s\S]*)/);
  if (uncaught) raw = uncaught[1];
  raw = raw.replace(/^Error:\s*/i, "").replace(/\s+/g, " ").trim();
  return "❌ " + (raw || fallback);
}

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
  const directory = useQuery(api.teams.listParticipantDirectory);
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

  // Search & filters
  const [teamSearch, setTeamSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<"all" | "in_person" | "online">("all");
  const [groupFilter, setGroupFilter] = useState("all"); // "all" | "unassigned" | team id
  const [positionFilter, setPositionFilter] = useState("all");
  const debouncedTeamSearch = useDebounced(teamSearch);
  const debouncedPeopleSearch = useDebounced(peopleSearch);

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
  // Participant edit modal (name / email / positions / group)
  const [editingPerson, setEditingPerson] = useState<{
    participantId: Id<"participants">;
    teamId: Id<"teams"> | null;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPositions, setEditPositions] = useState<string[]>([]);
  const [editTeamId, setEditTeamId] = useState<Id<"teams"> | null>(null);
  const [editBusy, setEditBusy] = useState(false);

  const resetMemberForm = () => {
    setMemberFormTeam(null);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPositions([]);
  };

  // Filtered teams — matches name, code, badge, description or any member.
  const filteredTeams = useMemo(() => {
    const list = teams ?? [];
    const q = debouncedTeamSearch.trim().toLowerCase();
    return list.filter((team) => {
      if (trackFilter !== "all" && team.track !== trackFilter) return false;
      if (!q) return true;
      const haystack = [
        team.name,
        team.code,
        team.badge,
        team.description,
        ...team.members.flatMap((m) => [m.name, m.email, m.position ?? ""]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [teams, debouncedTeamSearch, trackFilter]);

  // Filtered participant directory — search + group (team) + position filters.
  const filteredPeople = useMemo(() => {
    const list = directory?.people ?? [];
    const q = debouncedPeopleSearch.trim().toLowerCase();
    return list.filter((person) => {
      if (groupFilter === "unassigned" && person.teamId) return false;
      if (groupFilter !== "all" && groupFilter !== "unassigned" && person.teamId !== groupFilter)
        return false;
      if (positionFilter !== "all") {
        const slots = (person.position ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!slots.includes(positionFilter)) return false;
      }
      if (!q) return true;
      const haystack = [person.name, person.email, person.position, person.teamName, person.teamCode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [directory, debouncedPeopleSearch, groupFilter, positionFilter]);

  const groupOptions = useMemo(() => {
    const opts = (teams ?? []).map((t) => ({
      id: t._id as string,
      label: [t.code, t.name || "Unnamed team"].filter(Boolean).join(" — "),
    }));
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [teams]);

  const positionOptions = useMemo(
    () => Array.from(new Set((positions ?? []).map((p) => p.name))),
    [positions],
  );

  // Quick-add target: the selected team card, or the team chosen in the group filter.
  const addTargetTeamId = useMemo(() => {
    if (selectedTeam) return selectedTeam;
    if (groupFilter !== "all" && groupFilter !== "unassigned") return groupFilter as Id<"teams">;
    return null;
  }, [selectedTeam, groupFilter]);

  // Close the participant modal on Escape
  useEffect(() => {
    if (!editingPerson) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setEditingPerson(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [editingPerson]);

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

  const openPersonEdit = (person: {
    participantId: Id<"participants">;
    name: string | null;
    email: string | null;
    position: string | null;
    teamId: Id<"teams"> | null;
  }) => {
    setEditingPerson({ participantId: person.participantId, teamId: person.teamId });
    setEditName(person.name ?? "");
    setEditEmail(person.email ?? "");
    setEditPositions(
      (person.position ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    setEditTeamId(person.teamId);
  };

  const handleSavePersonEdit = async () => {
    if (!editingPerson || editBusy) return;
    const name = editName.trim();
    if (!name) {
      setMsg("❌ Name is required");
      return;
    }
    const email = editEmail.trim().toLowerCase();
    if (email && !EMAIL_PATTERN.test(email)) {
      setMsg("❌ Enter a valid email address");
      return;
    }
    setEditBusy(true);
    try {
      await updateTeamMember({
        participantId: editingPerson.participantId,
        name,
        email,
        position: editPositions.join(", "),
      });
      if ((editTeamId ?? null) !== (editingPerson.teamId ?? null)) {
        if (editingPerson.teamId) {
          await removeMember({
            teamId: editingPerson.teamId,
            participantId: editingPerson.participantId,
          });
        }
        if (editTeamId) {
          await addMember({ teamId: editTeamId, participantId: editingPerson.participantId });
        }
      }
      setMsg("✅ Participant updated");
      setEditingPerson(null);
    } catch (e: unknown) {
      setMsg(errMsg(e, "Failed to update participant"));
    } finally {
      setEditBusy(false);
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
          {/* Team search + track filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-medium" />
              <input
                type="search"
                aria-label="Search teams"
                placeholder="Search teams by name, code or member…"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full rounded-xl border border-ocean-surface bg-white py-2.5 pl-9 pr-9 text-sm text-ocean-deep placeholder:text-ocean-medium focus:border-ocean-primary focus:outline-none focus:ring-2 focus:ring-ocean-primary/20"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => setTeamSearch("")}
                  aria-label="Clear team search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <ClearIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRACK_FILTERS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTrackFilter(t.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    trackFilter === t.key
                      ? "bg-ocean-primary text-white shadow-sm"
                      : "border border-ocean-surface bg-white text-ocean-medium hover:border-ocean-primary hover:text-ocean-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {teams ? `${filteredTeams.length} / ${teams.length} teams` : "Loading…"}
            </span>
          </div>

          {!teams ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">👥</div>
              <p>No teams created yet.</p>
              <p className="mt-1 text-xs">Auto-create them from submitted, payment-verified registrations — or add one manually.</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              <div className="mb-3 text-3xl">🔍</div>
              <p>
                No teams match {debouncedTeamSearch ? `“${debouncedTeamSearch}”` : "your filters"}
                {trackFilter !== "all" ? ` on the ${TRACK_FILTERS.find((t) => t.key === trackFilter)?.label} track` : ""}.
              </p>
              <button
                onClick={() => {
                  setTeamSearch("");
                  setTrackFilter("all");
                }}
                className="mt-3 rounded-lg border border-ocean-surface px-3 py-1.5 text-xs font-bold text-ocean-primary hover:bg-ocean-foam"
              >
                Clear search & filters
              </button>
            </div>
          ) : (
            filteredTeams.map((team) => (
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
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm text-ocean-primary font-semibold">
                            <Highlight text={member.name} query={debouncedTeamSearch} />
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {member.email === "—" ? (
                              <span className="italic text-gray-400">No email</span>
                            ) : (
                              <Highlight text={member.email} query={debouncedTeamSearch} />
                            )}
                          </div>
                        </div>
                        <span className="hidden shrink-0 rounded-full bg-ocean-surface px-2 py-0.5 text-xs font-semibold text-ocean-deep sm:block">
                          {member.position || "—"}
                        </span>
                        <button
                          onClick={() =>
                            openPersonEdit({
                              participantId: member.id,
                              name: member.name === "—" ? null : member.name,
                              email: member.email === "—" ? null : member.email,
                              position: member.position,
                              teamId: team._id,
                            })
                          }
                          className="shrink-0 rounded border px-2 py-1 text-xs font-semibold hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleRemoveMember(team._id, member.id)} className="shrink-0 rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Participant search — every person, filterable by group */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ocean-deep">Find Participants</h3>
                <p className="text-xs text-gray-500">Search by name, email or position, then filter by group.</p>
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {directory ? `${filteredPeople.length}/${directory.people.length}` : "…"}
              </span>
            </div>

            <div className="relative mt-3">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-medium" />
              <input
                type="search"
                aria-label="Search participants"
                placeholder="Search name, email, position…"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                className="w-full rounded-xl border border-ocean-surface bg-white py-2.5 pl-9 pr-9 text-sm text-ocean-deep placeholder:text-ocean-medium focus:border-ocean-primary focus:outline-none focus:ring-2 focus:ring-ocean-primary/20"
              />
              {peopleSearch && (
                <button
                  type="button"
                  onClick={() => setPeopleSearch("")}
                  aria-label="Clear participant search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <ClearIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <select
                aria-label="Filter participants by group"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full rounded-xl border border-ocean-surface bg-white px-3 py-2 text-sm text-ocean-deep focus:border-ocean-primary focus:outline-none"
              >
                <option value="all">All groups</option>
                <option value="unassigned">Unassigned</option>
                {groupOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter participants by position"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full rounded-xl border border-ocean-surface bg-white px-3 py-2 text-sm text-ocean-deep focus:border-ocean-primary focus:outline-none"
              >
                <option value="all">All positions</option>
                {positionOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {(peopleSearch || groupFilter !== "all" || positionFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setPeopleSearch("");
                  setGroupFilter("all");
                  setPositionFilter("all");
                }}
                className="mt-2 text-xs font-bold text-ocean-primary hover:underline"
              >
                Clear search & filters
              </button>
            )}

            {!directory ? (
              <p className="mt-4 text-sm text-gray-400">Loading...</p>
            ) : filteredPeople.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-ocean-surface bg-ocean-foam/40 p-4 text-center">
                <p className="text-sm font-semibold text-ocean-deep">No participants found</p>
                <p className="mt-1 text-xs text-gray-500">
                  Nothing matches {debouncedPeopleSearch ? `“${debouncedPeopleSearch}”` : "the current filters"}.
                </p>
              </div>
            ) : (
              <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {filteredPeople.slice(0, 100).map((person) => {
                  const slots = (person.position ?? "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  return (
                    <div
                      key={person.participantId}
                      className="rounded-xl bg-gray-50 p-3 transition hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                            person.teamId ? "bg-ocean-primary" : "bg-gray-300"
                          }`}
                        >
                          {(person.name ?? "?").trim().charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ocean-deep">
                            {person.name ? (
                              <Highlight text={person.name} query={debouncedPeopleSearch} />
                            ) : (
                              <span className="italic text-gray-400">Unnamed participant</span>
                            )}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {person.email ? (
                              <Highlight text={person.email} query={debouncedPeopleSearch} />
                            ) : (
                              <span className="italic text-gray-400">No email yet</span>
                            )}
                          </div>
                        </div>
                        <span
                          title={person.teamName ?? undefined}
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            person.teamId ? "bg-ocean-surface text-ocean-deep" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {person.teamId
                            ? person.teamCode || person.teamName || "Team"
                            : "Unassigned"}
                        </span>
                      </div>

                      {slots.length > 0 && (
                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                          {slots.slice(0, 3).map((slot) => (
                            <span
                              key={slot}
                              className="max-w-full truncate rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ocean-medium ring-1 ring-inset ring-ocean-surface"
                            >
                              {slot}
                            </span>
                          ))}
                          {slots.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{slots.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 flex justify-end gap-1.5">
                        {!person.teamId && addTargetTeamId && (
                          <button
                            onClick={() => handleAddMember(addTargetTeamId, person.participantId)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            + Add to team
                          </button>
                        )}
                        <button
                          onClick={() => openPersonEdit(person)}
                          className="rounded-lg border border-ocean-surface px-2.5 py-1 text-xs font-semibold text-ocean-primary hover:bg-ocean-foam"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredPeople.length > 100 && (
                  <p className="pb-1 text-center text-[11px] text-gray-400">
                    Showing 100 of {filteredPeople.length} — refine your search to narrow it down.
                  </p>
                )}
              </div>
            )}

            {directory?.capped && (
              <p className="mt-2 text-[11px] text-amber-600">
                Directory capped at 2,000 people — search to narrow it down.
              </p>
            )}

            {!addTargetTeamId &&
              filteredPeople.some((p) => !p.teamId) && (
                <p className="mt-3 text-xs text-amber-600">
                  Select a team card (or pick a group) first to enable quick-add.
                </p>
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

      {/* Participant Edit Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-syncopate text-lg font-bold text-ocean-deep">Edit Participant</h3>
                <p className="mt-1 text-xs text-gray-500">Update their details and group assignment.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPerson(null)}
                aria-label="Close"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ClearIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600" htmlFor="edit-person-name">
                  Name
                </label>
                <input
                  id="edit-person-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600" htmlFor="edit-person-email">
                  Email
                </label>
                <input
                  id="edit-person-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-ocean-deep"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Sign-in uses this address — make sure it&apos;s the one they actually use.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Positions</label>
                <div className="mt-1">
                  <RolePicker
                    positions={positions ?? []}
                    selected={editPositions}
                    onChange={setEditPositions}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600" htmlFor="edit-person-team">
                  Group (team)
                </label>
                <select
                  id="edit-person-team"
                  value={editTeamId ?? ""}
                  onChange={(e) => setEditTeamId((e.target.value || null) as Id<"teams"> | null)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ocean-deep"
                >
                  <option value="">Unassigned</option>
                  {groupOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingPerson(null)}
                className="rounded-xl border px-5 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePersonEdit}
                disabled={editBusy}
                className="rounded-xl bg-ocean-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:opacity-50"
              >
                {editBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
