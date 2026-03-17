# Role-Based Access Control

How access to shift planning is controlled and who can perform which actions.

## Overview

Shift planning functionality is restricted to **Chair and Board members** only. This ensures that only authorized personnel can create, modify, and export shift data for Q-Summit 2026.

## Role Hierarchy

```
┌─────────────────────────────────────┐
│  Planners (full shift access)       │  ← division = "chair" OR user.isHeadOf
│  Chair/Board + authorized heads     │
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
2. They have planner authorization: **either** their profile has `division === "chair"` **or** their user record has `isHeadOf === true`

This includes:

- **Chair/Board**: Profile `division === "chair"` (Chairman and board members)
- **Authorized heads**: Non-chair users marked as team leads via the `user.isHeadOf` flag (e.g. board members or other leads granted planner access)

### How the Role is Checked

The `useIsPlanner` hook checks both profile division and the `isHeadOf` access flag:

```typescript
// src/lib/use-is-planner.ts
export function useIsPlanner(): { isPlanner: boolean; isLoading: boolean } {
  const { data, isLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isPlanner = (data?.profile?.division === "chair" || data?.user?.isHeadOf === true) ?? false;

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

| Procedure            | Authentication | Authorization                             | Use Case                          |
| -------------------- | -------------- | ----------------------------------------- | --------------------------------- |
| `publicProcedure`    | None           | None                                      | Public data (not used for shifts) |
| `protectedProcedure` | Required       | None                                      | Authenticated users can access    |
| `plannerProcedure`   | Required       | `division === "chair"` or `user.isHeadOf` | Planners only                     |

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

The `plannerProcedure` is built on `protectedProcedure` and uses middleware to enforce planner access via `division === "chair"` or `user.isHeadOf`:

```typescript
// src/server/api/trpc.ts
const plannerMiddleware = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.session.user.id;

  const [profile, userRow] = await Promise.all([
    ctx.db.query.memberProfile.findFirst({
      where: eq(memberProfile.userId, userId),
    }),
    ctx.db.select({ isHeadOf: user.isHeadOf }).from(user).where(eq(user.id, userId)).limit(1),
  ]);

  const isHeadOf = userRow[0]?.isHeadOf ?? false;
  const isPlanner = profile?.division === "chair" || isHeadOf;

  if (!isPlanner) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only Chair/Board members or heads can access shift planning",
    });
  }

  return next({ ctx });
});

export const plannerProcedure = protectedProcedure.use(plannerMiddleware);
```

## UI-Level Protection

### Conditional Rendering

UI components check the planner role before showing controls:

```typescript
// In ShiftManager component
const { data: profileData, isLoading: isProfileLoading } = api.profile.getMy.useQuery(...);
const isPlanner =
  (profileData?.profile?.division === "chair" || profileData?.user?.isHeadOf === true) ?? false;

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
    "message": "Only Chair/Board members or heads can access shift planning"
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

Planner access is determined by two places:

- **Profile**: `member_profile.division` — `"chair"` grants planner access (Chair/Board).
- **User**: `user.isHeadOf` — when `true`, grants planner access (authorized heads / team leads).

| Location         | Column     | Type    | Description                                   |
| ---------------- | ---------- | ------- | --------------------------------------------- |
| `member_profile` | `division` | string  | Role/division ("chair", "operations", etc.)   |
| `user`           | `isHeadOf` | boolean | When true, user is a planner (e.g. team lead) |

### Updating a User's Role

To grant planner access, use either (or both):

1. **Chair/Board**: Set profile division to `'chair'`:

```sql
UPDATE member_profile
SET division = 'chair'
WHERE user_id = 'user-uuid-here';
```

2. **Head / team lead**: Set the user's `isHeadOf` flag:

```sql
UPDATE user
SET isHeadOf = 1
WHERE id = 'user-uuid-here';
```

The user may need to log out and log back in for changes to take effect.

**Note:** Only admins should be able to modify roles. This is typically done through an admin interface or database directly.

## Troubleshooting Access Issues

| Problem                                        | Cause                                              | Solution                                  |
| ---------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| "Only Chair/Board members or heads can access" | User not planner (no chair division, not isHeadOf) | Contact admin to set division or isHeadOf |
| "You must be logged in"                        | Session expired                                    | Log in again                              |
| Create button not visible                      | Not a planner or still loading                     | Wait for profile to load, or check role   |
| Export button not visible                      | Not in list view or not a planner                  | Switch to list view, verify role          |

## Related Documentation

- [Workflow](./workflow.md) - How to use shift planning features
- [CSV Format](./csv-format.md) - Export format specification
- [API Reference](./api-reference.md) - Technical endpoint details
- [Authentication](../guides/flows/login-flow.md) - General auth documentation
