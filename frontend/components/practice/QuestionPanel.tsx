import type { SessionQuestion } from "@/lib/types";
import { processQuestionBlanks } from "@/lib/question-utils";
import { Badge } from "@/components/ui/badge";

interface QuestionPanelProps {
  question: SessionQuestion;
}

export function QuestionPanel({ question }: QuestionPanelProps) {
  const processedStem = processQuestionBlanks(question.question.stem || "");
  const processedStimulus = processQuestionBlanks(
    question.question.stimulus || ""
  );

  const difficultyColor =
    question.question.difficulty === "E"
      ? "bg-emerald-500"
      : question.question.difficulty === "M"
      ? "bg-amber-500"
      : "bg-rose-500";

  const difficultyLabel =
    question.question.difficulty === "E"
      ? "Easy"
      : question.question.difficulty === "M"
      ? "Medium"
      : "Hard";

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Question Meta */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="pl-2 pr-3 py-1 gap-2 border-border bg-card text-foreground font-medium">
            <div className={`w-1.5 h-1.5 rounded-full ${difficultyColor}`} />
            {difficultyLabel}
          </Badge>
          <span className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
            {question.topic.name}
          </span>
        </div>

        {/* Stimulus (Passage/Context) */}
        {processedStimulus && (
          <div className="relative pl-6 border-l-4 border-primary/20">
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: processedStimulus,
              }}
            />
          </div>
        )}

        {/* Question Stem */}
        <div
          className="prose prose-xl dark:prose-invert max-w-none text-foreground font-medium leading-relaxed tracking-tight"
          dangerouslySetInnerHTML={{
            __html: processedStem,
          }}
        />
      </div>
    </div>
  );
}
