export function AttendanceRules() {
  return (
    <section className="att-rules">
      <div className="att-panel">
        <div className="att-panel-heading">
          <h2 className="att-panel-title">A clear path to completion</h2>
        </div>
        <ul>
          <li>Attendance belongs to you individually, not your team.</li>
          <li>
            Training: 25% each day. Building: 7% each day. Judge panel: 10%.
            Closing: 5%.
          </li>
          <li>
            Only verified attendance counts. Online and in-person attendance
            carry equal weight.
          </li>
          <li>
            Earn at least 75%. Downloads open automatically on November 2, 2026
            at 00:00 Myanmar time.
          </li>
          <li>
            Your certificate stays available for one calendar month from
            release.
          </li>
        </ul>
      </div>
      <div className="att-panel">
        <h2 className="att-panel-title">Good to know</h2>
        <details open>
          <summary>Something missing from your record?</summary>
          <p className="att-panel-subtitle">
            Contact the event team with your registered email, name, session
            date, and supporting information. Ask them about the correction
            deadline. Only an authorized admin can correct attendance.
          </p>
        </details>
        <details style={{ marginTop: 17 }}>
          <summary>How your information is used</summary>
          <p className="att-panel-subtitle">
            The public tracker shows names, teams, and attendance percentages.
            Email addresses and contact details stay private. Imports,
            and corrections are recorded for
            review.
          </p>
        </details>
        <details style={{ marginTop: 17 }}>
          <summary>What does “not yet recorded” mean?</summary>
          <p className="att-panel-subtitle">
            A future or missing session is not a confirmed absence. Pending
            records count only once the event team verifies them. Each session
            contributes its weight once.
          </p>
        </details>
      </div>
    </section>
  );
}
