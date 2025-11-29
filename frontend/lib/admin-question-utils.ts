import type { SessionQuestion } from "@/lib/types";

/**
 * Transform admin question API response into SessionQuestion format
 * that practice components expect
 */
export function transformToSessionQuestion(adminQuestion: any): SessionQuestion {
  return {
    session_question_id: adminQuestion.session_question_id || adminQuestion.id,
    question: {
      id: adminQuestion.id,
      external_id: adminQuestion.external_id,
      stem: adminQuestion.stem,
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
      id: adminQuestion.topics?.id || adminQuestion.topic_id || "",
      name: adminQuestion.topics?.name || "Unknown Topic",
      category_id: adminQuestion.topics?.categories?.id || adminQuestion.topics?.category_id || "",
      weight_in_category: adminQuestion.topics?.weight_in_category || 100,
      created_at: adminQuestion.topics?.created_at || null,
      updated_at: adminQuestion.topics?.updated_at || null,
    },
    status: adminQuestion.status || "not_started",
    display_order: adminQuestion.display_order || 1,
  };
}
