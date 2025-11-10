import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { createTRPCContext } from "./trpc";
import { appRouter } from "./root";

/**
 * Get the tRPC caller for the current request.
 * Uses React's `cache()` to deduplicate calls within the same request.
 *
 * This is the official tRPC pattern for Next.js 16 server components.
 * The caller is cached per request, so multiple calls are efficient.
 *
 * @example
 * ```ts
 * import { api } from "@/server/api/server";
 *
 * export default async function Page() {
 *   const caller = await api();
 *   const data = await caller.example.hello({ text: "from tRPC" });
 *   return <div>{data.greeting}</div>;
 * }
 * ```
 */
export const api = cache(async () => {
  const headersList = await headers();
  const ctx = createTRPCContext({ headers: headersList });
  return appRouter.createCaller(ctx);
});
