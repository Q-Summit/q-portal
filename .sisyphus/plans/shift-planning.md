# Shift Planning System for Q-Summit

## TL;DR

> **Quick Summary**: Headcount planning system for Q-Summit 2026 (April 9-10). Allows planners to create shifts with time slots, define how many people needed per 30-min slot, and visualize demand spikes in a calendar view.

> **Deliverables**:
>
> - Shift CRUD (create, read, update, delete)
> - Time slot management with per-slot headcount
> - List view with sortable table and inline editing
> - Calendar view (daily/hourly) showing demand
> - Skills from existing talent table
> - Basic tools list
> - CSV export (semicolon delimiter for German Excel)
> - Role-based access control (Chair + Board only)

> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Schema → Domain → Router → List View → Calendar View → Export

---

## Context

### Original Request (GitHub Issue #9)

Planning team needs ability to create shifts with:

- Location (where)
- Task/Role (what)
- People needed (how many)
- Duration (start-end time)
- Skills required (reuse talent)
- Tools needed (car, etc.)
- Notion link
- Free text description

### User Clarifications

- **Headcount planning ONLY** - not assigning actual people yet (later: rule engine)
- **30-minute granularity** - can specify different counts per slot (e.g., 6 people 8-22, but 0 from 12-14)
- **Calendar**: daily view, hour-by-hour to see demand spikes
- **Roles**: isHeadOf flag on user table (team leads marked by Board/Chairs)
- **Skills**: Reuse existing talent table
- **Locations**: Freeform (planners create as needed)
- **Tools**: Basic list (car, van, equipment)
- **Export**: CSV needed (semicolon delimiter for German Excel)
- **Dates**: Hardcoded Q-Summit (April 9-10, 2026)

### Role Hierarchy (CONFIRMED)

| Role        | division   | isHeadOf | Can Access Shift Planning? |
| ----------- | ---------- | -------- | -------------------------- |
| Chairman    | 'chair'    | any      | YES                        |
| Board       | 'chair'    | true     | YES                        |
| Head Of     | != 'chair' | true     | NO (reports to Board)      |
| Team Member | any        | false    | NO                         |

**Access Rule**: Only `member_profile.division === 'chair'` can access shift planning. This includes both the Chairman and Board members (who have division='chair').

---

## Work Objectives

### Core Objective

Enable Q-Summit planners (Chair + Board only) to define shift time slots with headcount requirements, visualize demand across the day, and export for sharing.

### Concrete Deliverables

- [ ] Shift creation form with: location, task, duration, skills, tools, Notion link, description
- [ ] Time slot management (30-min granularity with per-slot headcount)
- [ ] List view: sortable table with inline editing
- [ ] Calendar view: daily/hourly grid showing headcount per slot
- [ ] CSV export: all slots with details (semicolon delimiter)
- [ ] Role access control: Chair + Board only

### Definition of Done

- [ ] `bun test` passes for all shift router tests
- [ ] Calendar renders correctly for April 9-10, 2026
- [ ] CSV export parses correctly with semicolon delimiter
- [ ] Only Chair/Board can create/update/delete shifts

### Must Have

- 30-minute time slot boundaries (09:00, 09:30, not 09:15)
- Per-slot headcount (0-N people per slot)
- Skills from talent table
- Basic tools dropdown
- Notion URL field
- Division-based planner access (division === 'chair')

### Must NOT Have (Guardrails)

- ❌ Person assignment (later: rule engine)
- ❌ Real-time updates (SSE/WebSocket)
- ❌ Recurring shifts
- ❌ Shift templates/duplication
- ❌ Conflict detection
- ❌ Audit trail
- ❌ Soft deletes (hard delete only)
- ❌ Multi-event support (Q-Summit only)

---

## Verification Strategy

**ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (bun test, vitest for components)
- **Automated tests**: TDD (test-first approach)
- **Framework**: bun test + vitest (via Storybook)
- **TDD Workflow**: RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy

Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Backend Tests**: Use `bun test` for tRPC router tests
- **Frontend**: Use Playwright for E2E
- **Components**: Use Storybook with play functions

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - can run in parallel):
├── Task 1: Database Schema (shifts, shift_slots, shift_skills, shift_tools, isHeadOf on user)
├── Task 2: Domain Layer (types, constants, validation)
├── Task 3: tRPC Router Skeleton (registered in root.ts)
└── Task 4: Planner Role Middleware (depends on Task 1 - needs isHeadOf field)

Wave 2 (Backend - can run in parallel):
├── Task 5: Shift CRUD procedures with tests
├── Task 6: List query with sorting/filtering
├── Task 7: Calendar query for demand visualization
└── Task 8: CSV export procedure

Wave 3 (Frontend - can run in parallel):
├── Task 9: Shift creation form (Modal or page)
├── Task 10: List view with inline editing
├── Task 11: Calendar view (daily/hourly)
└── Task 12: CSV export button + download

Wave 4 (Integration + Polish):
├── Task 13: Connect views to tRPC
├── Task 14: Role enforcement (API + UI)
├── Task 15: Edge case handling
└── Task 16: Documentation

Wave FINAL (Verification):
├── Task F1: Plan Compliance Audit
├── Task F2: Code Quality Review
├── Task F3: Full integration QA
└── Task F4: Scope Fidelity Check
```

### Dependency Matrix

| Task       | Depends On    | Blocks        |
| ---------- | ------------- | ------------- |
| 1          | -             | 2, 3, 4, 5-8  |
| 2          | 1             | 4             |
| 3          | 1             | 4             |
| 4          | 1, 2, 3       | 5, 6, 7, 8    |
| 5, 6, 7, 8 | 4             | 9, 10, 11, 12 |
| 9, 10, 11  | 5, 6, 7, 8    | 13            |
| 12         | 8             | 13            |
| 13         | 9, 10, 11, 12 | 14, 15, 16    |
| 14, 15, 16 | 13            | F1-F4         |

---

## TODOs

### Task 1: Database Schema

**What to do**:

- Create Drizzle tables in `src/server/db/schema.ts`:
  - `shifts`: id, location, task, description, notionLink, startTime, endTime, createdBy, createdAt
  - `shift_slots`: id, shiftId, slotTime (30-min boundary), headcount (0-N)
  - `shift_skills`: id, shiftId, talentId (reuses talent table)
  - `shift_tools`: id, shiftId, tool (enum: car, van, equipment, none)
- Add to `user` table (better-auth):
  - `isHeadOf`: boolean default false (marks team leads)
- Add indexes: shift.startTime, shift.location, shift_slots.slotTime
- Run `bun run db:generate` and create migration

**Must NOT do**:

- No assignment columns (out of scope)
- No soft deletes
- No recurrence fields

**Recommended Agent Profile**:

- **Category**: `deep` - Schema design requires understanding of temporal data, relationships
- **Skills**: [`tdd`]

**Parallelization**: Wave 1 (with Tasks 2, 3, 4)

**References**:

- `src/server/db/schema.ts` - Existing schema patterns
- `src/domain/qsum/profile/validation.ts` - Zod validation patterns

**Acceptance Criteria**:

- [x] `bun run db:generate` creates migration file
- [x] `bun run db:push` applies migration without errors
- [x] Schema includes all required fields with correct types
- [x] user table has isHeadOf boolean field
- [ ] `bun run db:push` applies migration without errors
- [ ] Schema includes all required fields with correct types
- [ ] user table has isHeadOf boolean field

**QA Scenarios**:

```
Scenario: Migration applies cleanly
  Tool: Bash
  Preconditions: Fresh database or test DB
  Steps: 1. Run `bun run db:generate` 2. Run `bun run db:push` 3. Inspect output for errors
  Expected Result: Migration applies, no errors
  Evidence: .sisyphus/evidence/task-1-migration.log
