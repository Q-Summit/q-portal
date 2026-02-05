"use client";

import { useState } from "react";
import { createTRPCMsw } from "msw-trpc";
import { httpLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";

import { api } from "@/server/api/client";
import type { AppRouter } from "@/server/api/root";

/**
 * Get the tRPC API URL for Storybook.
 * Uses relative path so MSW can intercept requests.
 */
function getUrl() {
  return "/api/trpc";
}

/**
 * Typed MSW handlers for tRPC endpoints.
 *
 * Use this with msw-trpc to create type-safe mock handlers in Storybook stories.
 *
 * @example
 * ```ts
 * trpcMsw.example.hello.query(() => ({ greeting: 'Hello!' }))
 * ```
 */
export const trpcMsw = createTRPCMsw<AppRouter>({
  baseUrl: getUrl(),
  transformer: { input: superjson, output: superjson },
});

/**
 * tRPC Provider for Storybook.
 *
 * Provides tRPC context and React Query client for components in Storybook.
 * Configured to work with MSW for request interception.
 */
export function TRPCReactProviderStorybook(props: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            throwOnError: false,
          },
          mutations: {
            throwOnError: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpLink({
          url: getUrl(),
          transformer: superjson,
          headers() {
            return {
              "content-type": "application/json",
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
