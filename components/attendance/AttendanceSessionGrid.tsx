import {
  ATTENDANCE_SESSIONS,
  STATUS_LABELS,
  sessionDate,
  type AttendanceStatus,
} from "@/lib/attendance";
import { Icon } from "./ui";

export function AttendanceSessionGrid({
  records,
}: {
  records: { sessionId: string; status: AttendanceStatus }[];
}) {
  return (
    <div className="att-sessions">
      {ATTENDANCE_SESSIONS.map((session) => {
        const status =
          records.find((record) => record.sessionId === session.id)?.status ||
          "unrecorded";
        const icon =
          status === "present"
            ? "check"
            : status === "absent"
              ? "close"
              : status === "pending"
                ? "clock"
                : "calendar";
        return (
          <article
            className={`att-session ${status}`}
            key={session.id}
            aria-label={`${sessionDate(session.id)}: ${STATUS_LABELS[status]}`}
          >
            <div className="att-session-top">
              <span>
                {sessionDate(session.id)} · {session.group}
              </span>
              <strong>{session.weight}% weight</strong>
            </div>
            <h3>{session.title}</h3>
            <div className={`att-status-banner ${status}`}>
              <Icon name={icon} size={19} />
              <strong>{STATUS_LABELS[status]}</strong>
            </div>
            <p className="att-session-credit">
              {status === "present" ? (
                <>
                  <strong>+{session.weight}%</strong> attendance earned
                </>
              ) : status === "pending" ? (
                "Credit awaits verification"
              ) : status === "absent" ? (
                "0% attendance earned"
              ) : (
                "Awaiting attendance record"
              )}
            </p>
          </article>
        );
      })}
    </div>
  );
}