```

---

### Task 2: Domain Layer

**What to do**:

- Create `src/domain/qsum/shifts/`:
  - `types.ts`: Shift, ShiftSlot, ShiftSkill, ShiftTool interfaces
  - `constants.ts`: TOOL_OPTIONS, DEFAULT_SHIFT_DURATION
  - `validation.ts`: ShiftCreateSchema, ShiftUpdateSchema, normalizeShiftInput
- Follow existing profile domain pattern exactly

**Must NOT do**:

- No business logic (only types, constants, validation)
- No database imports

**Recommended Agent Profile**:

- **Category**: `quick` - Following established patterns

**Parallelization**: Wave 1 (with Tasks 1, 3, 4)

**References**:

- `src/domain/qsum/profile/types.ts` - Pattern to follow
- `src/domain/qsum/profile/validation.ts` - Zod schema patterns

**Acceptance Criteria**:

- [x] `bun run typecheck` passes
- [x] Domain exports all types/constants from index.ts
- [ ] Domain exports all types/constants from index.ts

**QA Scenarios**:

```
Scenario: Types compile without errors
  Tool: Bash
  Preconditions: Domain files created
  Steps: 1. Run `bun run typecheck`
  Expected Result: No TypeScript errors
  Evidence: .sisyphus/evidence/task-2-typecheck.log
```

---

### Task 3: tRPC Router Skeleton

**What to do**:

- Create `src/server/api/routers/shift.ts`:
  - create, getById, update, delete, list, calendar procedures (empty implementations)
  - Register in `src/server/api/root.ts`
- Import domain schemas
- Add protectedProcedure for all

**Must NOT do**:

- No implementation logic yet
- No public procedures

**Recommended Agent Profile**:

- **Category**: `quick` - Following existing router pattern

**Parallelization**: Wave 1 (with Tasks 1, 2, 4)

**References**:

- `src/server/api/routers/profile.ts` - Router pattern
- `src/server/api/root.ts` - Registration pattern

**Acceptance Criteria**:

- [x] Router registered in root.ts
- [x] `bun run build` succeeds
- [ ] `bun run build` succeeds

**QA Scenarios**:

```
Scenario: Router builds correctly
  Tool: Bash
  Preconditions: Router created
  Steps: 1. Run `bun run build`
  Expected Result: Build succeeds
  Evidence: .sisyphus/evidence/task-3-build.log
```

---

### Task 4: Planner Role Middleware

**What to do**:

- Add `plannerProcedure` to `src/server/api/trpc.ts`
- Permission check logic:

  ```typescript
  const canAccessShiftPlanning = async (ctx: Context) => {
    const userId = ctx.session.user.id;

    // Get user's profile
    const profile = await ctx.db.query.memberProfile.findFirst({
      where: eq(memberProfile.userId, userId),
    });

    // Chair (division = 'chair') can access - includes Chairman AND Board
    if (profile?.division === "chair") return true;

    // Everyone else (including Head Of with isHeadOf=true but division != 'chair') cannot access
    return false;
  };
  ```

- Use existing protectedProcedure as base
- Add isHeadOf field to user table in schema (from Task 1)

**Must NOT do**:

- No super-admin role
- No cross-division editing (Head Of cannot access - only Chair/Board)

**Recommended Agent Profile**:

- **Category**: `quick` - Simple middleware addition

**Parallelization**: Wave 1 (with Tasks 1, 2, 3)

**References**:

- `src/server/api/trpc.ts` - Existing protectedProcedure
- `src/lib/auth.ts` - Session handling

**Acceptance Criteria**:

- [x] Non-planner gets error on create attempt

**QA Scenarios**:

```
Scenario: Role check works correctly
  Tool: Bash (tRPC caller)
  Preconditions: Middleware implemented, isHeadOf field added to user table
  Setup: Seed test users:
    - chairUser: member_profile.division = 'chair', isHeadOf = false (Chairman)
    - boardUser: member_profile.division = 'chair', isHeadOf = true (Board)
    - headOfUser: member_profile.division = 'operations', isHeadOf = true (Head Of - CANNOT access)
    - regularUser: member_profile.division = 'operations', isHeadOf = false
  Steps:
    1. Create mock context with chair user session → call create shift
    2. Verify SUCCESS
    3. Create mock context with board user session → call create shift
    4. Verify SUCCESS
    5. Create mock context with headOf user session → call create shift
    6. Verify FORBIDDEN (Head Of cannot access)
    7. Create mock context with regular user session → call create shift
    8. Verify FORBIDDEN
  Expected Result: Chair/Board succeed, HeadOf/Regular get 403
  Evidence: .sisyphus/evidence/task-4-role-check.log
