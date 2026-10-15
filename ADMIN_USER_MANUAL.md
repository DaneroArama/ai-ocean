# Admin User Manual — Attendance & Certificates

AI Ocean Buildathon 2026 · For event administrators

This manual explains how to run the daily attendance register and how certificate eligibility is calculated. It covers everything an admin does in the portal — no technical knowledge required.

---

## 1. Getting access

1. Go to the site and sign in with your account.
2. Your account must have the **admin** role. Admins are granted access by another admin (self-promotion is disabled).
3. Open the admin area. You will see the admin navigation bar with **Overview**, **Attendance**, **Teams**, **Registrations**, **Questions**, and **Roles**.
4. Select **Attendance** (also reachable from **Quick actions → Attendance & Certificate Release** on the Overview page).

If you land on the admin area and see an access message, your role has not been granted yet — ask an existing admin to promote you under **Roles**.

> **Local workspace notice.** If a banner reads *“Local workspace. These records live on the isolated local backend.”*, you are working in a development environment, not the production event data. Do not treat those records as final.

---

## 2. The admin dashboard at a glance

Opening **Attendance** shows four live statistics across the top:

| Statistic | Meaning |
|---|---|
| **PARTICIPANTS** | Total participant profiles with attendance records. |
| **VERIFIED ON \<date\>** | How many are marked *Verified present* for the day you currently have selected, out of the whole roster. |
| **75% MILESTONE REACHED** | How many participants have already earned at least 75% verified attendance. |
| **CERTIFICATE STATUS** | `Scheduled` (downloads not open yet), `Open` (downloads active), or `Closed` (window ended). |

Beneath the statistics are three working areas:

1. **The daily attendance register** — the main table.
2. **Attendance reports** — export and print buttons.
3. **Recent activity** — the audit trail of every change.

All numbers update automatically and immediately after you or another admin saves a change. There is no “refresh” or “publish” step.

---

## 3. The nine sessions and their weights

The event has nine fixed sessions. Each carries a weight toward the 100% total:

| Session | Date | Weight |
|---|---|---|
| Training day 1 | 17 Oct 2026 | 25% |
| Training day 2 | 18 Oct 2026 | 25% |
| Product building day 1 | 19 Oct 2026 | 7% |
| Product building day 2 | 20 Oct 2026 | 7% |
| Product building day 3 | 21 Oct 2026 | 7% |
| Product building day 4 | 22 Oct 2026 | 7% |
| Product building day 5 | 23 Oct 2026 | 7% |
| Exclusive judge panel | 25 Oct 2026 | 10% |
| Closing ceremony | 1 Nov 2026 | 5% |

**Rules that never change:**

- Only **Verified present** earns credit. *Absent*, *Pending verification*, and *Not yet recorded* all earn **0%**.
- A session can only be credited **once** per participant — re-recording overwrites, never adds.
- Online and in-person attendance count equally.
- Sessions cannot be recorded before their day has begun (local development workspaces are exempt).

---

## 4. Choosing a day

At the top of the register is a row of nine day buttons (e.g. **Training 01 · 17 Oct · 25%**). Click one to load that day. Selecting a day resets the status filter and changes which column the main status button edits.

The **9-session journey** column always shows all nine days, regardless of which day is selected.

---

## 5. Finding a participant

Use the toolbar directly above the table:

- **Search box** — type a name, email, or team name. Matching is instant.
- **Status dropdown** — narrow the list to one status: *All statuses*, *Verified present*, *Absent*, *Pending verification*, or *Not yet recorded*.

The footer tells you *“Showing X of Y participants.”* Search and filters affect **only what you see on screen** — exports still include the whole roster for the selected day.

### Reading a row

| Column | What it shows |
|---|---|
| **Participant** | Name and email (or *No email on file*). |
| **Team** | Team name, or *Unassigned*. |
| **\<date\> · weight%** | Status for the selected day. Click it to edit. |
| **9-session journey** | Nine small squares — one per session. Hover a square for its full status; click it to edit that session directly. |
| **Progress** | Current weighted total. A gold badge means 75% or more. |

**Colour key:** green = verified present · coral = absent · gold = pending · gray = not recorded.

---

## 6. Editing a single record

