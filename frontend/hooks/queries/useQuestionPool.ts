import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface QuestionPoolFilters {
    section?: 'math' | 'reading_writing';
    difficulty?: 'E' | 'M' | 'H';
    topicId?: string;
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * Hook to browse questions in the question pool
 */
export function useQuestionPool(params: QuestionPoolFilters) {
    return useQuery({
        queryKey: ["question-pool", params],
        queryFn: () => api.browseQuestions({
            section: params.section,
            difficulty: params.difficulty,
            topicId: params.topicId,
            categoryId: params.categoryId,
            search: params.search,
            limit: params.limit || 20,
            offset: params.offset || 0,
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to get topics summary with question counts
 */
export function useTopicsSummary(section?: 'math' | 'reading_writing') {
    return useQuery({
        queryKey: ["topics-summary", section],
        queryFn: () => api.getTopicsSummary(section),
        staleTime: 10 * 60 * 1000, // 10 minutes - this data rarely changes
    });
}
