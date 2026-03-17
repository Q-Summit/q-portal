## CSV Export Button Implementation - 2026-03-14

### Component Structure

- Created `CsvExportButton` component in `src/components/shifts/csv-export-button.tsx`
- Follows existing patterns from `shift-form.tsx` and other shift components
- Uses shadcn/ui `Button` component with `variant="outline"` and `size="sm"`
- Uses lucide-react icons: `Download` and `Loader2` (with `animate-spin`)

### Key Features Implemented

1. **tRPC Mutation**: Uses `api.shift.exportCsv.useMutation()` to call the export procedure
2. **File Download**: Creates Blob with UTF-8 BOM (`"\uFEFF"`) for German Excel compatibility
3. **Loading State**: Shows `Loader2` spinner with animation while mutation is pending
4. **Error Handling**: Gracefully handles mutation errors via tRPC error handling
5. **Custom Filename**: Supports optional `filename` prop (defaults to "shifts-export.csv")
6. **Responsive**: Shows "Export" text on larger screens only (`hidden sm:inline`)

### TypeScript Patterns

- Props interface with optional `filename` parameter
- Uses `useMutation` hook with `onSuccess` callback for download
- Proper type inference from tRPC router

### Storybook Stories

Created comprehensive stories in `csv-export-button.stories.tsx`:

- `Default`: Button ready to export with mock CSV data
- `Loading`: Shows spinner during export (simulated slow network)
- `Success`: Export completed successfully
- `Error`: Server error response handling
- `EmptyExport`: CSV with header only (no shifts)
- `CustomFilename`: Uses custom download filename

### MSW Integration

- Used `trpcMutation` helper from `.storybook/utils/trpc-helpers`
- Mock CSV data with semicolon delimiter matching server format
- Error state uses raw `http.post` handler for tRPC error response
- Loading state simulates slow network with 100s delay

### CSV Format

- Semicolon delimiter for German Excel compatibility
- UTF-8 BOM prefix (`"\uFEFF"`) for proper character encoding
- Header row: `shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link`
- ISO datetime format with space separator (not T)
- Skills/tools joined with commas within cells

### UI Patterns Followed

- Outline button variant for secondary action
- Small size for header placement
- Gap between icon and text
- Disabled state during loading
- Consistent with existing shift component styling

## Full Integration QA - 2026-03-14

- `src/server/api/root.ts` registers `shift: shiftRouter`, so the router is exposed through the app router.
- `src/domain/qsum/shifts/index.ts` re-exports `constants`, `types`, and `validation`, and `src/server/api/routers/shift.ts` consumes those exports directly.
- All required shift UI files and Storybook stories exist, and each story imports its paired component successfully.
- The main `/shifts` flow currently queries `api.shift.list` and `api.shift.calendar` inside `src/components/shifts/shift-manager.tsx`, but does not compose the exported `ShiftList` and external `CalendarView` components.

## CSV Export Button Implementation - 2026-03-14

### Component Structure

- Created `CsvExportButton` component in `src/components/shifts/csv-export-button.tsx`
- Follows existing patterns from `shift-form.tsx` and other shift components
- Uses shadcn/ui `Button` component with `variant="outline"` and `size="sm"`
- Uses lucide-react icons: `Download` and `Loader2` (with `animate-spin`)

### Key Features Implemented

1. **tRPC Mutation**: Uses `api.shift.exportCsv.useMutation()` to call the export procedure
2. **File Download**: Creates Blob with UTF-8 BOM (`"\uFEFF"`) for German Excel compatibility
3. **Loading State**: Shows `Loader2` spinner with animation while mutation is pending
4. **Error Handling**: Gracefully handles mutation errors via tRPC error handling
5. **Custom Filename**: Supports optional `filename` prop (defaults to "shifts-export.csv")
6. **Responsive**: Shows "Export" text on larger screens only (`hidden sm:inline`)

### TypeScript Patterns

- Props interface with optional `filename` parameter
- Uses `useMutation` hook with `onSuccess` callback for download
- Proper type inference from tRPC router

### Storybook Stories

Created comprehensive stories in `csv-export-button.stories.tsx`:

- `Default`: Button ready to export with mock CSV data
- `Loading`: Shows spinner during export (simulated slow network)
- `Success`: Export completed successfully
- `Error`: Server error response handling
- `EmptyExport`: CSV with header only (no shifts)
- `CustomFilename`: Uses custom download filename

### MSW Integration

- Used `trpcMutation` helper from `.storybook/utils/trpc-helpers`
- Mock CSV data with semicolon delimiter matching server format
- Error state uses raw `http.post` handler for tRPC error response
- Loading state simulates slow network with 100s delay

### CSV Format

