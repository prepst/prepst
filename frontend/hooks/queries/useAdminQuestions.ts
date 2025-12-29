import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UseAdminQuestionsParams {
  search?: string;
  module?: string;
  difficulty?: string;
  question_type?: string;
  is_active?: boolean;
  is_flagged?: boolean;
  has_png_in_stem?: boolean;
  has_png_in_answers?: boolean;
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
      is_flagged: params.is_flagged === undefined ? undefined : params.is_flagged,
      has_png_in_stem: params.has_png_in_stem === undefined ? undefined : params.has_png_in_stem,
      has_png_in_answers: params.has_png_in_answers === undefined ? undefined : params.has_png_in_answers,
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
 * Hook to toggle question flag status
 */
export function useToggleQuestionFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => api.toggleQuestionFlag(questionId),
    onSuccess: (data) => {
      // Invalidate both admin questions and practice session queries
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["practice-session"] });
    },
    onError: (error) => {
      toast.error("Failed to toggle question flag");
      console.error("Error toggling question flag:", error);
    },
  });
}

/**
 * Hook to update question
 */
export function useUpdateQuestion(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => api.updateQuestion(questionId, updates),
    onSuccess: async () => {
      // Invalidate and refetch queries to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-question-detail", questionId] });
      // Force refetch the question detail to ensure latest data
      await queryClient.refetchQueries({ queryKey: ["admin-question-detail", questionId] });
      toast.success("Question updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update question");
      console.error("Error updating question:", error);
    },
  });
}