1. Click the status button in the day column, or click a square in the journey column.
2. The **Update attendance** dialog opens showing the participant, session, and date.
3. Choose the new **Attendance status**.
4. Type a **Reason for this change** (required, 1–500 characters). Example: *“Confirmed against the mentor’s stand-up record.”*
5. Click **Save attendance**.

Your name, the time, the reason, and the old → new status are written to the audit trail. Progress and certificate eligibility recalculate instantly for that participant.

**If you see “This record changed. Close the editor and try again with the latest version.”** — someone else edited the same record while your dialog was open. Close it, read the updated value, and redo the change.

**If Save is greyed out** — the reason field is empty. A reason is always mandatory.

---

## 7. Importing a spreadsheet

Use this for bulk updates instead of clicking through the table.

### Step 1 — Export the day

Click **Export day .xlsx**. This downloads a file named `AI-Ocean-Attendance-YYYY-MM-DD.xlsx` containing the **entire roster for the selected day**, ignoring any search or filter.

The file has three sheets:

- **Attendance** — one row per participant with the columns `Participant ID`, `Name`, `Email`, `Team`, `Session Date`, `Status`, `Note`.
- **Instructions** — a reminder of the rules and the certificate threshold.
- **Summary** (full report only) — per-participant totals and whether the 75% threshold is met.

### Step 2 — Edit it

Change only the **Status** column (and optionally **Note**):

| Allowed value | Meaning |
|---|---|
| `present` | Verified attendance — earns credit. |
| `absent` | Not attended — no credit. |
| `pending` | Not yet verified — no credit. |
| `unrecorded` | Nothing recorded — no credit. |

Accepted shortcuts include `verified present`, `pending verification`, and `not yet recorded`. **Blank statuses are rejected.** Leave `Participant ID` and `Session Date` (`YYYY-MM-DD`) exactly as exported. If you supply both an ID and an email, they must match.

### Step 3 — Import

1. Click **Import attendance**.
2. Choose the file — `.xlsx`, `.xls`, or `.csv`, up to **500 rows** and **5 MB**.
3. The system reads and validates it, then shows a preview: **valid rows**, **errors**, and a Participant / Current / Imported comparison table.
4. If there are errors, fix the file and upload again — **nothing has been changed yet**, and the import button stays disabled.
5. If the preview looks right, click **Confirm overwrite · N rows**.

### What the import does

- Matching **participant + session** rows are overwritten in one batch.
- Participants you left out, and every other session, remain untouched.
- A success message reports how many records were imported for that date.

### Errors that block the entire import

- Unknown participant ID or unregistered email
- Email does not match the supplied participant ID
- Session Date is not the date of the day you selected
- The same participant appears twice in the file
- Blank or invalid status, or a note longer than 500 characters

### “Attendance changed after the preview”

Every import is tied to a revision counter. If anyone saves an edit or completes another import between your preview and your confirm, you must **upload and preview the file again**. This prevents an old preview from silently overwriting newer data.

---

## 8. Reports and printing

In the **Attendance reports** panel:

| Button | Output |
|---|---|
| **Export day .xlsx** | Selected day, whole roster. Best for editing and re-importing. |
| **Full Excel report** | All nine sessions plus a **Summary** sheet. For reporting — do not re-import this file as a single day. |
| **Day CSV** | Selected day as `.csv`. Text fields beginning with `=`, `+`, `-`, or `@` are prefixed with an apostrophe so spreadsheets do not treat them as formulas. |
| **Print summary** | Opens your browser’s print dialog for a paper/PDF copy of the page. |

---

## 9. Recent activity (audit trail)

The **Recent activity** panel lists the last 30 changes, newest first. Each entry shows:

- Action — *Manual edit* or *Excel import*
- Session date
- Participant name (when applicable)
- Who made the change and when (Myanmar time)
- Old status → new status
- The reason, or the filename plus any note for imports

Use it to answer “who changed this and why?” Nothing in the register changes without an entry here. If the panel shows *“No changes yet”*, no edits or imports have been made.

---

## 10. Certificates — what admins need to know

Admins do **not** issue or approve certificates manually. The system handles it.