```

---

### Task 5: Shift CRUD Procedures

**What to do**:

- Implement create, getById, update, delete in shift router
- Handle time slot generation (30-min boundaries)
- Use transactions for slot creation
- Add input validation from domain

**Must NOT do**:

- No person assignment logic
- No conflict detection

**Recommended Agent Profile**:

- **Category**: `deep` - Complex transactions for slot management

**Parallelization**: Wave 2 (with Tasks 6, 7, 8)

**References**:

- `src/server/api/routers/profile.ts` - Transaction patterns

**Acceptance Criteria**:

- [x] Create shift generates correct slots
- [x] Update shifts updates slots correctly
- [x] Delete removes shift and slots
- [ ] Update shifts updates slots correctly
- [ ] Delete removes shift and slots

**QA Scenarios**:

```
Scenario: Create shift with slots
  Tool: Bash (tRPC caller)
  Preconditions: Router implemented
  Steps: 1. Create shift: start 08:00, end 10:00 2. Query slots for this shift
  Expected Result: 4 slots (08:00, 08:30, 09:00, 09:30), all with default headcount 0
  Evidence: .sisyphus/evidence/task-5-create-slots.log
```

---

### Task 6: List Query with Sorting/Filtering

**What to do**:

- Implement list procedure with:
  - Sort by: startTime, location, task, createdAt
  - Filter by: location, date range
  - Pagination (cursor-based)
- Include slot summaries (total headcount)

**Must NOT do**:

- No person details (out of scope)

**Recommended Agent Profile**:

- **Category**: `deep` - Complex query with joins

**Parallelization**: Wave 2 (with Tasks 5, 7, 8)

**References**:

- `src/server/api/routers/profile.ts` - List pattern with cursor

**Acceptance Criteria**:

- [x] Returns shifts with pagination
- [x] Sorting works for all fields
- [x] Filters work correctly
- [ ] Sorting works for all fields
- [ ] Filters work correctly

**QA Scenarios**:

```
Scenario: List with sorting
  Tool: Bash (tRPC caller)
  Preconditions: Multiple shifts exist
  Steps: 1. Call list with sort: { field: startTime, direction: asc } 2. Verify order
  Expected Result: Shifts in ascending time order
  Evidence: .sisyphus/evidence/task-6-list-sort.log
```

---

### Task 7: Calendar Query

**What to do**:

- Implement calendar procedure:
  - Input: date (April 9 or 10, 2026)
  - Output: time slots (30-min) with headcount totals per slot
  - Group by slotTime, sum headcount
- Include shift details per slot

**Must NOT do**:

- No person assignment visualization

**Recommended Agent Profile**:

- **Category**: `deep` - Complex aggregation query

**Parallelization**: Wave 2 (with Tasks 5, 6, 8)

**References**:

- `src/server/api/routers/profile.ts` - Query patterns

**Acceptance Criteria**:

- [x] Returns slots for April 9, 2026
- [x] Returns slots for April 10, 2026
- [x] Headcount totals correct per slot
- [ ] Returns slots for April 10, 2026
- [ ] Headcount totals correct per slot

**QA Scenarios**:

```
Scenario: Calendar shows demand
  Tool: Bash (tRPC caller)
  Preconditions: Shifts with varying headcounts exist
  Steps: 1. Call calendar for April 9 2. Inspect slot 08:00-08:30
  Expected Result: Total headcount for that slot
  Evidence: .sisyphus/evidence/task-7-calendar.log
