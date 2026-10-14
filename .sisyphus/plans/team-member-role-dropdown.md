# Relabel Team-Member "Position" → "Role" (same multi-checkbox picker)

## Context
- The team-member form already has a `PositionPicker` (`app/admin/teams/page.tsx:17–124`): a dropdown that opens to show **multi checkboxes inside**, grouped by category, sourced from `teamPositions`, plus a custom-entry fallback. Selected names join with `", "` into `participants.position`.
- User wants this same control labeled **"Role"** (Teams.md calls the column "Role(s)"), not a second field and not sourced from `buildathonRoles`.
- Decision: **same field, relabel only.** No schema change, no backend change, no data migration.

## Changes (all in `app/admin/teams/page.tsx`)
1. **Component rename** `PositionPicker` → `RolePicker` (cosmetic, keeps naming consistent with the label).
2. **Trigger placeholder**: `"Select positions…"` → `"Select roles…"`.
3. **Custom-entry placeholder**: `"Custom position…"` → `"Custom role…"`.
4. **Empty-state hint**: `"No positions seeded yet…"` → `"No roles seeded yet…"`.
5. **Doc comment** above the component: update "team positions" → "team roles".
6. Leave the data plumbing untouched — still writes `participants.position` (comma-joined names), still read by `listPublicTeams` / the public modal and the admin member-row pill. The DB column name `position` stays as-is (renaming it would touch schema + 66 seeded rows + public modal for zero user benefit).

No other file changes.

## Verify
- `npx eslint app/admin/teams/page.tsx` and `npx tsc --noEmit` — both clean.
- Manual: open admin → Teams → "+ Add member" → the Role dropdown opens with checkboxes grouped Engineering/Design/Product/Business/Team; select several; Add; member row shows the joined pill; Edit reopens with the same boxes checked.

## Deploy
- Staging: the change is Next.js client code only — **no Convex push needed**; it ships with the next app build/deploy.
- Prod: same, no Convex deploy required for this change.
