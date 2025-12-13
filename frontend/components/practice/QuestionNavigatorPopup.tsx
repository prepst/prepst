import { X, Check, Bookmark, XIcon } from "lucide-react";
import type { SessionQuestion, AnswerState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@/components/ui/popover";

interface QuestionNavigatorPopupProps {
  questions: SessionQuestion[];
  answers: Record<string, AnswerState>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function QuestionNavigatorPopup({
  questions,
  answers,
  currentIndex,
  onNavigate,
}: QuestionNavigatorPopupProps) {
  const handleQuestionClick = (index: number) => {
    onNavigate(index);
  };

  return (
    <div className="w-fit max-h-[80vh] overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 pt-4 pb-2 flex items-center justify-between border-b">
        <h3 className="text-lg font-semibold">Question Navigator</h3>
        <PopoverClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </PopoverClose>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm px-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-muted-foreground">For Review</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-500" />
          <span className="text-muted-foreground">Incorrect</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-x-0 gap-y-3">
          {questions.map((question, index) => {
            const answer = answers[question.question.id];
            const isCurrent = index === currentIndex;
            const isAnswered = answer?.status === "answered";
            const isCorrect = answer?.isCorrect === true;
            const isWrong = answer?.isCorrect === false;
            const isMarked = answer?.isMarkedForReview;

            // Determine background color and text color based on difficulty
            const difficulty = question.question.difficulty;
            let bgColor = "";
            let borderColor = "";
            let textColor = "";

            if (isCurrent) {
              bgColor = "bg-primary/10";
              borderColor = "border-primary border-2";
              textColor = "text-primary";
            } else {
              // Base background and text color on difficulty
              if (difficulty === "E") {
                bgColor = "bg-green-500/20";
                borderColor = "border-green-500/30";
                textColor = "text-green-500";
              } else if (difficulty === "M") {
                bgColor = "bg-[#fea500]/20";
                borderColor = "border-[#fea500]/30";
                textColor = "text-[#fea500]";
              } else {
                // Hard (H) or any other
                bgColor = "bg-red-500/20";
                borderColor = "border-red-500/30";
                textColor = "text-red-500";
              }
            }

            return (
              <button
                key={question.session_question_id}
                onClick={() => handleQuestionClick(index)}
                className={cn(
                  "relative w-10 h-10 rounded border transition-all hover:scale-105 flex items-center justify-center font-bold text-xs p-0 m-0",
                  bgColor,
                  borderColor,
                  textColor,
                  isCurrent && "ring-1 ring-primary"
                )}
              >
                {index + 1}
                {isMarked && (
                  <Bookmark className="absolute top-0 right-0 w-2 h-2 text-orange-500 fill-orange-500" />
                )}
                {isCorrect && !isMarked && (
                  <Check className="absolute top-0 left-0 w-2 h-2 text-green-500" />
                )}
                {isWrong && (
                  <X className="absolute top-0 left-0 w-2 h-2 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3 pt-2 pb-3 border-t">
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-muted text-sm font-medium">
            {currentIndex + 1} of {questions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
