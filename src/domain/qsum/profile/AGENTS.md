Profile Domain Module

## OVERVIEW

DDD-style domain layer for profile logic. Types, constants, and validation isolated from server implementation.

## STRUCTURE

```
profile/
├── index.ts       # Re-exports all public API
├── constants.ts   # STATUS_OPTIONS, DIVISION_OPTIONS, TEAMS_BY_DIVISION, TALENT_*
├── types.ts       # Status, Division, Team, MemberProfile, Talent
└── validation.ts  # ProfileUpdateSchema, ProfileEditSchema, normalize*
```

## CONVENTIONS

**Separation of concerns:** Domain types and validation live here, server logic in `src/server/`.

**Export pattern:** `index.ts` re-exports from individual files — import from `@/domain/qsum/profile`, not sub-files.

**Zod schemas:** `ProfileUpdateSchema` and `ProfileEditSchema` for tRPC input validation.

**Normalizers:** `normalizeProfileInput()` and `normalizeProfileEditInput()` transform validated input to DB format.

**Constants:** STATUS_OPTIONS, DIVISION_OPTIONS, TEAMS_BY_DIVISION for UI selects.

## USAGE

```typescript
// Import from domain, not sub-files
import {
  ProfileUpdateSchema,
  normalizeProfileInput,
  STATUS_OPTIONS,
  type ProfileUpdateInput,
  type MemberProfile,
} from "@/domain/qsum/profile";

// Use in tRPC router
protectedProcedure.input(ProfileUpdateSchema).mutation(({ ctx, input }) => {
  const dbValues = normalizeProfileInput(userId, input);
});

// Reference constants for UI
const statusOptions = STATUS_OPTIONS;
```

## ANTI-PATTERNS

- ❌ Importing from sub-files directly — use `@/domain/qsum/profile`
- ❌ Defining types in server code — keep in domain layer
- ❌ Duplicating Zod schemas in routers — import from validation
- ❌ Magic strings — use constants (STATUS_OPTIONS, DIVISION_OPTIONS)