- **Threshold:** at least **75%** verified attendance (exactly 75% qualifies).
- **Release:** downloads open automatically on **2 November 2026, 00:00 Myanmar time** — after the entire closing day has finished. No admin action is required, and none exists.
- **Expiry:** the window closes one calendar month later, **2 December 2026, 00:00 Myanmar time**.
- **Re-checking:** eligibility is calculated from current records on every download, so correcting a participant’s attendance immediately changes whether they can download.
- **No recall:** once a participant has downloaded a file, it cannot be taken back.
- **Pending / unrecorded sessions** never block other participants — they only keep that participant below the threshold.

Watch the **CERTIFICATE STATUS** statistic to see whether the window is `Scheduled`, `Open`, or `Closed`, and the **75% MILESTONE REACHED** count to see how many people currently qualify.

**Your responsibilities:** record attendance promptly and fairly, keep reasons in the audit trail accurate, and correct mistakes as soon as they are reported — corrections take effect immediately.

---

## 11. Roles and privacy

- Everything on the attendance page — viewing, editing, importing — requires the **admin** role.
- Participants see **only their own** history on their dashboard.
- The public tracker at `/attendance` exposes only a participant identifier, name, team, and percentage. Emails, notes, audit entries, and per-session detail are never public.
- Promoting someone to admin requires an existing admin; you cannot promote yourself.

---

## 12. Limits

| Limit | Value |
|---|---|
| Participants in the register | 2,000 maximum |
| Rows per import | 1–500 |
| File size per import | 5 MB |
| Note / reason length | 500 characters |
| Search term length | 2–100 characters |

Exceeding the participant limit shows: *“This event roster exceeds the 2,000-participant limit. Contact the platform team.”*

---

## 13. Troubleshooting

| You see… | What to do |
|---|---|
| *Please sign in.* | Sign in again, then reload the page. |
| *Admin required to promote participants.* | Only an existing admin can grant roles. |
| *Add a correction reason (1–500 characters).* | Fill in the reason field. |
| *This record changed. Close the editor and try again…* | Close the dialog, re-read the row, redo the edit. |
| *Attendance changed after the preview. Preview the file again before importing.* | Re-upload and re-preview your file, then confirm. |
| *Row N: unknown participant ID or registered email.* | Participant isn’t registered, or the ID/email is mistyped. |
| *Row N: email does not match the participant ID.* | Make them consistent, or delete the email cell. |
| *Row N: session date must be YYYY-MM-DD.* | Export the correct day’s file; don’t change Session Date. |
| *Row N: duplicate participant for this session.* | Remove the extra row. |
| *Row N: use present, absent, pending, or unrecorded.* | Replace the blank or free-text status. |
| *Import between 1 and 500 rows at a time.* | Split the file. |
| *Attendance can only be recorded once the session day begins.* | Wait for the day to start (local workspaces are exempt). |
| *No participants match these filters.* | Clear the search box or change the status filter. |
| *Certificate unavailable…* (a participant reports this) | Check their progress: below 75%, or outside 2 Nov – 2 Dec 2026. |

Notifications appear at the top of the page — green for success, red for errors. Dismiss them with the **×** button.

---

## 14. Recommended daily routine

1. Open **Attendance** and select today’s session.
2. At day’s end, click **Export day .xlsx**.
3. Mark statuses in the spreadsheet; add notes for anything unusual.
4. **Import attendance** → review the preview → **Confirm overwrite**.
5. Glance at **Recent activity** to confirm the import logged correctly.
6. Check the **75% MILESTONE REACHED** count and follow up on anyone close to the threshold.

---

## 15. Quick reference

| Task | Where |
|---|---|
| Open the register | Admin → **Attendance** |
| Switch day | Day buttons above the table |
| Search / filter | Toolbar above the table |
| Edit one record | Click the status button or a journey square |
| Bulk update | **Export day .xlsx** → edit → **Import attendance** |
| Full report | **Full Excel report** |
| Printable copy | **Print summary** |
| See who changed what | **Recent activity** |
| Public results page | **Public tracker** link (top right of the register) |
| Certificate rules | Section 10 of this manual |

*Related documents: `ATTENDANCE.md` (technical overview), `docs/AUTH_SETUP.md` (sign-in setup).*
