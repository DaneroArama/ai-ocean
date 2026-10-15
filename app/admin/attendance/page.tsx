"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useConvex, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import {
  ATTENDANCE_SESSIONS,
  STATUS_LABELS,
  CERTIFICATE_AVAILABLE_AT,
  sessionDate,
  CERTIFICATE_EXPIRES_AT,
  type AttendanceStatus,
} from "@/lib/attendance";
import {
  exportAttendance,
  readAttendanceFile,
  type WorkbookRow,
} from "@/lib/attendance-workbook";
import {
  Icon,
  Modal,
  cleanError,
  useAttendanceClock,
} from "@/components/attendance/ui";
import "@/components/attendance/attendance.css";

type Person = FunctionReturnType<
  typeof api.attendance.adminOverview
>["participants"][number];
type Preview = FunctionReturnType<typeof api.attendance.previewImport>;
export default function Page() {
  const data = useQuery(api.attendance.adminOverview);
  const now = useAttendanceClock();
  const client = useConvex();
  const setRecord = useMutation(api.attendance.setRecord);
  const importRecords = useMutation(api.attendance.importRecords);
  const [sessionId, setSession] = useState<string>(ATTENDANCE_SESSIONS[0].id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);
  const [edit, setEdit] = useState<{
    person: Person;
    sessionId: string;
  } | null>(null);
  const [status, setStatus] = useState<AttendanceStatus>("present");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [preview, setPreview] = useState<{
    rows: WorkbookRow[];
    result: Preview;
    filename: string;
  } | null>(null);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = ATTENDANCE_SESSIONS.find((s) => s.id === sessionId)!;
  const openEdit = (person: Person, id: string) => {
    const record = person.records.find((r) => r.sessionId === id);
    setEdit({ person, sessionId: id });
    setStatus(record?.status || "unrecorded");
    setNote("");
    setMessage(null);
  };
  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      await setRecord({
        participantId: edit.person.id,
        sessionId: edit.sessionId,
        status,
        note,
        expectedUpdatedAt: edit.person.records.find(
          (r) => r.sessionId === edit.sessionId,
        )?.updatedAt,
      });
      setEdit(null);
      setMessage({ text: "Attendance saved. Progress has been recalculated." });
    } catch (error) {
      setMessage({ text: cleanError(error), error: true });
    } finally {
      setBusy(false);
    }
  };
  const readFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setPreview(null);
    setImportError("");
    try {
      const rows = await readAttendanceFile(file, sessionId);
      const result = await client.query(api.attendance.previewImport, {
        rows,
        sessionId,
      });
      setPreview({ rows, result, filename: file.name });
    } catch (error) {
      setImportError(cleanError(error));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const confirmImport = async () => {
    if (!preview) return;
    setBusy(true);
    setImportError("");
    try {
      const result = await importRecords({
        rows: preview.rows,
        filename: preview.filename,
        sessionId,
        expectedRevision: preview.result.revision,
      });
      setMessage({
        text: `${result.accepted} attendance records imported for ${sessionDate(sessionId)}. Matching records were overwritten; everyone else is unchanged.`,
      });
      setImportOpen(false);
      setPreview(null);
    } catch (error) {
      setImportError(cleanError(error));
    } finally {
      setBusy(false);
    }
  };
  const exportFile = async (report = false, csv = false) => {
    if (!data) return;
    setBusy(true);
    try {
      await exportAttendance(data.participants, sessionId, report, csv);
    } catch (error) {
      setMessage({ text: cleanError(error), error: true });
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return (
      <div className="att-shell att-admin">
        <div className="att-loading" role="status">
          Loading the attendance register…
        </div>
      </div>
    );
  const people = data.participants;
  const filtered = people.filter(
    (p) =>
      `${p.name} ${p.email} ${p.team}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" ||
        (p.records.find((r) => r.sessionId === sessionId)?.status ||
          "unrecorded") === filter),
  );
  const verified = people.filter(
    (p) =>
      p.records.find((r) => r.sessionId === sessionId)?.status === "present",
  ).length;
  const qualified = people.filter((p) => p.score >= 75).length;
  return (
    <div className="att-shell att-admin">
      <header className="att-admin-header">
        <div>
          <div className="att-eyebrow">Buildathon operations · 2026</div>
          <h1 className="att-heading">Show up. Make waves.</h1>
          <p className="att-description">
            A single register for every participant, every day.
            <br />
            Verify attendance, keep records clear, and celebrate completion.
          </p>
        </div>
        <Image
          src="/assets/Mascots/Tuto.png"
          alt="AI Ocean turtle"
          width={170}
          height={170}
        />
      </header>
      {data.local && (
        <div className="att-notice">
          <Icon name="shield" />
          <span>
            <strong>Local workspace.</strong> These records live on the isolated
            local backend.{" "}
            <Link href="/dashboard/attendance/demo">
              Test certificate download →
            </Link>
          </span>
        </div>
      )}
      {message && (
        <div
          role={message.error ? "alert" : "status"}
          className={`att-notice ${message.error ? "error" : "success"}`}
        >
          <span>{message.text}</span>
          <button
            className="att-icon-button"
            style={{ marginLeft: "auto", flexShrink: 0 }}
            aria-label="Dismiss notification"
            onClick={() => setMessage(null)}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      <div className="att-stats">
        <div className="att-stat">
          <span>PARTICIPANTS</span>
          <strong>{people.length}</strong>
          <small>Individual attendance records</small>
        </div>
        <div className="att-stat">
          <span>VERIFIED ON {sessionDate(sessionId).toUpperCase()}</span>
          <strong>
            {verified}
            <span style={{ display: "inline", fontSize: 15 }}>
              {" "}
              / {people.length}
            </span>
          </strong>
          <small>{selected.weight}% of the full journey</small>
        </div>
        <div className="att-stat">
          <span>75% MILESTONE REACHED</span>
          <strong>{qualified}</strong>
          <small>Eligible when downloads open</small>
        </div>
        <div className="att-stat">
          <span>CERTIFICATE STATUS</span>
          <strong style={{ fontSize: 22 }}>
            {now < CERTIFICATE_AVAILABLE_AT ? "Scheduled" : now < CERTIFICATE_EXPIRES_AT ? "Open" : "Closed"}
          </strong>
          <small>Automatic release: 2 Nov, 00:00 MMT</small>
        </div>
      </div>
      <section className="att-panel">
        <div className="att-panel-heading">
          <div>
            <h2 className="att-panel-title">The daily attendance register</h2>
            <p className="att-panel-subtitle">
              Choose a session. Click a status to edit, or upload a completed
              spreadsheet.
            </p>
          </div>
          <Link href="/attendance" className="att-back">
            Public tracker <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="att-days" role="group" aria-label="Attendance session">
          {ATTENDANCE_SESSIONS.map((s) => (
            <button
              key={s.id}
              aria-pressed={sessionId === s.id}
              className={`att-day ${sessionId === s.id ? "active" : ""}`}
              onClick={() => {
                setSession(s.id);
                setFilter("all");
              }}
            >
              <span>{s.short}</span>
              <strong>
                {sessionDate(s.id)}{" "}
                <small style={{ fontSize: 9, fontWeight: 500 }}>
                  · {s.weight}%
                </small>
              </strong>
            </button>
          ))}
        </div>
        <div className="att-toolbar">
          <label className="att-search">
            <Icon name="search" size={17} />
            <input
              placeholder="Find a participant or team…"
              aria-label="Search participants"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter attendance status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="att-toolbar-actions">
            <button
              className="att-button secondary"
              disabled={busy || !people.length}
              onClick={() => exportFile()}
            >
              <Icon name="download" size={15} />
              Export day .xlsx
            </button>
            <button
              className="att-button"
              disabled={busy}
              onClick={() => {
                setImportOpen(true);
                setPreview(null);
                setImportError("");
              }}
            >
              <Icon name="upload" size={15} />
              Import attendance
            </button>
          </div>
        </div>
        <div className="att-table-wrap">
          <table className="att-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Team</th>
                <th>
                  {sessionDate(sessionId)} · {selected.weight}%
                </th>
                <th>9-session journey</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => {
                const record = person.records.find(
                  (r) => r.sessionId === sessionId,
                );
                const value = record?.status || "unrecorded";
                return (
                  <tr key={person.id}>
                    <td>
                      <div className="att-person">
                        <span className="att-avatar">
                          {person.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <strong>{person.name}</strong>
                          <small>{person.email || "No email on file"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{person.team}</td>
                    <td>
                      <button
                        className="att-status-button"
                        onClick={() => openEdit(person, sessionId)}
                        aria-label={`Edit ${person.name} · ${selected.title}`}
                      >
                        <i className={`att-dot ${value}`} />
                        {STATUS_LABELS[value]}
                        <Icon name="edit" size={12} />
                      </button>
                    </td>
                    <td>
                      <div className="att-journey">
                        {ATTENDANCE_SESSIONS.map((s) => (
                          <button
                            key={s.id}
                            className={
                              person.records.find((r) => r.sessionId === s.id)
                                ?.status || "unrecorded"
                            }
                            title={`${s.title}: ${STATUS_LABELS[person.records.find((r) => r.sessionId === s.id)?.status || "unrecorded"]}`}
                            aria-label={`Edit ${person.name} · ${s.title} from journey`}
                            onClick={() => openEdit(person, s.id)}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`att-badge ${person.score >= 75 ? "" : "navy"}`}
                      >
                        {person.score}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="att-empty">
              {people.length
                ? "No participants match these filters."
                : "No participant profiles yet. Registered participants will appear here."}
            </div>
          )}
        </div>
        <div className="att-table-note">
          Showing {filtered.length} of {people.length} participants. Export
          includes the whole roster for the selected day, regardless of filters.
          <br />
          Green = verified present · Coral = absent · Gold = pending · Gray =
          not recorded. Pending and unrecorded sessions earn no credit.
        </div>
      </section>
      <div className="att-bottom-grid">
        <section className="att-panel">
          <div className="att-eyebrow">Your register, ready to share</div>
          <h2 className="att-panel-title">Attendance reports</h2>
          <p className="att-panel-subtitle">Export the full attendance journey, download the selected day, or print a summary.</p>
          <div className="att-cert-actions">
            <button
              className="att-button secondary"
              disabled={busy}
              onClick={() => exportFile(true)}
            >
              Full Excel report
            </button>
            <button
              className="att-button secondary"
              disabled={busy}
              onClick={() => exportFile(false, true)}
            >
              Day CSV
            </button>
            <button
              className="att-button secondary"
              onClick={() => window.print()}
            >
              Print summary
            </button>
          </div>
        </section>
        <section className="att-panel">
          <div className="att-eyebrow">A clear record of changes</div>
          <h2 className="att-panel-title">Recent activity</h2>
          <ul className="att-audit">
            {data.recent.length ? (
              data.recent.map((entry) => (
                <li key={entry._id}>
                  <strong>
                    {entry.action}
                    {entry.sessionId
                      ? ` · ${sessionDate(entry.sessionId)}`
                      : ""}
                  </strong>
                  <span>
                    {entry.participantName ? `${entry.participantName} · ` : ""}
                    {entry.actorName} ·{" "}
                    {new Date(entry.createdAt).toLocaleString("en-GB", {
                      timeZone: "Asia/Yangon",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    MMT
                    {entry.before ? ` · ${entry.before} → ${entry.after}` : ""}
                    <br />
                    {entry.reason}
                  </span>
                </li>
              ))
            ) : (
              <li>No changes yet. Imports and edits will appear here.</li>
            )}
          </ul>
        </section>
      </div>
      {edit && (
        <Modal title="Update attendance" onClose={() => !busy && setEdit(null)}>
          <div className="att-person">
            <span className="att-avatar">
              {edit.person.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{edit.person.name}</strong>
              <small>
                {
                  ATTENDANCE_SESSIONS.find((s) => s.id === edit.sessionId)
                    ?.title
                }{" "}
                · {sessionDate(edit.sessionId)}
              </small>
            </div>
          </div>
          <label className="att-form-label" htmlFor="attendance-status">
            Attendance status
          </label>
          <select
            id="attendance-status"
            className="att-form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="att-form-label" htmlFor="attendance-reason">
            Reason for this change
          </label>
          <textarea
            id="attendance-reason"
            className="att-form-control"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Confirmed against the mentor’s stand-up record"
          />
          <p className="att-panel-subtitle">
            Your name, time, and reason are saved in the audit trail. This edit
            updates progress and certificate eligibility automatically.
          </p>
          {message?.error && (
            <p className="att-notice error" role="alert">
              {message.text}
            </p>
          )}
          <div className="att-form-actions">
            <button
              className="att-button secondary"
              disabled={busy}
              onClick={() => setEdit(null)}
            >
              Cancel
            </button>
            <button
              className="att-button"
              disabled={busy || !note.trim()}
              onClick={save}
            >
              {busy ? "Saving…" : "Save attendance"}
            </button>
          </div>
        </Modal>
      )}
      {importOpen && (
        <Modal
          title={`Import attendance · ${sessionDate(sessionId)}`}
          onClose={() => !busy && setImportOpen(false)}
          wide
        >
          <p className="att-panel-subtitle">
            Export this day’s spreadsheet first, update the Status column, then
            upload it here. Matching participant records will be overwritten.
            Omitted participants stay unchanged.
          </p>
          <div style={{ margin: "18px 0" }}>
            <label className="att-file">
              <Icon name="upload" size={25} />
              <strong style={{ display: "block", marginTop: 8 }}>
                {busy ? "Reading and validating…" : "Choose an attendance file"}
              </strong>
              <span>Excel .xlsx / .xls or CSV · up to 500 rows · 5 MB</span>
              <input
                ref={fileRef}
                aria-label="Attendance file"
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={busy}
                onChange={(e) => readFile(e.target.files?.[0])}
                style={{
                  display: "block",
                  margin: "14px auto 0",
                  maxWidth: "100%",
                }}
              />
            </label>
          </div>
          <p className="att-panel-subtitle">
            Columns: Participant ID (or Email), Session Date (YYYY-MM-DD),
            Status, Note. Status must be present, absent, pending, or
            unrecorded. “Present” means verified attendance.
          </p>
          {importError && (
            <p className="att-notice error" role="alert">
              {importError}
            </p>
          )}
          {preview && (
            <>
              <div
                className={`att-notice ${preview.result.errors.length ? "error" : "success"}`}
                style={{ marginTop: 16 }}
              >
                <span>
                  <strong>{preview.filename}</strong>
                  <br />
                  {preview.result.rows.length} valid rows ·{" "}
                  {preview.result.errors.length} errors.{" "}
                  {preview.result.errors.length
                    ? "Fix all errors before importing. No records have changed."
                    : "Review the changes below, then confirm the overwrite."}
                </span>
              </div>
              {preview.result.errors.length > 0 && (
                <ul className="att-import-errors">
                  {preview.result.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
              <div className="att-preview-table">
                <table className="att-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Current</th>
                      <th>Imported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.result.rows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.name}</td>
                        <td>{STATUS_LABELS[row.before]}</td>
                        <td>{STATUS_LABELS[row.after]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="att-form-actions">
            <button
              className="att-button secondary"
              disabled={busy}
              onClick={() => setImportOpen(false)}
            >
              Cancel
            </button>
            <button
              className="att-button"
              disabled={busy || !preview || !!preview.result.errors.length}
              onClick={confirmImport}
            >
              {busy
                ? "Processing…"
                : `Confirm overwrite${preview ? ` · ${preview.result.rows.length} rows` : ""}`}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}
