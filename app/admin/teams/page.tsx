"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminTeamsPage() {
  const teams = useQuery(api.teams.listTeams);
  const unassigned = useQuery(api.teams.listUnassignedParticipants);
  const createTeam = useMutation(api.teams.createTeam);
  const updateTeam = useMutation(api.teams.updateTeam);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const addMember = useMutation(api.teams.addMemberToTeam);
  const removeMember = useMutation(api.teams.removeMemberFromTeam);

  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Id<"teams"> | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Id<"teams"> | null>(null);

  const handleCreate = async () => {
    if (!teamName.trim()) { setMsg("Team name required"); return; }
    try {
      if (editingTeam) {
        await updateTeam({ teamId: editingTeam, name: teamName, description: teamDesc || undefined });
        setMsg("✅ Team updated");
      } else {
        await createTeam({ name: teamName, description: teamDesc || undefined });
        setMsg("✅ Team created");
      }
      setShowForm(false);
      setEditingTeam(null);
      setTeamName("");
      setTeamDesc("");
    } catch (e: unknown) {
      setMsg("❌ " + (e instanceof Error ? e.message : "Failed"));
    }
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

  const openEdit = (team: { _id: Id<"teams">; name: string; description?: string }) => {
    setEditingTeam(team._id);
    setTeamName(team.name);
    setTeamDesc(team.description ?? "");
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syncopate text-xl font-bold text-ocean-deep">Teams Management</h1>
          <p className="text-xs text-gray-700">Create teams and assign participants.</p>
        </div>
        <button onClick={() => { setEditingTeam(null); setTeamName(""); setTeamDesc(""); setShowForm(true); }} className="rounded-xl bg-ocean-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep">
          + New Team
        </button>
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
            </div>
          ) : (
            teams.map((team) => (
              <div key={team._id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${selectedTeam === team._id ? "ring-2 ring-ocean-primary" : ""}`}>
                <div className="flex items-start justify-between">
                  <div onClick={() => setSelectedTeam(selectedTeam === team._id ? null : team._id)} className="cursor-pointer flex-1">
                    <h3 className="font-bold text-lg text-ocean-deep">{team.name}</h3>
                    {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{team.members.length} member(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(team)} className="rounded border px-2 py-1 text-xs font-semibold hover:bg-gray-50">Edit</button>
                    <button onClick={() => handleDelete(team._id)} className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>

                {/* Members */}
                {team.members.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="w-8 h-8 rounded-full bg-ocean-primary text-white flex items-center justify-center text-sm font-bold">
                          {member.name?.[0] ?? "?"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
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
            <h3 className="font-syncopate text-lg font-bold">{editingTeam ? "Edit Team" : "Create Team"}</h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={teamDesc}
                onChange={(e) => setTeamDesc(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
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
    </div>
  );
}
