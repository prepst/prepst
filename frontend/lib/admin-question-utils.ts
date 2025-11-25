import type { SessionQuestion } from "@/lib/types";

/**
 * Transform admin question API response into SessionQuestion format
 * that practice components expect
 */
export function transformToSessionQuestion(adminQuestion: any): SessionQuestion {
  return {
    question: {
      id: adminQuestion.id,
      external_id: adminQuestion.external_id,
      stem: adminQuestion.stem,
      prompt: adminQuestion.prompt,
      stimulus: adminQuestion.stimulus,
      answer_options: adminQuestion.answer_options,
      correct_answer: adminQuestion.correct_answer,
      question_type: adminQuestion.question_type,
      difficulty: adminQuestion.difficulty,
      module: adminQuestion.module,
      rationale: adminQuestion.rationale,
      acceptable_answers: adminQuestion.acceptable_answers,
    },
    topic: {
      id: adminQuestion.topics?.id || adminQuestion.topic_id,
      name: adminQuestion.topics?.name || "Unknown Topic",
      category: {
        id: adminQuestion.topics?.categories?.id || "",
        name: adminQuestion.topics?.categories?.name || "",
      },
    },
  };
}
