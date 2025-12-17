import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Lightbulb,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionNavigatorPopup } from "./QuestionNavigatorPopup";
import type { SessionQuestion, AnswerState } from "@/lib/types";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface PracticeFooterProps {
  showFeedback: boolean;
  hasAnswer: boolean;
  isSubmitting: boolean;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  currentIndex: number;
  totalQuestions: number;
  questions?: SessionQuestion[];
  answers?: Record<string, AnswerState>;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onNavigate?: (index: number) => void;
  onGetFeedback?: () => void;
  loadingFeedback?: boolean;
}

export function PracticeFooter({
  showFeedback,
  hasAnswer,
  isSubmitting,
  isFirstQuestion,
  isLastQuestion,
  currentIndex,
  totalQuestions,
  questions = [],
  answers = {},
  onSubmit,
  onNext,
  onPrevious,
  onNavigate,
  onGetFeedback,
  loadingFeedback = false,
}: PracticeFooterProps) {
  const handleNavigate = (index: number) => {
    if (onNavigate) {
      onNavigate(index);
    }
  };

  return (
    <div className="relative z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between pl-[250px] pr-[250px] h-16">
        {/* Left: Question Counter - Clickable */}
        <div className="flex items-center gap-3">
          {questions.length > 0 ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border/60 hover:bg-muted/80 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {currentIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    of
                  </span>
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {totalQuestions}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                sideOffset={8}
                className="w-auto min-w-[100px] max-w-[600px] p-0 max-h-[80vh] overflow-hidden"
              >
                <QuestionNavigatorPopup
                  questions={questions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onNavigate={handleNavigate}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border/60">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {currentIndex + 1}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                of
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {totalQuestions}
              </span>
            </div>
          )}
        </div>

        {/* Right: AI Explanation / Explanation / Check / Back / Next */}
        <div className="flex items-center gap-3">
          {/* AI Explanation Button */}
          {onGetFeedback && (
            <Button
              onClick={onGetFeedback}
              disabled={loadingFeedback}
              className="h-10 px-6 font-semibold transition-all shadow-sm text-base flex items-center gap-2 !text-white"
              style={{
                backgroundColor: loadingFeedback
                  ? "rgba(134, 111, 254, 0.5)"
                  : "#866ffe",
                color: "#ffffff",
              }}
            >
              {loadingFeedback ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  AI Explanation
                </>
              )}
            </Button>
          )}

          {/* Explanation Button */}
          <Button
            className="h-10 px-6 font-semibold transition-all shadow-sm text-base flex items-center gap-2"
            style={{
              backgroundColor: "rgba(134, 111, 254, 0.3)",
              color: "#866ffe",
            }}
          >
            <Lightbulb className="size-4" />
            Explanation
          </Button>

          {/* Check Button */}
          <Button
            onClick={onSubmit}
            disabled={!hasAnswer || isSubmitting || showFeedback}
            className={cn(
              "h-10 px-6 font-semibold transition-all shadow-sm hover:opacity-90 disabled:opacity-50 text-base flex items-center gap-2",
              !hasAnswer && "opacity-60"
            )}
            style={{
              backgroundColor: "rgba(254, 165, 0, 0.25)",
              color: "#fea500",
            }}
          >
            <Check className="size-4" />
            Check
          </Button>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className={cn(
              "h-10 px-4 border-border/60 bg-background/50 hover:bg-accent transition-all text-base",
              isFirstQuestion && "opacity-50 cursor-not-allowed"
            )}
          >
            Back
          </Button>

          {/* Next Button */}
          <Button
            variant="outline"
            onClick={onNext}
            className="h-10 px-4 border-border/60 bg-background/50 hover:bg-muted/80 text-foreground transition-all text-base"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
