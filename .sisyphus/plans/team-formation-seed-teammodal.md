# Team Formation Admin + Teams.md Seed + TeamModal DB Connection

## Context

- `TeamModal.tsx` currently hardcodes 3 teams in `TEAM_DATA`; Teams.md has **11 teams (AI01–AI11), 66 members** with names, positions, emails.
- Admin teams page (`app/admin/teams/page.tsx`) exists but only supports: create empty team, auto-create from registrations, add *already-registered* participants. **No way to manually add a person (name + position).**
- `convex/teams.ts` has full CRUD but no public read for the modal, no per-member position, no manual member add.
- Deployments (confirmed with user): **staging = `dev:wandering-sturgeon-242`** (.env.local, 6 participants, 0 teams), **prod = `dev:hardy-roadrunner-259`** (.env.prod, matches `--prod`, 1 admin, 0 teams). Both have **0 teams** → no data migration needed.
- User decisions: seed **participants rows only** (no invented passwords); badge = **data-driven `badge` field** seeded with "Recent" on AI01.

## Design

Single source of truth stays `teams.memberIds` (already used everywhere). Positions live on **`participants.position`** (a person is in ≤1 team). Manual members without an account become email-less participant rows → make `participants.email` optional (safe widening; 2 fallback fixes needed).

Public modal query returns **name/position only — never emails**.

## Phases

### Phase 1 — Schema (`convex/schema.ts`)
- `participants.email`: `v.string()` → `v.optional(v.string())` (widening, safe).
- `participants`: add `position: v.optional(v.string())` (comma-joined roles, e.g. "Business Analyst, Product Designer").
- `teams`: add `code: v.optional(v.string())` ("AI01"…), `badge: v.optional(v.string())`; add `.index("by_code", ["code"])` for idempotent seed.

### Phase 2 — Backend (`convex/teams.ts`)
- **`listPublicTeams`** (public `query`, no auth): teams ordered by code, `.take(200)`, returns `{ code, name, badge, members: [{ name, position }] }` — **no emails**.
- **`addManualMember`** (admin mutation): `{ teamId, name, email?, position? }` → upsert participant by `by_email` (or insert email-less), patch `position`, append to `memberIds`, patch their registration `teamId` if one exists.
- **`updateTeamMember`** (admin mutation): `{ participantId, name?, position? }`.
- **`createTeam`**: accept optional `code`, `badge`.
- **`listTeams`**: include `position` in member payloads; bound with `.take(200)` (was `.collect()`).
- **`getMyTeam`**: fallback — if no `registration.teamId`, scan `.take(200)` teams for `memberIds.includes(p._id)` (so seeded/manual members see their team in the dashboard).
- Bound other unbounded `.collect()` calls touched in this file (`listUnassignedParticipants`, `deleteTeam`).

### Phase 3 — Seed (`convex/seedTeams.ts`, new)
- **`internalMutation`** (bulk write must not be publicly callable; CLI can run internal functions with the admin key — verified `participants:updateLastLoginAt` resolves via `convex run`).
- Hardcoded data from Teams.md: 11 teams (code, name, badge="Recent" on AI01) + 66 members (name, email, position from Role(s) column; "—" → no position; AI11's Thaw Linn Htet → first email only).
- Per member: participant upsert by `by_email` → create with `role: "participant"`, `preferredLanguage: "en"`, `position`; append id to team `memberIds`.
- **Idempotent**: team matched by `by_code`, participant by `by_email` — re-runs skip/patch, never duplicate. Returns `{ teamsCreated, teamsSkipped, membersCreated, membersSkipped }`.

### Phase 4 — Admin UI
- `app/admin/layout.tsx`: add **"Teams"** nav link (currently missing from nav!).
- `app/admin/teams/page.tsx`:
  - Per-team **"+ Add member"** inline form: Name*, Position, Email (optional).
  - Member rows show position chip; inline edit (prompt-free small input → `updateTeamMember`).
  - Team header shows `code`; create/edit form gains optional Code + Badge fields.

### Phase 5 — TeamModal (`components/TeamModal.tsx`)
- Replace `TEAM_DATA`/`ALL_TEAMS` with `useQuery(api.teams.listPublicTeams)`.
- Handle `undefined` (loading) with a skeleton/empty state; keep header/CTA/waves always visible.
- Re-run GSAP card animation when data arrives (effect dependency on teams, not mount-only).
- Badge renders from `team.badge`; position pill keeps existing `ROLE_ABBREV` + tooltip logic (`member.position`).

### Phase 6 — Type fixes for optional email
- `convex/guestDrafts.ts:211`: `email: participant.email` → `?? ""`.
- `app/register/main/page.tsx:154`: `email: participant.email` → `?? b.email`.
- Audit remaining `participant.email` usages under tsc (dashboard/admin JSX render undefined fine).

### Phase 7 — Verify + deploy + seed
1. `npx convex codegen`; `npx tsc --noEmit` (ignore/flag pre-existing `app/layout.tsx:137` RootLayoutProps error — not ours); `npx eslint` on touched files.
2. **Staging**: push (`npx convex run --deployment wandering-sturgeon-242 --push ...` or `npx convex dev --once`), then `npx convex run --deployment wandering-sturgeon-242 seedTeams:seed`; verify via `listPublicTeams`.
3. **Prod**: announce deployment target; pushing code = production deploy → **get explicit consent before push**, then `npx convex run --prod --push seedTeams:seed`; verify.

## Files touched
| File | Change |
|---|---|
| `convex/schema.ts` | email optional, participants.position, teams.code/badge + index |
| `convex/teams.ts` | listPublicTeams, addManualMember, updateTeamMember, createTeam args, bounds |
| `convex/seedTeams.ts` | **new** — idempotent Teams.md seed |
| `app/admin/layout.tsx` | Teams nav link |
| `app/admin/teams/page.tsx` | manual member add/edit, position chips, code/badge |
| `components/TeamModal.tsx` | DB-driven via listPublicTeams |
| `convex/guestDrafts.ts`, `app/register/main/page.tsx` | optional-email fallbacks |

## Verification
- `npx tsc --noEmit` clean (except pre-existing layout.tsx error), eslint clean on touched files.
- Staging: `listPublicTeams` returns 11 teams / 66 members with positions; modal renders them; admin can add/edit/remove a manual member; re-running seed = all skipped.
- Prod: same seed counts after consented push.

## Risks
- Prod push is a production deploy (schema + functions) — gated on explicit user consent at execution time.
- Email-less manual members can't auto-link to a future account (acceptable; admin can add their email later via updateTeamMember).
- Pre-existing `tsc` error in `app/layout.tsx` will still print — out of scope unless asked.