```

---

### Task 8: CSV Export Procedure

**What to do**:

- Implement export procedure:
  - Query all shifts with slots
  - Generate CSV with columns: shift_id, location, task, start_time, end_time, slot_time, headcount, skills, tools, notion_link
  - One row per time slot
  - Semicolon delimiter (German Excel)
  - UTF-8 with BOM

**Must NOT do**:

- No filtered export (all shifts)

**Recommended Agent Profile**:

- **Category**: `quick` - Straightforward file generation

**Parallelization**: Wave 2 (with Tasks 5, 6, 7)

**Acceptance Criteria**:

- [x] CSV parses correctly in Excel
- [x] All slots included
- [x] Correct semicolon format
- [ ] All slots included
- [ ] Correct semicolon format

**QA Scenarios**:

```
Scenario: CSV export parses
  Tool: Bash
  Preconditions: Shifts exist
  Steps: 1. Call export 2. Open in text editor 3. Parse with semicolon delimiter
  Expected Result: All columns present, correct data
  Evidence: .sisyphus/evidence/task-8-csv.log
```

---

### Task 9: Shift Creation Form

**What to do**:

- Create shift form component:
  - Location (text input, freeform)
  - Task (text input)
  - Start/End time pickers
  - Skills multi-select (from talent table)
  - Tools dropdown (car, van, equipment)
  - Notion link (URL input)
  - Description (textarea)
- Hook up to tRPC create mutation

**Must NOT do**:

- No person assignment UI

**Recommended Agent Profile**:

- **Category**: `visual-engineering` - Form UI with validation

**Parallelization**: Wave 3 (with Tasks 10, 11, 12)

**References**:

- `src/components/profile/profile-form.tsx` - Form pattern
- `src/components/ui/` - shadcn components

NP|**Acceptance Criteria**:
KX|

- [x] Form submits to API
- [x] Validation errors show
- [x] Success redirects to list
- [ ] Storybook story added with MSW for: empty, loading, error states
      ZX|- [ ] Validation errors show
      NT|- [ ] Success redirects to list
      QK|- [ ] Storybook story added with MSW for: empty, loading, error states

WW|**QA Scenarios**:

- [ ] Form submits to API
- [ ] Validation errors show
- [ ] Success redirects to list

**QA Scenarios**:

```
Scenario: Create shift via UI
  Tool: Playwright
  Preconditions: Logged in as planner (Chair/Board)
  Steps: 1. Navigate to /shifts 2. Click "Create Shift" 3. Fill form: location=Test, task=Runner, start=08:00, end=10:00 4. Submit
  Expected Result: Shift appears in list
  Evidence: .sisyphus/evidence/task-9-create-form.mp4
```

---

### Task 10: List View with Inline Editing

**What to do**:

- Create shift list component:
  - Table with columns: Location, Task, Time, Total Headcount, Skills, Actions
  - Sortable headers
  - Inline editing for headcount per slot
  - Edit/Delete actions
- Hook to list and update mutations

**Must NOT do**:

- No bulk editing (yet)

**Recommended Agent Profile**:

- **Category**: `visual-engineering` - Complex table with interactions

**Parallelization**: Wave 3 (with Tasks 9, 11, 12)

NP|**Acceptance Criteria**:
KW|
JS|- [ ] List loads with shifts
VT|- [ ] Sorting works
TJ|- [ ] Inline edit saves
MX|- [ ] Storybook story added with MSW for: empty, loading, populated, editing states

WW|**QA Scenarios**:

- [ ] List loads with shifts
- [ ] Sorting works
- [ ] Inline edit saves

**QA Scenarios**:

```
Scenario: Inline edit headcount
  Tool: Playwright
  Preconditions: Shift exists
  Steps: 1. Click headcount cell 2. Change value 3. Click outside to save
  Expected Result: API called, value persisted
  Evidence: .sisyphus/evidence/task-10-inline-edit.mp4
