# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-13
**Commit:** 89eb030
**Branch:** update-agents-file-dn7q

## OVERVIEW

Q-Portal — Q-Summit's internal tools hub. Next.js 16 + React 19 + tRPC + Drizzle ORM + Turso. Bun runtime.

## STRUCTURE

```
q-portal/
├── src/
│   ├── app/              # Next.js routes (App Router)
│   │   ├── (auth)/       # Auth routes (login, complete-profile)
│   │   ├── (mobile)/     # Mobile routes (dashboard, profile, shifts)
│   │   └── api/          # tRPC + better-auth endpoints
│   ├── components/       # React components (ui, auth, profile, layout)
│   ├── domain/           # DDD-style domain logic (qsum/profile)
│   ├── server/           # Backend (tRPC routers, DB, Slack)
│   ├── lib/              # Shared utilities, auth-client
│   └── trpc/             # MSW tRPC mock setup
├── scripts/              # Automation (PR, review, docs, finalize)
├── test/                 # Shared test utilities + examples
└── .docs/                # Documentation guides
```

## WHERE TO LOOK

| Task                    | Location                                    | Notes                              |
| ----------------------- | ------------------------------------------- | ---------------------------------- |
| Add API endpoint        | `src/server/api/routers/`                   | Register in `root.ts`              |
| Add DB table            | `src/server/db/schema.ts`                   | Run `bun run db:generate`          |
| Add UI component        | `src/components/ui/`                        | shadcn/ui patterns                 |
| Add route               | `src/app/`                                  | Route groups: `(auth)`, `(mobile)` |
| Auth logic              | `src/lib/auth.ts`, `src/lib/auth-client.ts` | better-auth                        |
| Domain types/validation | `src/domain/qsum/profile/`                  | constants, types, validation       |
| Slack integration       | `src/server/slack/`                         | @slack/web-api                     |
| Test utilities          | `test/utils.ts`                             | `createTestDb`, `cleanupTestDb`    |
| CI/CD                   | `.github/workflows/`                        | pr-checks, chromatic               |
| Automation scripts      | `scripts/`                                  | PR comments, reviews, docs         |

## CONVENTIONS

**Imports:** Use `@/*` alias for `src/*` (e.g., `@/lib/utils`)

**Tests:** Place in `__tests__/` alongside code. Name: `*.unit.test.ts`, `*.integration.test.ts`, `*.e2e.test.ts`

**UI Components:** Test via Storybook stories with `play` functions — no separate `*.test.tsx` files

**Unused vars:** Prefix with `_` (e.g., `_unused`) to satisfy ESLint

**Async in JSX:** Wrap with IIFE or use `@typescript-eslint/no-misused-promises` exemption pattern

**Package manager:** Bun only. `bun install`, `bun run ...`

## ANTI-PATTERNS (THIS PROJECT)

- ❌ `@ts-ignore`, `@ts-expect-error`, `as any` — never suppress types
- ❌ Empty catch blocks
- ❌ Deleting test files to "pass" tests
- ❌ UI component `*.test.tsx` files — use Storybook stories instead
- ❌ E2E tests under `bun test` — they run via Playwright separately
- ❌ `scripts/` in ESLint — intentionally ignored

## UNIQUE STYLES

**Domain Layer:** `src/domain/qsum/profile/` holds types, constants, validation separately from server code

**Migrations in src:** Drizzle migrations live in `src/server/db/_migrations/` (not root)

**Server Boundary:** All backend code under `src/server/` — clear separation from frontend

**PR Automation:** Rich script suite for CodeRabbit review, PR comment management

## COMMANDS

```bash
bun run dev              # Development server (localhost:3000)
bun run build            # Production build
bun run check            # Format + typecheck + lint
bun run fix              # Auto-fix format + lint
bun run test             # Unit + integration (excludes E2E)
bun run test:e2e         # Playwright E2E tests
bun run test:stories     # Storybook component tests
bun run db:push          # Push schema to DB
bun run db:generate      # Generate migrations
bun run storybook        # Component dev (localhost:6006)
bun run agent:finalize   # Quality gate (check)
bun run docs:check       # Doc sync check
bun run review:task      # CodeRabbit review (uncommitted)
bun run review:pr        # CodeRabbit review (vs main)
```

## NOTES

- **Env vars:** Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. See `.env.example`
- **DB:** Turso (libSQL). Local dev can use `file:./db.sqlite`
- **Auth:** better-auth with Google OAuth
- **MSW:** Worker in `public/mockServiceWorker.js` for tests/Storybook
- **Chromatic:** Visual regression on PRs + main (requires `CHROMATIC_PROJECT_TOKEN` secret)
- **Missing:** `@/hooks` alias in `components.json` but no `src/hooks/` dir exists
