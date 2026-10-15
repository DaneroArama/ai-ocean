import type { AttendanceStatus } from "./attendance";
import { ATTENDANCE_SESSIONS } from "./attendance";
export type WorkbookRow = {
  participantId: string;
  email: string;
  sessionId: string;
  status: AttendanceStatus;
  note: string;
  row: number;
};
export async function readAttendanceFile(
  file: File,
  sessionId: string,
): Promise<WorkbookRow[]> {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name))
    throw new Error("Choose an Excel (.xlsx or .xls) or CSV file.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Files must be smaller than 5 MB.");
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: false,
    sheetRows: 502,
  });
  const sheet =
    workbook.Sheets["Attendance"] || workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The workbook has no attendance sheet.");
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (!rows.length || rows.length > 500 || sheet["!fullref"])
    throw new Error("Import 1–500 participant rows at a time.");
  const headers = Object.keys(rows[0]);
  if (
    !headers.includes("Status") ||
    !headers.includes("Session Date") ||
    (!headers.includes("Participant ID") && !headers.includes("Email"))
  )
    throw new Error(
      "Use the exported template: Session Date, Status, and Participant ID (or Email) columns are required.",
    );
  return rows.map((row, index) => {
    const raw = String(row.Status).trim().toLowerCase();
    const aliases: Record<string, AttendanceStatus> = {
      present: "present",
      "verified present": "present",
      absent: "absent",
      pending: "pending",
      "pending verification": "pending",
      unrecorded: "unrecorded",
      "not yet recorded": "unrecorded",
    };
    if (!aliases[raw])
      throw new Error(
        `Row ${index + 2}: use present, absent, pending, or unrecorded. Blank statuses are not imported.`,
      );
    const date = String(row["Session Date"] || "").trim();
    if (date !== sessionId)
      throw new Error(`Row ${index + 2}: Session Date must be ${sessionId}.`);
    return {
      participantId: String(row["Participant ID"] || "").trim(),
      email: String(row.Email || "").trim(),
      sessionId: date,
      status: aliases[raw],
      note: String(row.Note || "").trim(),
      row: index + 2,
    };
  });
}
type ExportPerson = {
  id: string;
  name: string;
  email: string;
  team: string;
  score: number;
  records: { sessionId: string; status: AttendanceStatus; note: string }[];
};
export async function exportAttendance(
  people: ExportPerson[],
  sessionId: string,
  report = false,
  csv = false,
) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const sessions = report
    ? ATTENDANCE_SESSIONS
    : ATTENDANCE_SESSIONS.filter((s) => s.id === sessionId);
  const rows = people.flatMap((p) =>
    sessions.map((s) => ({
      "Participant ID": p.id,
      Name: p.name,
      Email: p.email,
      Team: p.team,
      "Session Date": s.id,
      Status:
        p.records.find((r) => r.sessionId === s.id)?.status || "unrecorded",
      Note: p.records.find((r) => r.sessionId === s.id)?.note || "",
    })),
  );
  const safeRows = csv
    ? rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            /^[=+\-@\t\r]/.test(value) ? `'${value}` : value,
          ]),
        ),
      )
    : rows;
  const sheet = XLSX.utils.json_to_sheet(safeRows, {
    header: [
      "Participant ID",
      "Name",
      "Email",
      "Team",
      "Session Date",
      "Status",
      "Note",
    ],
  });
  sheet["!cols"] = [34, 28, 35, 25, 16, 18, 50].map((wch) => ({ wch }));
  sheet["!autofilter"] = { ref: sheet["!ref"] || "A1:G1" };
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance");
  if (report) {
    const summary = XLSX.utils.json_to_sheet(
      people.map((p) => ({
        Name: p.name,
        Team: p.team,
        Email: p.email,
        "Verified attendance": p.score / 100,
        "75% threshold met":
          p.score >= 75 ? "Yes" : "No",
      })),
    );
    summary["!cols"] = [28, 25, 35, 22, 36].map((wch) => ({ wch }));
    for (let i = 2; i < people.length + 2; i++)
      if (summary[`D${i}`]) summary[`D${i}`].z = "0%";
    XLSX.utils.book_append_sheet(workbook, summary, "Summary");
  }
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["AI Ocean attendance import instructions"],
      ["Export one session, update Status, then import that session's file."],
      ["Allowed statuses", "present", "absent", "pending", "unrecorded"],
      ["present means attendance has been verified by the event team."],
      ["Participant ID is preferred. Email is checked when supplied."],
      ["Keep Session Date in YYYY-MM-DD format. Do not change identifiers."],
      [
        "Import overwrites matching participant/session rows only. Omitted participants are unchanged.",
      ],
      [
        "Blank status, unknown identifiers, conflicting emails, and duplicates are rejected.",
      ],
      [
        "Maximum 500 rows / 5 MB per import. Full reports are for reporting, not single-day import.",
      ],
      ["Certificate threshold", 0.75],
      ["Downloads open automatically on November 2, 2026 at 00:00 Myanmar time."],
    ]),
    "Instructions",
  );
  const filename = `AI-Ocean-Attendance-${report ? "Full-Report" : sessionId}.${csv ? "csv" : "xlsx"}`;
  XLSX.writeFile(workbook, filename, { bookType: csv ? "csv" : "xlsx" });
}
