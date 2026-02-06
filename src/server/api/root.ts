import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { slackRouter } from "./routers/slack";
import { profileRouter } from "./routers/profile";

export const appRouter = createTRPCRouter({
  slack: slackRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
