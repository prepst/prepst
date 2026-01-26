import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { VocabSource } from "@/lib/types";

interface VocabularyParams {
  mastered?: boolean;
  source?: VocabSource;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch user's vocabulary words
 *
 * @param params - Optional filters for vocabulary
 *
 * Returns the user's saved vocabulary words with AI-generated definitions
 * Caches data for 1 minute (relatively dynamic as users add/update words)
 */
export function useVocabulary(params?: VocabularyParams) {
  return useQuery({
    queryKey: queryKeys.vocabulary.list(params),
    queryFn: () => api.getVocabulary(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
