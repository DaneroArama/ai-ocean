# Attendance and certificates

The implementation is running against the isolated local backend. No production deployment, migration, import, or seed has been run.

## Try it locally

### Private demo available in production mode

Open `/certificate-demo` directly. Email: `certificate.demo@aiocean.test`. Password: `OceanCertificate!2026`. This page is not linked from public navigation and is marked noindex. The identity is defined only in server code; it creates no database users, participants, registrations, attendance, or certificate-issue records. Its separate signed HttpOnly cookie expires after two hours and does not authenticate normal participant or admin requests. Downloads always use the fixed sample name and a PRIVATE DEMO watermark. This route works in both development and production builds, independently of the actual event's release dates. No Convex deployment or seed is needed for this account.

Run `node scripts/test-private-certificate-demo.mjs` to verify the private sign-in, PDF, role isolation, sign-out, tampered-session rejection, and absence of participant/attendance database writes. Add a base URL argument to test a locally running production build.

### Local database fixtures

- Admin: `/admin/attendance`, email `demo.admin@example.com`, password `OceanAdmin!2026`.
- Participant: `/dashboard/attendance`, email `demo.participant@example.com`, password `OceanDemo!2026`.
- Certificate celebration: `/dashboard/attendance/demo`, signed in as the demo participant.
- Public tracker and English completion rules: `/attendance`.
- Certificate previews are not exposed in participant or public navigation.

Use separate browser profiles or an incognito window to try admin and participant accounts together. The demo participant has 85% attendance. The sample roster includes 75%, 64%, and unrecorded cases. Only the demo admin and primary demo participant have password accounts.

The demo bypasses the event date and release gates only when both the Next.js development server and the local Convex backend are in use, and the local demo seed has enabled it. The 75% rule still applies. Demo PDFs are watermarked; normal certificate downloads stay locked.

The certificate celebration runs for 8.5 seconds with a medal reveal, the participant's name, and all five existing mascots, then automatically downloads the certificate. Participants can skip straight to the download or close the celebration at any point. Reduced-motion preferences skip the animation. Dashboard attendance shares the existing Dashboard header, welcome text, and sign-out action, and all attendance pages use the platform's ocean-blue color tokens.

If services stop, run `npm run dev:backend` and `npm run dev -- --webpack` in separate terminals. The backend starter uses the official Convex binary already installed in the local cache. On a new machine, install/configure a local Convex backend first. To sync functions and add sample attendance, use `npm run seed:attendance:local`. This command refuses cloud deployments. The seed preserves existing edits.

## Attendance rules

The nine immutable 2026 sessions are defined in `lib/attendance.ts`: training days on October 17–18 (25% each), five building days on October 19–23 (7% each), judge panel on October 25 (10%), and closing on November 1 (5%). Only `present` means verified attendance and contributes credit. `pending`, `absent`, and `unrecorded` contribute zero. Each participant/session can be credited only once. Online and in-person attendance have equal weight.

Public results expose only a participant identifier, name, team, and percentage. Emails, notes, administrative audit records, and per-session details are not returned by the public API. The participant dashboard reads the authenticated participant's own history. Admin queries and all writes require an admin role. The existing self-promotion helper has been restricted to existing admins.

## Spreadsheet workflow

1. Select a day in the admin register and choose **Export day .xlsx**. This exports the whole roster regardless of table filters.
2. Edit **Status** using `present`, `absent`, `pending`, or `unrecorded`. Optional **Note** explains the record. Preserve **Participant ID** and **Session Date** (`YYYY-MM-DD`). An email may identify a participant if no ID is supplied; if both are supplied they must match.
3. Import `.xlsx`, `.xls`, or `.csv` (up to 5 MB and 500 rows). Review the server-validated preview and confirm the overwrite.
4. Matching participant/session rows are overwritten atomically; omitted participants and all other sessions remain unchanged. Unknown IDs, conflicting emails, duplicate rows, blank statuses, wrong dates, and invalid notes block the entire import. Changes after a preview require a fresh preview.

Manual changes require a reason and reject stale edits. Successful imports and edits update progress reactively and record the admin, participant, session, old/new status, time, and reason. Day CSV, full Excel reports, and a printable summary are available. CSV exports neutralize spreadsheet formula prefixes in text fields.

## Release policy

At least **75%** verified attendance is required, including exactly 75%. Downloads cannot open before **November 2, 2026 at 00:00 Asia/Yangon** (November 1 at 17:30 UTC), interpreting “after November 1” as after the entire closing day.

Downloads open automatically at that time, with no manual finalization or release action. The download window closes on **December 2, 2026 at 00:00 Myanmar time**, one calendar month later. Eligibility is checked from current verified records on every download; attendance corrections take effect immediately. Pending or missing sessions earn no credit but do not block other eligible participants. Already downloaded files cannot be recalled.

`/api/certificate` authenticates the request, checks current eligibility through a backend mutation, and uses the server-resolved participant name. Request parameters cannot choose another participant or change the name or score. Personalized responses are never cached. The PDF template is intentionally a dummy design, with embedded Latin and Myanmar fonts and a stable certificate identifier. Replace the design and signature placeholders with approved artwork before official use.

## Validation

`npm run test:attendance` checks weighted calculations, threshold/date/expiry boundaries, and PDF generation for Myanmar, Latin, and mixed names. `npm run test:attendance:local` exercises authorization, public privacy, overwrite/recalculation, duplicate/identifier validation, stale edits/imports, and release locks against the local backend. `npm run test:attendance:ui` runs an isolated headless Edge browser through Excel round-trips, editing, desktop/mobile layouts, PDF download, and the mascot celebration. Integration tests write only local demo data. Browser/PDF QA files live in Git-ignored `.convex/qa/`.

The current event register supports up to 2,000 participants and 500 rows per import. Larger events require server pagination and import batching before rollout.
