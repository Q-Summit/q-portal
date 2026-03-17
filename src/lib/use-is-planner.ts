"use client";

import { api } from "@/server/api/client";

/**
 * Hook to check if the current user is a planner (Chair/Board member).
 * Planners have division === "chair" in their profile.
 */
export function useIsPlanner(): { isPlanner: boolean; isLoading: boolean } {
  const { data, isLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isPlanner = data?.profile?.division === "chair";

  return { isPlanner, isLoading };
}
