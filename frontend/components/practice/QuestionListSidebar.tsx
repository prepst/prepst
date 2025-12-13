import { X, Check, Flag } from "lucide-react";
import type { SessionQuestion, AnswerState } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTopicName } from "@/lib/question-utils";

interface QuestionListSidebarProps {
  questions: SessionQuestion[];
  answers: Record<string, AnswerState>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export function QuestionListSidebar({
  questions,
  answers,
  currentIndex,
  onNavigate,
  onClose,
}: QuestionListSidebarProps) {
  return (
    <div className="w-[400px] border-r border-border bg-background/95 backdrop-blur-xl flex flex-col h-full shadow-xl z-20">
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Question Navigator
          </h3>
          <p className="text-xs text-muted-foreground">
            {questions.length} questions total
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {questions.map((question, index) => {
          const answer = answers[question.question.id];
          const isCurrent = index === currentIndex;
          const isAnswered = answer?.status === "answered";
          const isCorrect = answer?.isCorrect === true;
          const isWrong = answer?.isCorrect === false;
          const isMarked = answer?.isMarkedForReview;

          return (
            <button
              key={question.question.id}
              onClick={() => onNavigate(index)}
              className={`
                group w-full p-3 rounded-xl text-left transition-all duration-200 border
                ${
                  isCurrent
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : isMarked
                    ? "border-orange-500/30 bg-orange-500/5"
                    : isCorrect
                    ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                    : isWrong
                    ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                    : isAnswered
                    ? "border-border bg-muted/30 hover:bg-muted/50"
                    : "border-transparent hover:bg-accent hover:border-border"
                }
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-medium transition-colors
                    ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isAnswered
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-medium truncate ${
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {formatTopicName(question.topic.name)}
                    </span>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`
                        text-[10px] px-1.5 py-0.5 rounded font-medium
                        ${
                          question.question.difficulty === "E"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : question.question.difficulty === "M"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }
                      `}
                      >
                        {question.question.difficulty === "E"
                          ? "Easy"
                          : question.question.difficulty === "M"
                          ? "Medium"
                          : "Hard"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="shrink-0 flex items-center gap-1">
                  {isMarked && (
                    <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                  )}
                  {isCorrect && <Check className="w-4 h-4 text-green-500" />}
                  {isWrong && <X className="w-4 h-4 text-destructive" />}
                  {isCurrent && !isAnswered && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
