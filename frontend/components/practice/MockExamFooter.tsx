import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionNavigatorPopup } from "./QuestionNavigatorPopup";
import type { SessionQuestion, AnswerState } from "@/lib/types";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface MockExamFooterProps {
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
  onToggleMarkForReview?: () => void;
  isMarkedForReview?: boolean;
}

export function MockExamFooter({
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
  onToggleMarkForReview,
  isMarkedForReview = false,
}: MockExamFooterProps) {
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
                  isMockExam={true}
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

        {/* Center: Question Counter */}
        {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/40 backdrop-blur-sm">
            <span className="text-sm font-medium text-muted-foreground">
              Question
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {currentIndex + 1}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              of
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {totalQuestions}
            </span>
          </div>
        </div> */}

        {/* Right: Mark for Review / Back / Next / Submit */}
        <div className="flex items-center gap-3">
          {/* Mark for Review Button */}
          {onToggleMarkForReview && (
            <Button
              variant="outline"
              onClick={onToggleMarkForReview}
              className={cn(
                "h-10 px-4 border-border/60 bg-background/50 hover:bg-accent transition-all text-base font-semibold",
                isMarkedForReview &&
                  "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"
              )}
            >
              <Flag
                className={cn(
                  "w-4 h-4 mr-2",
                  isMarkedForReview && "fill-orange-500 text-orange-500"
                )}
              />
              {isMarkedForReview ? "Marked for Review" : "Mark for Review"}
            </Button>
          )}

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
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Next / Submit Button */}
          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="h-10 px-6 font-semibold transition-all shadow-sm text-white hover:opacity-90 text-base"
              style={{
                backgroundColor: "#866ffe",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="h-10 px-6 font-semibold transition-all shadow-sm text-white hover:opacity-90 text-base"
              style={{
                backgroundColor: "#866ffe",
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
