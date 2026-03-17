"use client";

import { api } from "@/server/api/client";

/**
 * Hook to check if the current user is a planner (can access shift management).
 * Uses isHeadOf access flag and division === "chair" so Chair, Board, and authorized heads are included.
 */
export function useIsPlanner(): { isPlanner: boolean; isLoading: boolean } {
  const { data, isLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isPlanner = (data?.profile?.division === "chair" || data?.user?.isHeadOf === true) ?? false;

  return { isPlanner, isLoading };
}
