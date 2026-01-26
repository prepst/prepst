import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type {
  AddVocabManualRequest,
  AddVocabFromSelectionRequest,
  AddVocabFromPopularRequest,
  UpdateVocabRequest,
} from "@/lib/types";

/**
 * Hook to add a vocabulary word manually with user-provided definition
 */
export function useAddVocabManually() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddVocabManualRequest) => api.addVocabManually(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabulary.all });
      toast.success(`Added "${data.word}" to your vocabulary`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add vocabulary word");
    },
  });
}

/**
 * Hook to add a vocabulary word from text selection with AI-generated definition
 */
export function useAddVocabFromSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddVocabFromSelectionRequest) => api.addVocabFromSelection(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabulary.all });
      toast.success(`Added "${data.word}" to your vocabulary`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add vocabulary word");
    },
  });
}

/**
 * Hook to add a vocabulary word from popular SAT vocab list
 */
export function useAddVocabFromPopular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddVocabFromPopularRequest) => api.addVocabFromPopular(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabulary.all });
      toast.success(`Added "${data.word}" to your vocabulary`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add vocabulary word");
    },
  });
}

/**
 * Hook to update a vocabulary word (toggle mastered, edit definition, etc.)
 */
export function useUpdateVocab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wordId, data }: { wordId: string; data: UpdateVocabRequest }) =>
      api.updateVocab(wordId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabulary.all });
      if (data.is_mastered !== undefined) {
        toast.success(data.is_mastered ? "Marked as mastered!" : "Marked as not mastered");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vocabulary word");
    },
  });
}

/**
 * Hook to delete a vocabulary word
 */
export function useDeleteVocab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wordId: string) => api.deleteVocab(wordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabulary.all });
      toast.success("Removed from vocabulary");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vocabulary word");
    },
  });
}
