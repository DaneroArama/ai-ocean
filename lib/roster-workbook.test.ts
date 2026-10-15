import { describe, expect, it } from "vitest";
import { normalizeRosterEmail, parseRosterRows } from "./roster-workbook";

function row(values: Record<string, unknown>) {
  return { Email: "", Name: "", Role: "", Team: "", Position: "", ...values };
}

describe("roster spreadsheet parsing", () => {
  it("normalizes emails and defaults missing roles to participant", () => {
    expect(normalizeRosterEmail("  Alex@Example.COM ")).toBe(
      "alex@example.com",
    );
    const rows = parseRosterRows(
      [
        row({ Email: "Alex@Example.com", Name: "Alex Min" }),
        row({
          Email: "admin@example.com",
          Name: "Event Admin",
          Role: "Administrator",
        }),
        row({ Email: "moe@example.com", Name: "Moe", Role: "attendee" }),
      ],
      false,
    );
    expect(rows).toEqual([
      {
        email: "alex@example.com",
        name: "Alex Min",
        role: "participant",
        team: "",
        position: "",
        row: 2,
      },
      {
        email: "admin@example.com",
        name: "Event Admin",
        role: "admin",
        team: "",
        position: "",
        row: 3,
      },
      {
        email: "moe@example.com",
        name: "Moe",
        role: "participant",
        team: "",
        position: "",
        row: 4,
      },
    ]);
  });
  it("rejects invalid emails, duplicates, blank names, and roles", () => {
    expect(() =>
      parseRosterRows([row({ Email: "not-an-email", Name: "X" })], false),
    ).toThrow(/valid email/);
    expect(() =>
      parseRosterRows(
        [
          row({ Email: "a@example.com", Name: "A" }),
          row({ Email: "A@example.com", Name: "B" }),
        ],
        false,
      ),
    ).toThrow(/duplicate email/);
    expect(() =>
      parseRosterRows([row({ Email: "a@example.com", Name: "  " })], false),
    ).toThrow(/name is required/);
    expect(() =>
      parseRosterRows(
        [row({ Email: "a@example.com", Name: "A", Role: "owner" })],
        false,
      ),
    ).toThrow(/Role must be/);
  });
  it("enforces required headers and the row cap", () => {
    expect(() => parseRosterRows([{ Name: "A" }], false)).toThrow(
      /Email and Name/,
    );
    const big = Array.from({ length: 2001 }, (_, i) =>
      row({ Email: `p${i}@example.com`, Name: `P${i}` }),
    );
    expect(() => parseRosterRows(big, false)).toThrow(/2000 people/);
    expect(() =>
      parseRosterRows(
        [row({ Email: "a@example.com", Name: "A" })],
        true,
      ),
    ).toThrow(/2000 people/);
  });
});
