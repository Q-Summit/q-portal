# src/server/api/

## OVERVIEW

tRPC v11 backend router layer for Next.js. Aggregates domain routers into a unified appRouter.

## WHERE TO LOOK

| File                 | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `root.ts`            | AppRouter aggregation. Import and register all routers here. |
| `trpc.ts`            | tRPC init, context factory, procedure builders               |
| `routers/*.ts`       | Domain routers (profile, slack)                              |
| `routers/__tests__/` | Integration tests for routers                                |
| `client.tsx`         | React tRPC client provider                                   |
| `server.ts`          | Server-side caller factory                                   |

## CONVENTIONS

**Router Pattern:**

```typescript
export const fooRouter = createTRPCRouter({
  getById: publicProcedure.input(z.object({ id: z.string() })).query(...),
  create: protectedProcedure.input(CreateSchema).mutation(...),
});
```

**Procedure Types:**

- `publicProcedure` — no auth required
- `protectedProcedure` — requires valid session (via authMiddleware)

**Input Validation:**

- Always use Zod schemas via `.input(Schema)`
- Reuse domain schemas from `@/domain/qsum/*`
- Custom error messages: `z.string().min(1, "Required")`

**Adding a Router:**

1. Create `routers/newRouter.ts`
2. Import and register in `root.ts`: `new: newRouter`
3. Export type updates automatically via `AppRouter`

## ANTI-PATTERNS

- ❌ Manual auth checks in procedures — use `protectedProcedure`
- ❌ Inline Zod schemas — extract to domain layer
- ❌ Direct DB access without context — use `ctx.db`
- ❌ Throwing raw errors — use `TRPCError` with proper codes

## TESTING

- Integration tests in `routers/__tests__/*.integration.test.ts`
- Use `createTRPCContext` + `appRouter.createCaller(ctx)` for caller-based testing
- Mock external services (Slack, etc.) before importing routers
- See `slack.integration.test.ts` for mocking patterns
