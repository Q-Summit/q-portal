# API Reference

Technical documentation for the shift planning tRPC endpoints.

## Base Path

All shift endpoints are accessible via the `shift` router:

```typescript
api.shift.{procedureName}
```

## Authentication

All endpoints require authentication via Better Auth session cookies. Some endpoints additionally require the planner role (Chair/Board).

| Endpoint    | Procedure Type       | Auth Required | Planner Required |
| ----------- | -------------------- | ------------- | ---------------- |
| `create`    | `plannerProcedure`   | ✅            | ✅               |
| `getById`   | `protectedProcedure` | ✅            | ❌               |
| `update`    | `plannerProcedure`   | ✅            | ✅               |
| `delete`    | `plannerProcedure`   | ✅            | ✅               |
| `list`      | `protectedProcedure` | ✅            | ❌               |
| `calendar`  | `protectedProcedure` | ✅            | ❌               |
| `exportCsv` | `plannerProcedure`   | ✅            | ✅               |

## Endpoints

### Create Shift

Creates a new shift with slots, skills, and tools.

**Procedure:** `shift.create`

**Input:** `ShiftCreateSchema`

```typescript
{
  location: string;        // Required, 1-200 chars
  task: string;            // Required, 1-200 chars
  description?: string;    // Optional, max 2000 chars
  notionLink?: string;     // Optional, must be notion.so URL
  startTime: Date;         // Required
  endTime: Date;           // Required, must be after startTime
  skillIds: string[];      // Optional, default []
  tools: Tool[];           // Optional, default []
  slots?: SlotInput[];     // Optional, auto-generated if not provided
}
```

**SlotInput:**

```typescript
{
  slotTime: Date; // Must be on 30-min boundary
  headcount: number; // 0-100, integer
}
```

**Output:**

```typescript
{
  ok: true;
  id: string; // UUID of created shift
}
```

**Validation Rules:**

- `endTime` must be after `startTime`
- All times must be on 30-minute boundaries
- `notionLink` must be a valid notion.so URL
- `slotTime` values must be within shift time range
- Duplicate `slotTime` values are not allowed

**Example:**

```typescript
api.shift.create.mutate({
  location: "Main Hall",
  task: "Registration Check-in",
  description: "Check in attendees at the main entrance",
  notionLink: "https://notion.so/registration-docs",
  startTime: new Date("2026-04-09T08:00:00"),
  endTime: new Date("2026-04-09T12:00:00"),
  skillIds: ["tech-support", "customer-service"],
  tools: ["car"],
  slots: [
    { slotTime: new Date("2026-04-09T08:00:00"), headcount: 2 },
    { slotTime: new Date("2026-04-09T08:30:00"), headcount: 2 },
  ],
});
```

### Get Shift by ID

Retrieves a single shift with all related data.

**Procedure:** `shift.getById`

**Input:**

```typescript
{
  id: string; // Shift UUID
}
```

**Output:**

```typescript
{
  id: string;
  location: string;
  task: string;
  description: string | null;
  notionLink: string | null;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  createdAt: Date;
  skillIds: string[];      // Array of talent IDs
  tools: Tool[];           // Array of tool values
  slots: {
    id: string;
    slotTime: Date;
    headcount: number;
  }[];
}
```

**Errors:**

- `NOT_FOUND` - Shift does not exist

**Example:**

```typescript
const { data } = api.shift.getById.useQuery({ id: "shift-uuid" });
```

### Update Shift

Updates an existing shift, replacing all slots, skills, and tools.

**Procedure:** `shift.update`

**Input:** `ShiftUpdateSchema`

```typescript
{
  id: string;              // Required, shift UUID
  location: string;        // Required, 1-200 chars
  task: string;            // Required, 1-200 chars
  description?: string;    // Optional
  notionLink?: string;     // Optional
  startTime: Date;         // Required
  endTime: Date;           // Required
  skillIds: string[];      // Optional
  tools: Tool[];           // Optional
  slots?: SlotInput[];     // Optional
}
```

**Output:**

```typescript
{
  ok: true;
}
```

**Note:** This is a full replacement update. All existing slots, skills, and tools are deleted and recreated.

**Errors:**

- `NOT_FOUND` - Shift does not exist

**Example:**

```typescript
api.shift.update.mutate({
  id: "shift-uuid",
  location: "Updated Location",
  task: "Updated Task",
  startTime: new Date("2026-04-09T09:00:00"),
  endTime: new Date("2026-04-09T13:00:00"),
  skillIds: [],
  tools: [],
});
```

### Delete Shift

Permanently removes a shift and all associated data.

**Procedure:** `shift.delete`

**Input:**

```typescript
{
  id: string; // Shift UUID
}
```

**Output:**

```typescript
{
  ok: true;
}
```

**Note:** This cascades to delete all related slots, skills, and tools.

**Errors:**

- `NOT_FOUND` - Shift does not exist

**Example:**

```typescript
api.shift.delete.mutate({ id: "shift-uuid" });
```

### List Shifts

Retrieves a paginated list of shifts with optional filtering.

**Procedure:** `shift.list`

**Input:**

