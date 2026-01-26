import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { DifficultyLevel } from "@/lib/types";

interface PopularVocabParams {
  difficulty?: DifficultyLevel;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch popular SAT vocabulary words
 *
 * @param params - Optional filters for popular vocabulary
 *
 * Returns curated SAT vocabulary words
 * Caches data for 10 minutes (relatively static data)
 */
export function usePopularVocab(params?: PopularVocabParams) {
  return useQuery({
    queryKey: queryKeys.vocabulary.popular(params),
    queryFn: () => api.getPopularVocab(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
