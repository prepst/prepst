import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { AIFeedbackDisplay } from "./AIFeedbackDisplay";
import { ConfidenceRating } from "./ConfidenceRating";
import type {
  SessionQuestion,
  AnswerState,
  AIFeedbackContent,
} from "@/lib/types";

interface AnswerPanelProps {
  question: SessionQuestion;
  answer: AnswerState | null;
  showFeedback: boolean;
  aiFeedback: AIFeedbackContent | null;
  loadingFeedback: boolean;
  onAnswerChange: (value: string) => void;
  onGetFeedback: () => void;
  onGetSimilarQuestion?: () => void;
  onSaveQuestion?: () => void;
  isQuestionSaved?: boolean;
  onConfidenceSelect?: (confidence: number) => void;
  defaultConfidence?: number;
}

export function AnswerPanel({
  question,
  answer,
  showFeedback,
  aiFeedback,
  loadingFeedback,
  onAnswerChange,
  onGetFeedback,
  onGetSimilarQuestion,
  onSaveQuestion,
  isQuestionSaved,
  onConfidenceSelect,
  defaultConfidence = 3,
}: AnswerPanelProps) {
  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        {question.question.question_type === "mc"
          ? "Select an Answer"
          : "Your Answer"}
      </h3>

      {/* Student Produced Response Input */}
      {question.question.question_type === "spr" && (
        <div className="space-y-6">
          <Input
            id="answer-input"
            type="text"
            placeholder="Enter your answer..."
            value={answer?.userAnswer[0] || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={showFeedback}
            className="text-3xl h-20 text-center font-mono tracking-widest bg-card border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all"
          />

          {/* Show correct answer for wrong SPR answers */}
          {showFeedback &&
            answer &&
            !answer.isCorrect &&
            question.question.correct_answer && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Incorrect</p>
                  <p className="text-sm text-muted-foreground">
                    Correct answer: <span className="font-mono font-bold text-foreground">{Array.isArray(question.question.correct_answer) ? question.question.correct_answer.join(", ") : question.question.correct_answer}</span>
                  </p>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Multiple Choice Options */}
      {question.question.question_type === "mc" &&
        question.question.answer_options && (
          <div className="space-y-3">
            {(() => {
              const options = Array.isArray(question.question.answer_options)
                ? question.question.answer_options
                : Object.entries(question.question.answer_options);

              const labels = ["A", "B", "C", "D", "E", "F"];

              return options.map((option: unknown, index: number) => {
                const label = labels[index];
                const opt = option as Record<string, unknown> & {
                  id?: string;
                  content?: string;
                };
                const optArray = option as unknown[];
                const optionId = String(opt.id || optArray[0]);
                const optionContent =
                  opt.content ||
                  (optArray[1] as Record<string, unknown>)?.content ||
                  optArray[1];

                const isSelected = answer?.userAnswer[0] === optionId;
                const isCorrect =
                  showFeedback && answer?.isCorrect && isSelected;
                const isWrong =
                  showFeedback && !answer?.isCorrect && isSelected;

                const correctAnswer = question.question.correct_answer;
                const isCorrectAnswer =
                  showFeedback &&
                  !answer?.isCorrect &&
                  (() => {
                    const correctAnswerStr = Array.isArray(correctAnswer)
                      ? String(correctAnswer[0]).trim().toUpperCase()
                      : String(correctAnswer).trim().toUpperCase();
                    const optionLabel = label.trim().toUpperCase();
                    return correctAnswerStr === optionLabel;
                  })();

                return (
                  <div
                    key={optionId}
                    className={`
                      group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out
                      ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/20"
                          : isWrong
                          ? "border-destructive bg-destructive/10 ring-1 ring-destructive/20"
                          : isCorrectAnswer
                          ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/20 border-dashed"
                          : isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.01] shadow-sm"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent hover:scale-[1.005]"
                      }
                    `}
                    onClick={() => !showFeedback && onAnswerChange(optionId)}
                  >
                    {/* Label Badge */}
                    <div className={`
                      flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors
                      ${
                        isSelected || isCorrect || isCorrectAnswer
                          ? "border-transparent bg-primary text-primary-foreground"
                          : isWrong
                          ? "border-transparent bg-destructive text-destructive-foreground"
                          : "border-border bg-muted text-muted-foreground group-hover:bg-background"
                      }
                    `}>
                      {isSelected ? <Check className="w-4 h-4" /> : label}
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 text-foreground font-medium">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: String(optionContent),
                        }}
                      />
                    </div>
                    
                    {/* Feedback Icon */}
                    {isCorrect && <Check className="w-5 h-5 text-green-500" />}
                    {isWrong && <X className="w-5 h-5 text-destructive" />}
                  </div>
                );
              });
            })()}
          </div>
        )}

      {/* Confidence Rating - Show when answer is selected but before feedback */}
      {answer && !showFeedback && onConfidenceSelect && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ConfidenceRating
            onSelect={onConfidenceSelect}
            defaultScore={defaultConfidence}
          />
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && answer && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className={`
            rounded-2xl p-6 border
            ${answer.isCorrect 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-destructive/10 border-destructive/20"}
          `}>
            <div className="flex items-center gap-4">
              <div className={`
                h-12 w-12 rounded-full flex items-center justify-center
                ${answer.isCorrect 
                  ? "bg-green-500 text-white" 
                  : "bg-destructive text-white"}
              `}>
                {answer.isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  {answer.isCorrect ? "Excellent Work!" : "Not Quite Right"}
                </h4>
                <p className="text-muted-foreground">
                  {answer.isCorrect 
                    ? "You nailed this concept." 
                    : "Review the explanation below to understand why."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid gap-3">
            <Button
              onClick={onGetFeedback}
              disabled={loadingFeedback}
              size="lg"
              className="w-full font-semibold h-12 text-base shadow-sm"
            >
              {loadingFeedback ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Generating Insight...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Explanation
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              {onGetSimilarQuestion && (
                <Button
                  onClick={onGetSimilarQuestion}
                  variant="outline"
                  className="h-12"
                >
                  Practice Similar
                </Button>
              )}
              {onSaveQuestion && (
                <Button
                  onClick={onSaveQuestion}
                  variant="outline"
                  className="h-12"
                  disabled={!!isQuestionSaved}
                >
                  {isQuestionSaved ? "Saved" : "Save Question"}
                </Button>
              )}
            </div>
          </div>

          {/* AI Feedback Display */}
          {aiFeedback && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AIFeedbackDisplay
                feedback={aiFeedback}
                isCorrect={answer.isCorrect || false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