```

---

### Task 11: Calendar View (Daily/Hourly)

**What to do**:

- Create calendar component:
  - Day selector (April 9, April 10)
  - Y-axis: 30-min time slots (06:00-23:00)
  - X-axis: Locations OR just show total per slot
  - Cell shows headcount number
  - Click slot to see shift details
- Hook to calendar query

**Must NOT do**:

- No person details in cells

**Recommended Agent Profile**:

- **Category**: `visual-engineering` - Complex visualization

**Parallelization**: Wave 3 (with Tasks 9, 10, 12)

NP|**Acceptance Criteria**:
KW|
HB|- [ ] Shows April 9 grid
VP|- [ ] Shows April 10 grid
WM|- [ ] Headcount visible per slot
XB|- [ ] Storybook story added with MSW for: empty, loading, populated, different headcounts

WW|**QA Scenarios**:

- [ ] Shows April 9 grid
- [ ] Shows April 10 grid
- [ ] Headcount visible per slot

**QA Scenarios**:

```
Scenario: Calendar displays demand
  Tool: Playwright
  Preconditions: Shifts with headcounts exist
  Steps: 1. Navigate to calendar view 2. Select April 9
  Expected Result: Grid shows slots with numbers
  Evidence: .sisyphus/evidence/task-11-calendar.mp4
```

---

### Task 12: CSV Export Button

**What to do**:

- Add export button to UI:
  - Button in list view header
  - Calls export procedure
  - Downloads CSV file
- Show loading state

**Must NOT do**:

- No filtered export options

**Recommended Agent Profile**:

- **Category**: `quick` - Simple button + download

**Parallelization**: Wave 3 (with Tasks 9, 10, 11)

NP|**Acceptance Criteria**:
WP|

- [x] Button triggers download
- [x] File contains all data
- [x] Storybook story added with MSW for: default, loading, success states

WW|**QA Scenarios**:

- [ ] Button triggers download
- [ ] File contains all data

**QA Scenarios**:

```
Scenario: Export downloads CSV
  Tool: Playwright
  Preconditions: Shifts exist
  Steps: 1. Click Export CSV button 2. Verify file downloads
  Expected Result: CSV file with correct content
  Evidence: .sisyphus/evidence/task-12-export.csv
```

---

### Task 13: Connect Views to tRPC

**What to do**:

- Wire up all components to API:
  - List view uses api.shift.list
  - Calendar uses api.shift.calendar
  - Form uses api.shift.create/update
- Add loading states
- Handle errors gracefully

**Must NOT do**:

- No custom API calls (use tRPC)

**Recommended Agent Profile**:

- **Category**: `visual-engineering` - Integration work

**Parallelization**: After 9, 10, 11

NP|**Acceptance Criteria**:
TM|
BB|- [ ] All views work end-to-end
MX|- [ ] Storybook story for /shifts page with MSW: planner view, non-planner view

WW|**QA Scenarios**:

- [ ] All views work end-to-end

**QA Scenarios**:

```
Scenario: Full CRUD flow
  Tool: Playwright
  Preconditions: Connected
  Steps: 1. Create shift 2. View in list 3. View in calendar 4. Edit 5. Delete
  Expected Result: All operations work
  Evidence: .sisyphus/evidence/task-13-e2e.mp4
```

---

### Task 14: Role Enforcement (API + UI)

**What to do**:

- Add plannerProcedure to create/update/delete
- Hide create button for non-planners
- Show edit/delete only for planners
- Add error toasts for permission denied

**Must NOT do**:

- No cross-division restrictions

**Recommended Agent Profile**:

- **Category**: `quick` - Middleware + UI tweaks

**Parallelization**: After 13

**Acceptance Criteria**:

- [ ] Non-planner cannot create

**QA Scenarios**:

```
Scenario: Role enforcement via UI
  Tool: Playwright
  Preconditions: Test users seeded
  Setup: Use browser.storageState() with pre-authenticated sessions
  Steps:
    1. Load page with non-planner session
    2. Verify "Create Shift" button is HIDDEN
    3. Try direct URL /shifts with non-planner session
    4. Verify error toast "Permission denied"
  Expected Result: UI hides create for non-planners
  Evidence: .sisyphus/evidence/task-14-role-ui.mp4

