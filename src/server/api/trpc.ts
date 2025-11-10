import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
  };
};

const t = initTRPC.context<ReturnType<typeof createTRPCContext>>().create({
  transformer: superjson,
  errorFormatter({
    shape,
    error,
  }: {
    shape: { data?: Record<string, unknown> };
    error: { cause?: unknown };
  }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
