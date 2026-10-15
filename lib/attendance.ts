export const ATTENDANCE_THRESHOLD = 75;
export const EVENT_TIMEZONE = "Asia/Yangon";
// After the whole closing day, November 1, in Myanmar time.
export const CERTIFICATE_AVAILABLE_AT = Date.parse("2026-11-02T00:00:00+06:30");
export const ATTENDANCE_SESSIONS = [
  {
    id: "2026-10-17",
    title: "Training day 1",
    short: "Training 01",
    weight: 25,
    group: "Training",
  },
  {
    id: "2026-10-18",
    title: "Training day 2",
    short: "Training 02",
    weight: 25,
    group: "Training",
  },
  ...[19, 20, 21, 22, 23].map((day, index) => ({
    id: `2026-10-${day}`,
    title: `Product building day ${index + 1}`,
    short: `Build 0${index + 1}`,
    weight: 7,
    group: "Building",
  })),
  {
    id: "2026-10-25",
    title: "Exclusive judge panel",
    short: "Judge panel",
    weight: 10,
    group: "Milestone",
  },
  {
    id: "2026-11-01",
    title: "Closing ceremony",
    short: "Closing",
    weight: 5,
    group: "Milestone",
  },
] as const;
export type AttendanceStatus = "present" | "absent" | "pending" | "unrecorded";
export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Verified present",
  absent: "Absent",
  pending: "Pending verification",
  unrecorded: "Not yet recorded",
};
export function attendanceScore(
  records: { sessionId: string; status: AttendanceStatus }[],
) {
  return ATTENDANCE_SESSIONS.reduce(
    (total, session) =>
      total +
      (records.some(
        (record) =>
          record.sessionId === session.id && record.status === "present",
      )
        ? session.weight
        : 0),
    0,
  );
}
export function certificateExpiry(releasedAt: number) {
  // Calendar month, preserving the release's local Myanmar date/time, clamped at month end.
  const offset = 6.5 * 60 * 60 * 1000;
  const date = new Date(releasedAt + offset);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.getTime() - offset;
}
export const CERTIFICATE_EXPIRES_AT = certificateExpiry(CERTIFICATE_AVAILABLE_AT);
export function certificateState(score: number, now: number) {
  if (score < ATTENDANCE_THRESHOLD) return "ineligible" as const;
  if (now < CERTIFICATE_AVAILABLE_AT) return "scheduled" as const;
  if (now >= CERTIFICATE_EXPIRES_AT) return "expired" as const;
  return "available" as const;
}
export function sessionDate(id: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: EVENT_TIMEZONE,
  }).format(new Date(`${id}T12:00:00+06:30`));
}
export function releaseDate(timestamp: number, includeTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: EVENT_TIMEZONE,
    ...(includeTime
      ? { hour: "2-digit" as const, minute: "2-digit" as const }
      : {}),
  }).format(timestamp);
}