Scenario: Planner can access
  Tool: Playwright
  Preconditions: Planner user seeded
  Steps:
    1. Load page with planner session
    2. Verify "Create Shift" button is VISIBLE
    3. Create shift succeeds
  Expected Result: Planner sees full UI
  Evidence: .sisyphus/evidence/task-14-planner-access.mp4
```

---

### Task 15: Edge Case Handling

**What to do**:

- Handle edge cases:
  - Shift spanning midnight (display on both days)
  - All slots 0 headcount (allow but warn)
  - Invalid Notion URL (validate format)
  - Empty shifts list (show empty state)
- Add validation messages

**Must NOT do**:

- No complex edge case logic

**Recommended Agent Profile**:

- **Category**: `quick` - Bug fixing

**Parallelization**: After 14

**Acceptance Criteria**:

- [ ] Edge cases handled gracefully

**QA Scenarios**:

```
Scenario: Invalid URL shows error
  Tool: Playwright
  Preconditions: None
  Steps: 1. Enter invalid URL in Notion field 2. Submit form
  Expected Result: Validation error shown
  Evidence: .sisyphus/evidence/task-15-validation.mp4
```

---

### Task 16: Documentation

**What to do**:

- Add docs:
  - Shift planning workflow
  - CSV format explanation
  - Role access explanation

**Must NOT do**:

- No over-documentation

**Recommended Agent Profile**:

- **Category**: `writing` - Documentation

**Acceptance Criteria**:

- [ ] Key workflows documented

**QA Scenarios**:

```
Scenario: Documentation complete
  Tool: Bash
  Preconditions: Documentation written
  Steps:
    1. Run `bun run docs:check`
    2. Verify shift-related docs are flagged for review
  Expected Result: Docs updated and verified
  Evidence: .sisyphus/evidence/task-16-docs.log
```

---

## Final Verification Wave

- [ ] **F1. Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] **F2. Code Quality Review** — `unspecified-high`
      Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] **F3. Full Integration QA** — `unspecified-high` (+ `playwright` skill)
      Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] **F4. Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance. Detect cross-task contamination.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `feat(shifts): add database schema` — schema.ts, migration
- **2**: `feat(shifts): add domain types and validation` — domain/shifts/
- **3**: `feat(shifts): add tRPC router skeleton` — routers/shift.ts
- **4**: `feat(shifts): add planner role middleware` — trpc.ts
- **5**: `feat(shifts): implement CRUD operations` — routers/shift.ts (CRUD)
- **6**: `feat(shifts): add list query` — routers/shift.ts (list)
- **7**: `feat(shifts): add calendar query` — routers/shift.ts (calendar)
- **8**: `feat(shifts): add CSV export` — routers/shift.ts (export)
- **9**: `feat(shifts): add creation form UI` — components/shifts/
- **10**: `feat(shifts): add list view` — components/shifts/
- **11**: `feat(shifts): add calendar view` — components/shifts/
- **12**: `feat(shifts): add CSV export button` — components/shifts/
- **13**: `feat(shifts): connect UI to API` — integration
- **14**: `feat(shifts): add role enforcement` — middleware + UI
- **15**: `fix(shifts): handle edge cases` — edge case handling
- **16**: `docs(shifts): add documentation` — docs/

---

## Success Criteria

### Verification Commands

```bash
# Type check
bun run typecheck

# Lint
bun run lint

# Tests
bun test

# Build
bun run build

# DB migration
bun run db:push
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Calendar renders April 9-10, 2026
- [ ] CSV exports correctly
- [ ] Role enforcement works (Chair + Board only)
