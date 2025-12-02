import type { SessionQuestion } from "@/lib/types";
import { processQuestionBlanks } from "@/lib/question-utils";

interface QuestionPanelProps {
  question: SessionQuestion;
}

export function QuestionPanel({ question }: QuestionPanelProps) {
  const processedStem = processQuestionBlanks(question.question.stem || "");
  const processedStimulus = processQuestionBlanks(
    question.question.stimulus || ""
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Question Header */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              question.question.difficulty === "E"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : question.question.difficulty === "M"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {question.question.difficulty === "E"
              ? "Easy"
              : question.question.difficulty === "M"
              ? "Medium"
              : "Hard"}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {question.topic.name}
          </span>
        </div>

        {/* Question Stem */}
        <div
          className="question-stem text-lg max-w-none mb-8 text-foreground leading-relaxed font-semibold"
          dangerouslySetInnerHTML={{
            __html: processedStem,
          }}
        />

        {/* Stimulus (Passage/Context) - Only for English questions */}
        {processedStimulus && (
          <div
            className="stimulus-passage text-base max-w-none mb-10 p-6 bg-muted/50 rounded-lg border border-border text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: processedStimulus,
            }}
          />
        )}
      </div>
    </div>
  );
}
