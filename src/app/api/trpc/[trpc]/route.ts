import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      env.NODE_ENV === "development"
        ? ({
            path,
            error,
          }: {
            path?: string;
            error: TRPCError | Error | unknown;
          }) => {
            const message =
              error instanceof Error ? error.message : String(error);
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
