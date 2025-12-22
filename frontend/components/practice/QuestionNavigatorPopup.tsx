import { Bookmark, XIcon } from "lucide-react";
import type { SessionQuestion, AnswerState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@/components/ui/popover";

interface QuestionNavigatorPopupProps {
  questions: SessionQuestion[];
  answers: Record<string, AnswerState>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  isMockExam?: boolean;
}

export function QuestionNavigatorPopup({
  questions,
  answers,
  currentIndex,
  onNavigate,
  isMockExam = false,
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
      {!isMockExam && (
        <div className="flex items-center justify-center gap-4 text-sm px-3 pt-2 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-green-500 bg-green-500/20" />
            <span className="text-muted-foreground">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-red-500 bg-red-500/20" />
            <span className="text-muted-foreground">Incorrect</span>
          </div>
        </div>
      )}
      {isMockExam && (
        <div className="flex items-center justify-center gap-4 text-sm px-3 pt-2 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-orange-500 bg-orange-500/20" />
            <span className="text-muted-foreground">Answered</span>
          </div>
        </div>
      )}

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 gap-x-2 gap-y-3 pl-2 pr-2 pt-2 pb-2">
          {questions.map((question, index) => {
            const answer = answers[question.question.id];
            const isCurrent = index === currentIndex;
            const isAnswered =
              answer?.status === "answered" ||
              (answer?.userAnswer && answer.userAnswer.length > 0);
            const isCorrect = answer?.isCorrect === true;
            const isWrong = answer?.isCorrect === false;
            const isMarked = answer?.isMarkedForReview;

            // Determine background color and text color
            let bgColor = "";
            let borderColor = "";
            let textColor = "";

            if (isCurrent) {
              bgColor = "bg-primary/10";
              borderColor = "border-primary border-2";
              textColor = "text-primary";
            } else if (isMockExam) {
              // Mock exam: orange if answered, default if not answered
              if (isAnswered) {
                bgColor = "bg-orange-500/20";
                borderColor = "border-orange-500/30";
                textColor = "text-orange-500";
              } else {
                bgColor = "bg-muted/30";
                borderColor = "border-border";
                textColor = "text-muted-foreground";
              }
            } else {
              // Regular practice: green if correct, red if wrong, default if not answered
              if (isCorrect) {
                bgColor = "bg-green-500/20";
                borderColor = "border-green-500/30";
                textColor = "text-green-500";
              } else if (isWrong) {
                bgColor = "bg-red-500/20";
                borderColor = "border-red-500/30";
                textColor = "text-red-500";
              } else {
                bgColor = "bg-muted/30";
                borderColor = "border-border";
                textColor = "text-muted-foreground";
              }
            }

            return (
              <button
                key={question.session_question_id}
                onClick={() => handleQuestionClick(index)}
                className={cn(
                  "relative w-10 h-10 rounded border transition-all hover:scale-105 flex items-center justify-center font-bold text-xs pt-0 pb-0 m-0",
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
