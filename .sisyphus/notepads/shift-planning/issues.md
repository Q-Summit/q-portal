## 2026-03-13

- `bun run db:generate` initially failed because migration metadata snapshot `0002_snapshot.json` was in an outdated/incomplete format.
- After normalizing snapshot metadata shape and removing stale `talent.label` snapshot drift, migration generation proceeded cleanly.
- agent:finalize currently fails due pre-existing Prettier issues in .sisyphus/boulder.json and .sisyphus/plans/shift-planning.md (not introduced by this task).

## 2026-03-14

- Full integration QA found `bun test` failing with an unhandled `@trpc/server` non-server environment error originating from `src/server/api/trpc.ts` during `src/server/api/routers/__tests__/slack.integration.test.ts`.
- `bun run agent:finalize` does not pass cleanly because ESLint reports an unused `AlertCircle` import in `src/components/shifts/shift-manager.tsx`.
- Shift UI composition is incomplete: `src/components/shifts/shift-manager.tsx` renders its own inline list/calendar views instead of using exported `src/components/shifts/shift-list.tsx` and `src/components/shifts/calendar-view.tsx`, so the standalone components are story-covered but not wired into the main flow.

- 2026-03-14 code-quality review: `bun run check` fails lint with unused `AlertCircle` import in `src/components/shifts/shift-manager.tsx`; `bun test` fails because `src/server/api/trpc.ts` initializes `@trpc/server` outside a server environment during tests.

## 2026-03-14 (continued)

- MSW handler fixes complete for shift story files (shift-form, shift-list, calendar-view, shift-manager), but remaining test failures are component-level accessibility violations:
  - `calendar-view.tsx`: Navigation buttons lack discernible text (icon-only buttons need `aria-label`)
  - `calendar-view.tsx` & `shift-list.tsx`: Scrollable regions (`.overflow-x-auto`) need keyboard access (`tabindex`)
  - `shift-form.tsx`: Form inputs not properly associated with `<Label>` components
  - `shift-manager.tsx`: Heading order violation (`<h3>` without preceding `<h1>` or `<h2>`)
  - `csv-export-button.tsx`: Icon-only button lacks accessible name
- Pre-existing Prettier formatting issue in `src/components/shifts/shift-form.tsx` (untracked new file)