```typescript
{
  cursor?: number;         // Pagination offset, default 0
  limit?: number;          // Items per page, default 20, max 50
  sortField?: "startTime" | "location" | "task" | "createdAt";
  sortDirection?: "asc" | "desc";
  location?: string;       // Filter by location (partial match)
  startDate?: Date;        // Filter: shifts starting on or after
  endDate?: Date;          // Filter: shifts starting on or before
}
```

**Output:**

```typescript
{
  items: {
    id: string;
    location: string;
    task: string;
    description: string | null;
    notionLink: string | null;
    startTime: Date;
    endTime: Date;
    createdBy: string;
    createdAt: Date;
    slotSummary: {
      totalHeadcount: number; // Sum of all slot headcounts
    }
  }
  [];
  total: number; // Total matching shifts
  nextCursor: number | null; // Next cursor for pagination
}
```

**Example:**

```typescript
const { data } = api.shift.list.useQuery({
  limit: 50,
  sortField: "startTime",
  sortDirection: "asc",
  location: "Main",
  startDate: new Date("2026-04-09"),
});
```

### Calendar View

Retrieves shifts organized by time slots for a specific day.

**Procedure:** `shift.calendar`

**Input:**

```typescript
{
  date: Date; // Must be April 9 or 10, 2026
}
```

**Output:**

```typescript
{
  slotTime: Date;
  totalHeadcount: number; // Sum of headcounts for this slot
  shifts: {
    shiftId: string;
    location: string;
    task: string;
    description: string | null;
    notionLink: string | null;
    startTime: Date;
    endTime: Date;
    headcount: number; // Headcount for this specific slot
  }
  [];
}
[];
```

**Validation:**

- Date must be April 9 or 10, 2026 (Q-Summit dates)
- Both local and UTC date interpretations are accepted

**Example:**

```typescript
const { data } = api.shift.calendar.useQuery({
  date: new Date("2026-04-09"),
});
```

### Export CSV

Exports all shift data as a CSV string.

**Procedure:** `shift.exportCsv`

**Input:** None

**Output:**

```typescript
{
  csv: string; // CSV content with UTF-8 BOM
}
```

**CSV Format:**

- Semicolon-delimited for German Excel compatibility
- UTF-8 with BOM
- One row per shift slot
- See [CSV Format](./csv-format.md) for full specification

**Example:**

```typescript
const mutation = api.shift.exportCsv.useMutation({
  onSuccess: (data) => {
    const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shifts-export.csv";
    link.click();
  },
});

mutation.mutate();
```

## Domain Types

### Tool

```typescript
type Tool = "car" | "van" | "equipment" | "none";
```

### Shift

```typescript
interface Shift {
  id: string;
  location: string;
  task: string;
  description: string | null;
  notionLink: string | null;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  createdAt: Date;
}
```

### ShiftSlot

```typescript
interface ShiftSlot {
  id: string;
  shiftId: string;
  slotTime: Date;
  headcount: number;
}
```

### ShiftSkill

```typescript
interface ShiftSkill {
  id: string;
  shiftId: string;
  talentId: string;
}
```

### ShiftTool

```typescript
interface ShiftTool {
  id: string;
  shiftId: string;
  tool: Tool;
}
```

## Error Codes

| Code                    | HTTP Status | Description             |
| ----------------------- | ----------- | ----------------------- |
| `UNAUTHORIZED`          | 401         | User not logged in      |
| `FORBIDDEN`             | 403         | User lacks planner role |
| `NOT_FOUND`             | 404         | Shift not found         |
| `BAD_REQUEST`           | 400         | Invalid input data      |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server error |

## Validation Errors

When validation fails, the error includes Zod field errors:

```typescript
{
  error: {
    code: "BAD_REQUEST",
    message: "Invalid input",
    data: {
      zodError: {
        fieldErrors: {
          endTime: ["End time must be after start time"],
          location: ["Location is required"],
        },
      },
    },
  },
}
```

## React Hook Usage

### Queries (Read)

```typescript
// Get shift by ID
const { data, isLoading, error } = api.shift.getById.useQuery(
  { id: "shift-uuid" },
  { enabled: !!id }, // Only run when ID exists
);

// List shifts
const { data, hasNextPage, fetchNextPage } = api.shift.list.useInfiniteQuery({
  limit: 20,
  sortField: "startTime",
});

// Calendar view
const { data } = api.shift.calendar.useQuery(
  { date: selectedDate },
  { enabled: viewMode === "calendar" },
);
```

### Mutations (Write)

```typescript
// Create
const create = api.shift.create.useMutation({
  onSuccess: (data) => {
    console.log("Created shift:", data.id);
  },
  onError: (error) => {
    console.error("Failed:", error.message);
  },
});

create.mutate({ location: "...", task: "...", ... });

// Update
const update = api.shift.update.useMutation();
update.mutate({ id: "...", location: "...", ... });

// Delete
const deleteMutation = api.shift.delete.useMutation();
deleteMutation.mutate({ id: "..." });

// Export
const exportCsv = api.shift.exportCsv.useMutation({
  onSuccess: (data) => {
    // Trigger download
  },
});
exportCsv.mutate();
```

## Related Documentation

- [Workflow](./workflow.md) - How to use these endpoints
- [CSV Format](./csv-format.md) - CSV export format details
- [Role Access](./role-access.md) - Authentication and authorization
- [Domain Types](../../src/domain/qsum/shifts/types.ts) - TypeScript type definitions
