import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { memberProfile } from "@/server/db/schema";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Better Auth: get session from headers (cookie)
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    headers: opts.headers,
    db,
    session, // null if not logged in
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  allowOutsideOfServer: process.env.NODE_ENV === "test",
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  if (result.ok) {
    console.log(`[tRPC] ${type} ${path} took ${durationMs}ms`);
  } else {
    console.error(`[tRPC] ${type} ${path} FAILED [${result.error.code}] after ${durationMs}ms`);
  }

  return result;
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // Better Auth sessions usually contain 'user' and 'session' objects
  if (!ctx?.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  return next({
    ctx: {
      // This spreads the existing context and overrides session
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(loggerMiddleware).use(authMiddleware);

const plannerMiddleware = t.middleware(async ({ ctx, next }) => {
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

  // Chair (division = 'chair') can access - includes Chairman AND Board
  if (profile?.division !== "chair") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only Chair/Board members can access shift planning",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

export const plannerProcedure = t.procedure.use(loggerMiddleware).use(plannerMiddleware);
