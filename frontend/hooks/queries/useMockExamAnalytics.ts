import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook to fetch mock exam performance data for current user
 *
 * Returns user's mock exam performance including:
 * - Recent exam scores
 * - Total count of exams
 *
 * Caches data for 5 minutes
 *
 * Note: Previously called admin endpoint, now uses user-specific endpoint
 */
export function useMockExamAnalytics() {
  return useQuery({
    queryKey: queryKeys.adminAnalytics.mockExamAnalytics(),
    queryFn: () => api.getMockExamAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
