import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { slackRouter } from "@/server/api/routers/slack";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  slack: slackRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
