import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook to create a new drill session for multiple topics
 *
 * Shows toast notifications for success/error states
 * Returns session ID on success for navigation
 */
export function useCreateDrillSession() {
  return useMutation({
    mutationFn: ({ topicIds, questionsPerTopic = 3 }: { topicIds: string[]; questionsPerTopic?: number }) =>
      api.createDrillSession(topicIds, questionsPerTopic),
    onSuccess: (data) => {
      toast.success(`Drill session created with ${data.num_questions} questions`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create drill session');
    },
  });
}
