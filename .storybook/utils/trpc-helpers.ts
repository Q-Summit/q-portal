/**
 * Helper utilities for creating tRPC MSW handlers in Storybook stories.
 * Type-safe wrappers so stories don't need to touch trpcMsw internals.
 */

import type { AppRouter } from "../../src/server/api/root";
import { http, HttpResponse } from "msw";
import { trpcMsw } from "../../src/trpc/msw";

/**
 * Type-safe helper to create a query handler for a tRPC endpoint.
 *
 * @example
 * trpcQuery('example', 'hello', () => ({ greeting: 'Hello!' }))
 */
function createTRPCQueryHandler<T extends keyof AppRouter>(
  router: T,
  procedure: keyof AppRouter[T],
  handler: () => unknown,
) {
  const routerInstance = trpcMsw[router] as Record<
    string,
    { query?: (fn: () => unknown) => unknown }
  >;
  const procedureInstance = routerInstance?.[procedure as string];

  if (!procedureInstance?.query) {
    throw new Error(
      `Invalid tRPC endpoint: ${String(router)}.${String(procedure)}. ` +
        "Make sure it exists in your AppRouter and is a query procedure.",
    );
  }

  return procedureInstance.query(handler);
}

/**
 * Type-safe helper to create a mutation handler for a tRPC endpoint.
 *
 * @example
 * trpcMutation('example', 'submit', ({ input }) => result)
 */
function createTRPCMutationHandler<T extends keyof AppRouter>(
  router: T,
  procedure: keyof AppRouter[T],
  handler: (args: { input: unknown }) => unknown,
) {
  const routerInstance = trpcMsw[router] as Record<
    string,
    { mutation?: (fn: (args: { input: unknown }) => unknown) => unknown }
  >;
  const procedureInstance = routerInstance?.[procedure as string];

  if (!procedureInstance?.mutation) {
    throw new Error(
      `Invalid tRPC endpoint: ${String(router)}.${String(procedure)}. ` +
        "Make sure it exists in your AppRouter and is a mutation procedure.",
    );
  }

  return procedureInstance.mutation(handler);
}

/**
 * Shorthand for creating query handlers.
 *
 * @example
 * trpcQuery('example', 'hello', () => ({ greeting: 'Hello from story' }))
 */
export function trpcQuery<T extends keyof AppRouter>(
  router: T,
  procedure: keyof AppRouter[T],
  handler: () => unknown,
) {
  return createTRPCQueryHandler(router, procedure, handler);
}

/**
 * Shorthand for creating mutation handlers.
 *
 * @example
 * trpcMutation('example', 'submit', ({ input }) => result)
 */
export function trpcMutation<T extends keyof AppRouter>(
  router: T,
  procedure: keyof AppRouter[T],
  handler: (args: { input: unknown }) => unknown,
) {
  return createTRPCMutationHandler(router, procedure, handler);
}

/**
 * Returns an MSW handler that responds with a tRPC-shaped error (500).
 * Use for Error State stories. Matches POST /api/trpc when the request body path equals router.procedure.
 *
 * @example
 * trpcQueryError('example', 'hello', 'Failed to fetch')
 */
export function trpcQueryError<T extends keyof AppRouter>(
  router: T,
  procedure: keyof AppRouter[T],
  message = "Request failed",
) {
  const path = `${String(router)}.${String(procedure)}`;
  return http.post("*/api/trpc", async ({ request }) => {
    let body: { id?: number; json?: { params?: { path?: string } } };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return undefined;
    }
    if (body?.json?.params?.path !== path) {
      return undefined;
    }
    return HttpResponse.json(
      {
        id: body.id ?? null,
        error: {
          message,
          code: -32603,
          data: {
            code: "INTERNAL_SERVER_ERROR",
            httpStatus: 500,
          },
        },
      },
      { status: 500 },
    );
  });
}
