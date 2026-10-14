# Team Positions: Dedicated Table + Admin Dropdown

## Context
- Admin team member Role/Position is currently a **free-text** input (`newMemberPosition` / `editMemberPosition`) writing to `participants.position` (comma-joined string).
- `buildathonRoles` also exists but powers the role-discovery assessment — **keep it untouched** (per user).
- Positions in Teams.md are often multi-valued (`"Business Analyst, Product Designer"`) → **multi-select** (per user), which stores comma-joined names so **no data migration** and the public modal keeps working unchanged.
- Seeded data already lives in `participants.position` (66 members). New table is additive.

## Design
New lightweight table `teamPositions` as the single source of truth for the dropdown. `participants.position` stays a comma-joined **string of names** (no schema change to `participants`, no backfill). The dropdown reads active positions; saving joins selected names.

Distinct positions from Teams.md (13): Full Stack Developer, Frontend Developer, Backend Developer, Product Designer, Product Owner, Product Manager, Project Manager, Business Analyst, Business Owner, UI Designer, UX Designer, Entrepreneur, QA/Tester.
Plus a few common extras (from buildathonRoles, kept for future use): AI/ML Engineer, Data Analyst, DevOps Engineer, UX Researcher, Marketing, Content Strategist.

## Changes

### 1. `convex/schema.ts` — add table
```ts
teamPositions: defineTable({
  name: v.string(),          // "Full Stack Developer"
  abbrev: v.optional(v.string()), // "FSD" — for public modal pill
  category: v.union(v.literal("engineering"), v.literal("design"),
                    v.literal("product"), v.literal("business"), v.literal("team")),
  priority: v.number(),      // ordering in dropdown
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_active", ["isActive"])
  .index("by_priority", ["priority"])
  .index("by_name", ["name"]),
```

### 2. `convex/teamPositions.ts` — new CRUD
- `listPositions` (query, admin): all, sorted by priority. Bounded `.take(100)`.
- `listActivePositions` (public query): `{ name, abbrev, category }` — unauthenticated, for the modal (names/abbrevs only).
- `createPosition`, `updatePosition`, `deletePosition` (mutations, `requireAdmin`, with `returns` validators).

### 3. `convex/seedTeamPositions.ts` — new internalMutation
- Idempotent (match by `by_name`), seeds the ~19 positions above with abbrevs (reuse the existing `ROLE_ABBREV` mapping: FSD/FE/BE/UI/UX/PM/PD/PO/BA + new ones: BO, ENT, QA, AIML, DA, DOPS, UXR, MKT, CS) and categories.
- `internalMutation` so CLI can run it (like `seedTeams:seed`).

### 4. `app/admin/teams/page.tsx` — dropdown
- `useQuery(api.teamPositions.listPositions)`.
- Replace free-text Position inputs (add-member form + inline member edit) with a **multi-select chip picker**: button showing selected positions → popover with checkbox list grouped/ordered by priority. Save joins names with `", "` into the existing `position` string passed to `addManualMember` / `updateTeamMember` (both already accept `position: string`).
- Keep a small "or type custom" text fallback only if no positions seeded (graceful).

### 5. Optional: `components/TeamModal.tsx` — use DB abbrevs
- Have `listPublicTeams` return member `positionAbbrev` resolved from `teamPositions` (via the comma-joined names), replacing the hardcoded `ROLE_ABBREV` map. (Nice-to-have; keep modal's `ROLE_ABBREV` as fallback if a name isn't in the table.)

## Seed & Deploy
1. `npx convex codegen`; `npx tsc --noEmit`; `npx eslint` on touched files.
2. Staging: `npx convex run seedTeamPositions:seed` (idempotent).
3. Prod: `npx convex deploy --yes` (needs consent at execution), then `npx convex run --prod seedTeamPositions:seed`.

## Files
| File | Change |
|---|---|
| `convex/schema.ts` | add `teamPositions` table |
| `convex/teamPositions.ts` | new — CRUD + public active list |
| `convex/seedTeamPositions.ts` | new — idempotent seed |
| `app/admin/teams/page.tsx` | free-text → multi-select dropdown |
| `components/TeamModal.tsx` | (optional) DB abbrevs |
| `convex/teams.ts` | (optional) return `positionAbbrev` in listPublicTeams |

## Verify
- tsc/eslint clean; seed returns created/skipped counts; re-seed = all skipped.
- Admin: add member via dropdown, verify joined string on participant; edit positions.
- Public modal unchanged (still renders positions + pills).
