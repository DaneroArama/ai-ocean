export type RosterRole = "participant" | "admin";

export type RosterRow = {
  email: string;
  name: string;
  role: RosterRole;
  team: string;
  position: string;
  row: number;
};

export const ROSTER_MAX_ROWS = 2000;
export const ROSTER_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeRosterEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

const ROLE_ALIASES: Record<string, RosterRole> = {
  "": "participant",
  participant: "participant",
  attendee: "participant",
  member: "participant",
  admin: "admin",
  administrator: "admin",
};

export function parseRosterRows(
  rows: Record<string, unknown>[],
  hasMore: boolean,
): RosterRow[] {
  if (!rows.length) throw new Error("The spreadsheet has no data rows.");
  if (rows.length > ROSTER_MAX_ROWS || hasMore)
    throw new Error(`Import up to ${ROSTER_MAX_ROWS} people per file.`);
  const headers = Object.keys(rows[0]);
  if (!headers.includes("Email") || !headers.includes("Name"))
    throw new Error(
      "Email and Name columns are required. Use the exported template.",
    );
  const seen = new Set<string>();
  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const email = normalizeRosterEmail(row.Email);
    if (!EMAIL_PATTERN.test(email))
      throw new Error(`Row ${rowNumber}: enter a valid email address.`);
    if (seen.has(email))
      throw new Error(`Row ${rowNumber}: duplicate email ${email}.`);
    seen.add(email);
    const name = String(row.Name ?? "").trim();
    if (!name)
      throw new Error(`Row ${rowNumber}: name is required.`);
    if (name.length > 200)
      throw new Error(`Row ${rowNumber}: name is too long.`);
    const roleRaw = String(row.Role ?? "").trim().toLowerCase();
    const role = ROLE_ALIASES[roleRaw];
    if (!role)
      throw new Error(
        `Row ${rowNumber}: Role must be participant or admin.`,
      );
    const team = String(row.Team ?? "").trim();
    if (team.length > 200)
      throw new Error(`Row ${rowNumber}: team name is too long.`);
    const position = String(row.Position ?? "").trim();
    if (position.length > 200)
      throw new Error(`Row ${rowNumber}: position is too long.`);
    return { email, name, role, team, position, row: rowNumber };
  });
}

export async function readRosterFile(file: File): Promise<RosterRow[]> {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name))
    throw new Error("Choose an Excel (.xlsx or .xls) or CSV file.");
  if (file.size > ROSTER_MAX_FILE_BYTES)
    throw new Error("Files must be smaller than 5 MB.");
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: false,
    sheetRows: ROSTER_MAX_ROWS + 2,
  });
  const sheet =
    workbook.Sheets["Roster"] || workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The workbook has no roster sheet.");
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  return parseRosterRows(rows, !!sheet["!fullref"]);
}

export async function exportRosterTemplate() {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(
    [
      {
        Email: "alex@example.com",
        Name: "Alex Min",
        Role: "participant",
        Team: "Ocean Explorers",
        Position: "Frontend Developer",
      },
      {
        Email: "admin@example.com",
        Name: "Event Admin",
        Role: "admin",
        Team: "",
        Position: "",
      },
    ],
    { header: ["Email", "Name", "Role", "Team", "Position"] },
  );
  sheet["!cols"] = [34, 28, 14, 25, 28].map((wch) => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Roster");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ["AI Ocean roster import instructions"],
      ["One row per invited person. Email and Name are required."],
      ["Role", "participant (default) or admin"],
      ["Admins sign in with Google only; participants may activate with the shared password."],
      ["Team", "Existing team name or code. Leave blank to import without a team."],
      ["Position", "Optional, e.g. Frontend Developer"],
      ["Import upserts by email: new emails are created, existing ones are updated."],
      ["People missing from the file are never removed."],
      [`Maximum ${ROSTER_MAX_ROWS} rows / 5 MB per file.`],
      ["Only people on this roster can sign in to the event platform."],
    ]),
    "Instructions",
  );
  XLSX.writeFile(workbook, "AI-Ocean-Roster-Template.xlsx", {
    bookType: "xlsx",
  });
}
