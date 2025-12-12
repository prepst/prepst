import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UseAdminQuestionsParams {
  search?: string;
  module?: string;
  difficulty?: string;
  question_type?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch admin questions list with filters
 */
export function useAdminQuestions(params: UseAdminQuestionsParams) {
  return useQuery({
    queryKey: ["admin-questions", params],
    queryFn: () => api.listQuestions({
      search: params.search || undefined,
      module: params.module === "all" ? undefined : params.module,
      difficulty: params.difficulty === "all" ? undefined : params.difficulty,
      question_type: params.question_type === "all" ? undefined : params.question_type,
      is_active: params.is_active === undefined ? undefined : params.is_active,
      limit: params.limit,
      offset: params.offset,
    }),
  });
}

/**
 * Hook to toggle question active status
 */
export function useToggleQuestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, isActive }: { questionId: string; isActive: boolean }) =>
      api.updateQuestion(questionId, { is_active: isActive }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      toast.success(
        `Question ${variables.isActive ? "enabled" : "disabled"} successfully`
      );
    },
    onError: (error) => {
      toast.error("Failed to update question status");
      console.error("Error toggling question status:", error);
    },
  });
}

/**
 * Hook to get question detail
 */
export function useAdminQuestionDetail(questionId: string) {
  return useQuery({
    queryKey: ["admin-question-detail", questionId],
    queryFn: () => api.getQuestionDetail(questionId),
    enabled: !!questionId,
  });
}

/**
 * Hook to update question
 */
export function useUpdateQuestion(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => api.updateQuestion(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-question-detail", questionId] });
      toast.success("Question updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update question");
      console.error("Error updating question:", error);
    },
  });
}
