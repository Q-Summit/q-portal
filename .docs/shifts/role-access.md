# Role-Based Access Control

How access to shift planning is controlled and who can perform which actions.

## Overview

Shift planning functionality is restricted to **Chair and Board members** only. This ensures that only authorized personnel can create, modify, and export shift data for Q-Summit 2026.

## Role Hierarchy

```
┌─────────────────────────────────────┐
│           Chair/Board               │  ← Full shift planning access
│         (division = "chair")          │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Other Divisions             │  ← Read-only access (view shifts)
│    (operations, marketing, etc.)    │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│           Not Logged In             │  ← No access (redirected to login)
└─────────────────────────────────────┘
```

## Planner Role

### Who is a Planner?

A user is considered a **planner** if:

1. They are logged in (authenticated)
2. Their profile has `division === "chair"`

This includes:

- **Chairman**: The event chair
- **Board Members**: Members of the organizing board

### How the Role is Checked

The `useIsPlanner` hook checks the user's profile:

```typescript
// src/lib/use-is-planner.ts
export function useIsPlanner(): { isPlanner: boolean; isLoading: boolean } {
  const { data, isLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isPlanner = data?.profile?.division === "chair";

  return { isPlanner, isLoading };
}
```

This hook is used in components to conditionally show planner-only features.

## Access Matrix

| Feature                    | Chair/Board | Other Divisions | Not Logged In |
| -------------------------- | ----------- | --------------- | ------------- |
| **View Shifts (List)**     | ✅ Yes      | ✅ Yes          | ❌ No         |
| **View Shifts (Calendar)** | ✅ Yes      | ✅ Yes          | ❌ No         |
| **Create Shift**           | ✅ Yes      | ❌ No           | ❌ No         |
| **Edit Shift**             | ✅ Yes      | ❌ No           | ❌ No         |
| **Delete Shift**           | ✅ Yes      | ❌ No           | ❌ No         |
| **Export CSV**             | ✅ Yes      | ❌ No           | ❌ No         |

## API-Level Protection

### Procedure Types

The tRPC router uses different procedure types to enforce access control:

| Procedure            | Authentication | Authorization          | Use Case                          |
| -------------------- | -------------- | ---------------------- | --------------------------------- |
| `publicProcedure`    | None           | None                   | Public data (not used for shifts) |
| `protectedProcedure` | Required       | None                   | Authenticated users can access    |
| `plannerProcedure`   | Required       | `division === "chair"` | Planners only                     |

### Protected Endpoints

**Planner-only endpoints** (require `plannerProcedure`):

```typescript
// shiftRouter
{
  create: plannerProcedure,      // Create new shifts
  update: plannerProcedure,      // Edit existing shifts
  delete: plannerProcedure,      // Delete shifts
  exportCsv: plannerProcedure,   // Export CSV data
}
```

**Authenticated endpoints** (require `protectedProcedure`):

```typescript
// shiftRouter
{
  getById: protectedProcedure,   // View single shift
  list: protectedProcedure,      // List all shifts
  calendar: protectedProcedure,    // Calendar view data
}
```

### Middleware Implementation

The `plannerProcedure` uses middleware to enforce access:

```typescript
// src/server/api/trpc.ts
const plannerMiddleware = t.middleware(async ({ ctx, next }) => {
  // Check authentication
  if (!ctx?.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  const userId = ctx.session.user.id;

  // Get user's profile
  const profile = await ctx.db.query.memberProfile.findFirst({
    where: eq(memberProfile.userId, userId),
  });

  // Check division
  if (profile?.division !== "chair") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only Chair/Board members can access shift planning",
    });
  }

  return next({ ctx });
});

export const plannerProcedure = t.procedure.use(loggerMiddleware).use(plannerMiddleware);
```

## UI-Level Protection

### Conditional Rendering

UI components check the planner role before showing controls:

```typescript
// In ShiftManager component
const { data: profileData, isLoading: isProfileLoading } = api.profile.getMy.useQuery(...);
const isPlanner = profileData?.profile?.division === "chair";

// Only show Create button to planners
{isPlanner && (
  <Button onClick={() => setIsCreateModalOpen(true)}>
    <Plus className="h-4 w-4" />
    Create
  </Button>
)}

// Only show Export button to planners (and only in list view)
{isPlanner && viewMode === "list" && <CsvExportButton />}
```

### What Non-Planners See

Non-planners accessing the shifts page see:

- ✅ List of all shifts
- ✅ Calendar view with shift distribution
- ✅ Shift details (location, task, time, headcount)
- ❌ No "Create" button
- ❌ No "Edit" or "Delete" actions
- ❌ No "Export" button

## Error Handling

### API Errors

When a non-planner tries to access planner-only endpoints:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Only Chair/Board members can access shift planning"
  }
}
```

When an unauthenticated user tries to access any shift endpoint:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action"
  }
}
```

### UI Feedback

- **Create button hidden**: Non-planners don't see the button at all
- **Export button hidden**: Only visible in list view to planners
- **Error banners**: Show if data fails to load due to permissions

## Security Considerations

### Defense in Depth

Access control is enforced at multiple layers:

1. **UI Layer**: Buttons hidden from non-planners
2. **API Layer**: Middleware rejects unauthorized requests
3. **Database Layer**: No direct access; all queries go through API

### Why Not Just UI-Level?

Hiding buttons in the UI is not enough because:

- Users could inspect network requests
- Direct API calls bypass the UI
- Security must be enforced server-side

### Session Validation

Every API request validates the session:

```typescript
const session = await auth.api.getSession({ headers: opts.headers });
```

Sessions are:

- Encrypted and tamper-proof
- Validated on every request
- Expire after a period of inactivity

## Changing Roles

### How Roles Are Assigned

Roles are stored in the `memberProfile` table:

| Column     | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| `userId`   | string | Link to user account                        |
| `division` | string | Role/division ("chair", "operations", etc.) |

### Updating a User's Role

To grant planner access:

1. Update the user's profile in the database:

```sql
UPDATE member_profile
SET division = 'chair'
WHERE user_id = 'user-uuid-here';
```

2. The user must log out and log back in for changes to take effect

**Note:** Only admins should be able to modify roles. This is typically done through an admin interface or database directly.

## Troubleshooting Access Issues

| Problem                               | Cause                             | Solution                                |
| ------------------------------------- | --------------------------------- | --------------------------------------- |
| "Only Chair/Board members can access" | User not in chair division        | Contact admin to update role            |
| "You must be logged in"               | Session expired                   | Log in again                            |
| Create button not visible             | Not a planner or still loading    | Wait for profile to load, or check role |
| Export button not visible             | Not in list view or not a planner | Switch to list view, verify role        |

## Related Documentation

- [Workflow](./workflow.md) - How to use shift planning features
- [CSV Format](./csv-format.md) - Export format specification
- [API Reference](./api-reference.md) - Technical endpoint details
- [Authentication](../api/authentication.md) - General auth documentation
