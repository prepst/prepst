import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch user's saved/bookmarked questions
 *
 * @param limit - Number of saved questions to fetch (default: 50)
 *
 * Returns questions the user has saved for later review
 * Caches data for 2 minutes (more dynamic as users save/unsave)
 */
export function useSavedQuestions(limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.practice.savedQuestions(limit),
    queryFn: () => api.getSavedQuestions(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - more dynamic data
  });
}