import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import type {
  SessionQuestion,
  SessionQuestionsResponse,
  AnswerState,
  SubmitAnswerResponse,
  AIFeedbackContent,
} from "@/lib/types";
import { api } from "@/lib/api";

export function usePracticeSession(sessionId: string) {
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackContent | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${config.apiUrl}/api/practice-sessions/${sessionId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load session");
      }

      const data: SessionQuestionsResponse = await response.json();
      const sortedQuestions = data.questions.sort(
        (a: SessionQuestion, b: SessionQuestion) =>
          a.display_order - b.display_order
      );

      setQuestions(sortedQuestions);

      const initialAnswers: Record<string, AnswerState> = {};
      sortedQuestions.forEach((q: SessionQuestion) => {
        if (q.status !== "not_started") {
          const hasUserAnswer = q.user_answer && q.user_answer.length > 0;
          const correctAnswer = q.question.correct_answer;
          const correctAnswerArray = Array.isArray(correctAnswer)
            ? correctAnswer
            : [String(correctAnswer)];

          initialAnswers[q.question.id] = {
            userAnswer: q.user_answer || [],
            status: q.status,
            isCorrect:
              hasUserAnswer && q.status === "answered"
                ? JSON.stringify(q.user_answer?.sort()) ===
                  JSON.stringify(correctAnswerArray.sort())
                : undefined,
          };
        }
      });
      setAnswers(initialAnswers);

      const firstUnanswered = sortedQuestions.findIndex(
        (q: SessionQuestion) => q.status === "not_started"
      );
      return firstUnanswered >= 0 ? firstUnanswered : 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          userAnswer: [value], // Store optionId
          status: "in_progress",
          optionId: value, // Also store separately to preserve it
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (
      questionId: string,
      userAnswer: string[],
      confidenceScore: number,
      timeSpentSeconds: number
    ) => {
      // Find the question to get the correct answer for optimistic update
      const question = questions.find((q) => q.question.id === questionId);
      if (!question) {
        console.error("Question not found for grading");
        return false;
      }

      // 1. Optimistic Grading (Client-side)
      const correctAnswer = question.question.correct_answer;
      const correctAnswerArray = Array.isArray(correctAnswer)
        ? correctAnswer
        : [String(correctAnswer)];

      // Convert userAnswer (which might be optionIds or labels) to labels for comparison
      // If answer_options exist, try to map optionIds to labels
      let userAnswerLabels = userAnswer;
      if (question.question.answer_options) {
        const options = Array.isArray(question.question.answer_options)
          ? question.question.answer_options
          : Object.entries(question.question.answer_options);
        const labels = ["A", "B", "C", "D", "E", "F"];

        userAnswerLabels = userAnswer.map((answer: string) => {
          // Check if answer is already a label (A, B, C, D)
          if (labels.includes(answer.toUpperCase())) {
            return answer.toUpperCase();
          }

          // Otherwise, try to find the label for this optionId
          const optionIndex = options.findIndex((option: unknown) => {
            const opt = option as Record<string, unknown>;
            const optArray = option as unknown[];
            const optionId = String(opt.id || optArray[0]);
            return optionId === answer;
          });

          if (optionIndex >= 0 && optionIndex < labels.length) {
            return labels[optionIndex];
          }

          return answer; // Fallback to original value
        });
      }

      // Basic grading logic: strict equality of sorted arrays
      // Note: This logic must match the backend's grading logic
      const isCorrect =
        JSON.stringify(userAnswerLabels.map(String).sort()) ===
        JSON.stringify(correctAnswerArray.map(String).sort());

      // 2. Optimistic UI Update
      // Preserve the original userAnswer (optionId) if it exists in state
      // This is important because AnswerPanel checks answer?.userAnswer[0] === optionId
      const existingAnswer = answers[questionId];
      let answerToStore = userAnswer;
      const labels = ["A", "B", "C", "D", "E", "F"];

      // Always preserve the optionId if it was stored via handleAnswerChange
      if (existingAnswer?.optionId) {
        answerToStore = [existingAnswer.optionId];
      } else if (existingAnswer?.userAnswer && existingAnswer.userAnswer[0]) {
        const existingValue = String(existingAnswer.userAnswer[0]);
        // If existing value is not a label (A-F), it's likely an optionId - preserve it
        const isLabel = labels.some(
          (label) =>
            existingValue.toUpperCase().trim() === label.toUpperCase().trim()
        );
        if (!isLabel) {
          answerToStore = existingAnswer.userAnswer;
        }
      }

      // Determine the optionId to preserve
      const preservedOptionId =
        existingAnswer?.optionId ||
        (answerToStore[0] &&
        !labels.includes(String(answerToStore[0]).toUpperCase().trim())
          ? answerToStore[0]
          : undefined);

      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          userAnswer: answerToStore, // Keep optionId for UI matching
          isCorrect: isCorrect,
          status: "answered",
          confidenceScore,
          timeSpentSeconds,
          ...(preservedOptionId && { optionId: preservedOptionId }), // Preserve optionId if we have it
        },
      }));

      // 3. Background API Sync (Fire-and-forget pattern)
      const syncWithBackend = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.access_token) return; // Should handle this better in real app

          await fetch(
            `${config.apiUrl}/api/practice-sessions/${sessionId}/questions/${questionId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_answer: userAnswer,
                status: "answered",
                confidence_score: confidenceScore,
                time_spent_seconds: timeSpentSeconds,
              }),
            }
          );
        } catch (err) {
          console.error("Background sync failed:", err);
          // Ideally, we'd add a "retry" flag or "sync error" state here
          // but for now, we just log it since the user has already moved on.
        }
      };

      syncWithBackend();

      // Return immediately so UI transitions
      return isCorrect;
    },
    [sessionId, questions] // Added questions dependency
  );

  const handleGetFeedback = useCallback(
    async (questionId: string) => {
      setLoadingFeedback(true);
      try {
        const feedbackResponse = await api.getQuestionFeedback(
          sessionId,
          questionId
        );
        setAiFeedback(feedbackResponse.feedback);
      } catch (error) {
        console.error("Failed to load feedback:", error);
      } finally {
        setLoadingFeedback(false);
      }
    },
    [sessionId]
  );

  const clearAiFeedback = useCallback(() => {
    setAiFeedback(null);
  }, []);

  const resetQuestionTimer = useCallback(() => {
    setQuestionStartTime(Date.now());
  }, []);

  const getTimeSpent = useCallback(() => {
    return Math.floor((Date.now() - questionStartTime) / 1000);
  }, [questionStartTime]);

  const handleAddSimilarQuestion = useCallback(
    async (questionId: string, topicId: string) => {
      try {
        const result = await api.addSimilarQuestion(
          sessionId,
          questionId,
          topicId
        );

        // Create a new SessionQuestion object for the similar question
        const newSessionQuestion: SessionQuestion = {
          session_question_id: result.session_question_id,
          question: {
            id: result.question.id,
            stem: result.question.stem,
            question_type: result.question.question_type,
            answer_options: result.question.answer_options,
            correct_answer: result.question.correct_answer,
            difficulty: result.question.difficulty,
            module: "math", // Default module
            topic_id: result.question.topic_id,
            external_id: result.question.id,
            source_uid: result.question.id,
            is_active: result.question.is_active,
            created_at: result.question.created_at,
            updated_at: result.question.updated_at,
          },
          topic: {
            id: result.topic.id,
            name: result.topic.name,
            category_id: result.topic.category_id,
            weight_in_category: result.topic.weight_in_category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          status: "not_started",
          display_order: result.display_order,
          is_saved: false,
        };

        // Add the new question to the end of the questions array
        setQuestions((prev) => {
          return [...prev, newSessionQuestion];
        });

        // Return the question and its index (at the end)
        return {
          question: newSessionQuestion,
          index: questions.length, // The new question will be at the end
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add similar question"
        );
        throw err;
      }
    },
    [sessionId]
  );

  const updateQuestionFlag = useCallback(
    (questionId: string, isFlagged: boolean) => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.question.id === questionId
            ? {
                ...q,
                question: {
                  ...q.question,
                  is_flagged: isFlagged,
                },
              }
            : q
        )
      );
    },
    []
  );

  return {
    questions,
    answers,
    isLoading,
    isSubmitting,
    error,
    aiFeedback,
    loadingFeedback,
    loadSession,
    handleAnswerChange,
    handleSubmit,
    handleGetFeedback,
    handleAddSimilarQuestion,
    clearAiFeedback,
    resetQuestionTimer,
    getTimeSpent,
    updateQuestionFlag,
  };
}
