import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { profileRouter } from "./routers/profile";
import { shiftRouter } from "./routers/shift";
import { slackRouter } from "./routers/slack";

export const appRouter = createTRPCRouter({
  profile: profileRouter,
  shift: shiftRouter,
  slack: slackRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
