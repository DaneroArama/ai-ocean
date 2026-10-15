import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { readAttendanceFile } from "./attendance-workbook";
const row = {
  "Participant ID": "participant-123",
  Email: "demo@example.com",
  "Session Date": "2026-10-17",
  Status: "present",
  Note: "Mentor verified",
};
function file(rows: Record<string, unknown>[], format: "xlsx" | "xls" | "csv") {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    "Attendance",
  );
  return new File(
    [
      XLSX.write(workbook, {
        type: "array",
        bookType: format === "xls" ? "biff8" : format,
      }),
    ],
    `attendance.${format}`,
  );
}
describe("attendance spreadsheet import", () => {
  for (const format of ["xlsx", "xls", "csv"] as const)
    it(`reads a genuine ${format} workbook`, async () => {
      expect(
        await readAttendanceFile(file([row], format), "2026-10-17"),
      ).toEqual([
        {
          participantId: "participant-123",
          email: "demo@example.com",
          sessionId: "2026-10-17",
          status: "present",
          note: "Mentor verified",
          row: 2,
        },
      ]);
    });
  it("rejects wrong dates, blank status, missing headers, and oversized rosters", async () => {
    await expect(
      readAttendanceFile(
        file([{ ...row, "Session Date": "2026-10-18" }], "xlsx"),
        "2026-10-17",
      ),
    ).rejects.toThrow("Session Date");
    await expect(
      readAttendanceFile(file([{ ...row, Status: "" }], "xlsx"), "2026-10-17"),
    ).rejects.toThrow("Blank statuses");
    await expect(
      readAttendanceFile(file([{ Name: "Only a name" }], "xlsx"), "2026-10-17"),
    ).rejects.toThrow("columns are required");
    await expect(
      readAttendanceFile(
        file(
          Array.from({ length: 501 }, () => row),
          "xlsx",
        ),
        "2026-10-17",
      ),
    ).rejects.toThrow("1–500");
  });
});
