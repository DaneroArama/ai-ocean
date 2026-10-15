import { describe, expect, it } from "vitest";
import {
  ATTENDANCE_SESSIONS,
  CERTIFICATE_AVAILABLE_AT,
  CERTIFICATE_EXPIRES_AT,
  attendanceScore,
  certificateExpiry,
  certificateState,
} from "./attendance";
describe("weighted attendance and certificate gates", () => {
  it("totals 100 and only credits verified sessions once", () => {
    expect(ATTENDANCE_SESSIONS.reduce((sum, s) => sum + s.weight, 0)).toBe(100);
    expect(
      attendanceScore([
        { sessionId: "2026-10-17", status: "present" },
        { sessionId: "2026-10-17", status: "present" },
        { sessionId: "2026-10-18", status: "pending" },
        { sessionId: "unknown", status: "present" },
      ]),
    ).toBe(25);
    expect(
      attendanceScore(
        ATTENDANCE_SESSIONS.map((s) => ({
          sessionId: s.id,
          status: "present",
        })),
      ),
    ).toBe(100);
  });
  it("automatically opens at midnight Myanmar time and enforces 75% and expiry", () => {
    expect(certificateState(74, CERTIFICATE_AVAILABLE_AT)).toBe("ineligible");
    expect(certificateState(75, CERTIFICATE_AVAILABLE_AT - 1)).toBe("scheduled");
    expect(certificateState(75, CERTIFICATE_AVAILABLE_AT)).toBe("available");
    expect(certificateState(75, CERTIFICATE_EXPIRES_AT - 1)).toBe("available");
    expect(certificateState(75, CERTIFICATE_EXPIRES_AT)).toBe("expired");
    expect(certificateState(74, CERTIFICATE_AVAILABLE_AT + 1)).toBe("ineligible");
    expect(new Date(CERTIFICATE_AVAILABLE_AT).toISOString()).toBe("2026-11-01T17:30:00.000Z");
  });
  it("expires after one calendar month and clamps month-end dates", () => {
    expect(
      new Date(
        certificateExpiry(Date.parse("2026-11-02T00:00:00+06:30")),
      ).toISOString(),
    ).toBe("2026-12-01T17:30:00.000Z");
    expect(
      new Date(
        certificateExpiry(Date.parse("2027-01-31T23:00:00+06:30")),
      ).toISOString(),
    ).toBe("2027-02-28T16:30:00.000Z");
  });
});
