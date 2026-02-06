import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc"; // Adjust path if needed

/**
 * Server-side caller for tRPC.
 * Use this in Server Components, Server Actions, or Metadata functions.
 */
export const api = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  const ctx = await createTRPCContext({
    headers: heads,
  });

  return appRouter.createCaller(ctx);
});
