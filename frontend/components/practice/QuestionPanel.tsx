import type { SessionQuestion } from "@/lib/types";
import { processQuestionBlanks, formatTopicName } from "@/lib/question-utils";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface QuestionPanelProps {
  question: SessionQuestion;
  compact?: boolean;
  isPinned?: boolean;
}

export function QuestionPanel({
  question,
  compact = false,
  isPinned = false,
}: QuestionPanelProps) {
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
    <div
      className={`flex-1 overflow-y-auto ${compact ? "p-6" : isPinned ? "py-8 px-8 lg:py-12" : "py-8 pl-[250px] pr-0 lg:py-12"
        }`}
    >
      <div
        className={`${compact ? "max-w-full" : "max-w-3xl"} mx-auto space-y-8`}
      >
        {/* Question Meta */}
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="pl-2 pr-3 py-1 gap-2 border-border bg-card text-foreground font-medium"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${difficultyColor}`} />
            {difficultyLabel}
          </Badge>
          <Badge
            variant="outline"
            className="pl-2 pr-3 py-1 gap-1.5 border-border bg-card text-foreground font-medium"
          >
            <Tag className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm">
              {formatTopicName(question.topic.name)}
            </span>
          </Badge>
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