- Semicolon delimiter for German Excel compatibility
- UTF-8 BOM prefix (`"\uFEFF"`) for proper character encoding
- Header row: `shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link`
- ISO datetime format with space separator (not T)
- Skills/tools joined with commas within cells

### UI Patterns Followed

- Outline button variant for secondary action
- Small size for header placement
- Gap between icon and text
- Disabled state during loading
- Consistent with existing shift component styling

## Documentation Created - 2026-03-14

Created comprehensive documentation for the Shift Planning feature in `.docs/shifts/`:

### Files Created

1. **README.md** - Overview and navigation hub
   - Feature summary
   - Quick links to all docs
   - Data model ER diagram
   - Cross-references to related docs

2. **workflow.md** - User workflow documentation
   - Step-by-step shift creation guide
   - View modes (list vs calendar)
   - Editing and deleting shifts
   - CSV export workflow
   - Sequence diagram showing full workflow
   - Best practices and troubleshooting

3. **csv-format.md** - CSV export specification
   - UTF-8 BOM encoding for German Excel
   - Semicolon delimiter format
   - Column structure and examples
   - DateTime formatting (ISO with space)
   - Skills/tools comma-separated format
   - Usage instructions for Excel and Google Sheets
   - Code examples for Python and JavaScript

4. **role-access.md** - Access control documentation
   - Role hierarchy (Chair/Board vs others)
   - Access matrix for all features
   - API-level protection (plannerProcedure)
   - UI-level conditional rendering
   - Security considerations
   - Troubleshooting access issues

5. **api-reference.md** - Technical API documentation
   - All 7 endpoints documented
   - Input/output schemas with examples
   - Validation rules and error codes
   - React hook usage patterns
   - Domain type definitions

### Documentation Patterns Used

- Mermaid diagrams for workflows and ER diagrams
  - Sequence diagrams for user flows
  - ER diagram for data model
- Consistent structure following DOCUMENTATION_GUIDE.md
- Cross-references between related documents
- Practical examples throughout
- Tables for structured data (access matrix, column specs)

### Key Technical Details Documented

- 30-minute time slot granularity
- Semicolon-delimited CSV for German Excel
- UTF-8 BOM for proper character encoding
- Role check: `division === "chair"`
- tRPC procedure types and middleware
- Zod validation schemas
- Error codes and handling

- 2026-03-14 shift review: shift files are largely free of `as any`, TS suppression, empty catches, and commented-out code; notable findings are server-side `console.log` usage in `src/server/api/trpc.ts` and story-only `console.log` callbacks in `src/components/shifts/shift-list.stories.tsx`.

## MSW Handler Fixes for Storybook Stories - 2026-03-14

### Problem

Storybook stories for shift components were failing with:

1. "Query data cannot be undefined" - React Query v5 requires query functions to return a value
2. "MSW Warning: intercepted a request without a matching request handler" for `profile.getMy`, `shift.list`, etc.

### Solution Pattern

Created base handler factories that provide ALL endpoints a component uses:

```typescript
const createBaseHandlers = () => [
  trpcQuery("profile", "getMy", () => ({
    user: { name: "Test User", image: null },
    profile: { division: "chair", team: "executive", role: "Planner" },
  })),
  trpcQuery("shift", "list", () => ({ items: [], total: 0, nextCursor: null })),
  trpcQuery("shift", "calendar", () => []),
];
```

### Key Insight

Components often call multiple tRPC endpoints even when testing a single feature. Stories must mock ALL endpoints a component uses:

- `ShiftManager` calls `profile.getMy`, `shift.list`, and `shift.calendar` depending on view mode
- `ShiftForm` calls `profile.getMy` for user context and `profile.listTalents` for dropdown
- `CalendarView` calls `shift.calendar` for data and `profile.getMy` for permissions

### Files Updated

1. `shift-form.stories.tsx`: Added `createBaseHandlers()` to all 6 stories
2. `shift-list.stories.tsx`: Added `createBaseHandlers()` to all 10 stories
3. `calendar-view.stories.tsx`: Added `createCalendarHandlers()` factory to all 10 stories
4. `shift-manager.stories.tsx`: Added missing `shift.list` handlers to 5 stories

### Results

| Story File                | Before | After       |
| ------------------------- | ------ | ----------- |
| shift-form.stories.tsx    | 0/6    | 6/6         |
| shift-list.stories.tsx    | 0/10   | 10/10       |
| shift-manager.stories.tsx | 10/11  | 10/11       |
| calendar-view.stories.tsx | 0/10   | 1/10 (a11y) |

### Remaining A11y Issues (Component-Level)

- Icon-only buttons missing `aria-label` (button-name rule)
- Scrollable regions missing `tabindex` (scrollable-region-focusable rule)
- Form inputs not properly associated with labels
- Heading order violations (h3 without preceding h1/h2)

These require component code changes, not story file changes.
