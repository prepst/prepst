"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Check,
  Lightbulb,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  SkipForward,
} from "lucide-react";
import { QuestionPanel } from "@/components/practice/QuestionPanel";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { AIFeedbackDisplay } from "@/components/practice/AIFeedbackDisplay";
import type {
  SessionQuestion,
  AnswerState,
  AIFeedbackContent,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { supabase } from "@/lib/supabase";

interface QuestionPracticePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: SessionQuestion;
  onComplete?: (isCorrect: boolean) => void;
  // Navigation props for multi-question sessions
  currentIndex?: number;
  totalQuestions?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function QuestionPracticePopup({
  open,
  onOpenChange,
  question,
  onComplete,
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onSkip,
  hasPrevious = false,
  hasNext = false,
}: QuestionPracticePopupProps) {
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackContent | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [isSimpleExplanation, setIsSimpleExplanation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    if (open && question) {
      setAnswer(null);
      setShowFeedback(false);
      setIsSubmitting(false);
      setAiFeedback(null);
      setIsSimpleExplanation(false);
      setLoadingFeedback(false);
    }
  }, [question?.session_question_id, open]);

  const handleAnswerChange = (value: string) => {
    if (showFeedback) return;

    // For MC questions, convert optionId to label (A, B, C, D) for comparison
    let answerValue = value;
    if (
      question.question.question_type === "mc" &&
      question.question.answer_options
    ) {
      const options = Array.isArray(question.question.answer_options)
        ? question.question.answer_options
        : Object.entries(question.question.answer_options);

      const labels = ["A", "B", "C", "D", "E", "F"];
      const optionIndex = options.findIndex((option: unknown) => {
        const opt = option as Record<string, unknown>;
        const optArray = option as unknown[];
        const optionId = String(opt.id || optArray[0]);
        return optionId === value;
      });

      if (optionIndex >= 0 && optionIndex < labels.length) {
        answerValue = labels[optionIndex];
      }
    }

    const newAnswer: AnswerState = {
      userAnswer: [answerValue],
      status: "in_progress",
    };

    // Store optionId for AnswerPanel to properly highlight selected option
    if (question.question.question_type === "mc") {
      (newAnswer as any).optionId = value;
    }

    setAnswer(newAnswer);
    // No auto-submit - user must click "Check Answer" button
  };

  const handleSubmit = async (answerValue?: string, optionId?: string) => {
    try {
      const currentAnswerValue = answerValue || answer?.userAnswer?.[0];
      const currentOptionId = optionId || (answer as any)?.optionId;

      if (!currentAnswerValue || showFeedback || isSubmitting) {
        console.log("handleSubmit early return", {
          currentAnswerValue,
          showFeedback,
          isSubmitting,
          answer,
        });
        return;
      }

      setIsSubmitting(true);

      // Check if answer is correct
      // Use the same logic as usePracticeSession for consistency
      const correctAnswer = question.question.correct_answer;
      if (!correctAnswer) {
        console.error("No correct answer found for question");
        setIsSubmitting(false);
        return;
      }

      const correctAnswerArray = Array.isArray(correctAnswer)
        ? correctAnswer
        : [String(correctAnswer)];

      let userAnswerLabels: string[] = [currentAnswerValue];
      let correctAnswerLabels: string[] = correctAnswerArray.map(String);

      // For MC questions, convert both user answer and correct answer to labels
      if (
        question.question.question_type === "mc" &&
        question.question.answer_options
      ) {
        const options = Array.isArray(question.question.answer_options)
          ? question.question.answer_options
          : Object.entries(question.question.answer_options);

        const labels = ["A", "B", "C", "D", "E", "F"];

        // Convert user answer to labels (it might already be a label)
        userAnswerLabels = [currentAnswerValue].map((answer: string) => {
          // Check if answer is already a label (A, B, C, D)
          if (labels.includes(answer.toUpperCase())) {
            return answer.toUpperCase();
          }

          // Otherwise, try to find the label for this optionId
          const optionIndex = options.findIndex((option: unknown) => {
            const opt = option as Record<string, unknown>;
            const optArray = option as unknown[];
            const optionId = String(opt.id || optArray[0]);
            return (
              optionId === answer ||
              optionId.toLowerCase() === answer.toLowerCase()
            );
          });

          if (optionIndex >= 0 && optionIndex < labels.length) {
            return labels[optionIndex];
          }

          return answer.toUpperCase(); // Fallback
        });

        // Convert correct answer to labels
        correctAnswerLabels = correctAnswerArray.map((answer: string) => {
          const ansStr = String(answer).trim();
          // Check if it's already a label
          if (labels.includes(ansStr.toUpperCase())) {
            return ansStr.toUpperCase();
          }

          // Otherwise, try to find the label for this option ID
          const optionIndex = options.findIndex((option: unknown) => {
            const opt = option as Record<string, unknown>;
            const optArray = option as unknown[];
            const optionId = String(opt.id || optArray[0]);
            return (
              optionId === ansStr ||
              optionId.toLowerCase() === ansStr.toLowerCase()
            );
          });

          if (optionIndex >= 0 && optionIndex < labels.length) {
            return labels[optionIndex];
          }

          return ansStr.toUpperCase(); // Fallback
        });
      } else {
        // For SPR questions, normalize both to uppercase
        userAnswerLabels = [currentAnswerValue].map((ans) =>
          String(ans).trim().toUpperCase()
        );
        correctAnswerLabels = correctAnswerArray.map((ans) =>
          String(ans).trim().toUpperCase()
        );
      }

      // Compare sorted arrays (same as usePracticeSession)
      const isCorrect =
        JSON.stringify(userAnswerLabels.map(String).sort()) ===
        JSON.stringify(correctAnswerLabels.map(String).sort());

      // Update answer state with correct value and optionId
      const updatedAnswer: AnswerState = {
        userAnswer: [currentAnswerValue],
        status: "answered",
        isCorrect,
      };

      // Preserve optionId for AnswerPanel display
      if (currentOptionId) {
        (updatedAnswer as any).optionId = currentOptionId;
      } else if (answer && (answer as any).optionId) {
        (updatedAnswer as any).optionId = (answer as any).optionId;
      }

      setAnswer(updatedAnswer);
      setShowFeedback(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAnswer(null);
    setShowFeedback(false);
    setIsSubmitting(false);
    setAiFeedback(null);
    setLoadingFeedback(false);
    setIsSimpleExplanation(false);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (onComplete && answer) {
      onComplete(answer.isCorrect === true);
    }

    // If navigation handlers are provided, use them instead of closing
    // State will be reset by useEffect when question changes
    if (onNext && hasNext) {
      onNext();
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    // State will be reset by useEffect when question changes
    if (onSkip && hasNext) {
      onSkip();
    }
  };

  const handlePrevious = () => {
    // State will be reset by useEffect when question changes
    if (onPrevious && hasPrevious) {
      onPrevious();
    }
  };

  const handleGetFeedback = async () => {
    if (!answer || !question) return;

    setIsSimpleExplanation(false);
    setLoadingFeedback(true);
    try {
      const correctAnswer = question.question.correct_answer;
      const correctAnswerArray = Array.isArray(correctAnswer)
        ? correctAnswer
        : [String(correctAnswer)];

      const userAnswer = answer.userAnswer;

      const isCorrect = answer.isCorrect || false;

      // Call AI feedback API
      const response = await fetch(`${config.apiUrl}/api/ai-feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_stem: question.question.stem,
          question_type: question.question.question_type,
          correct_answer: correctAnswerArray,
          user_answer: userAnswer,
          is_correct: isCorrect,
          topic_name: question.topic.name,
          user_performance_context: {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI feedback");
      }

      const feedbackData = await response.json();
      setAiFeedback(feedbackData.feedback);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      setAiFeedback({
        explanation:
          "Unable to generate AI feedback at this time. Please try again later.",
        hints: ["Review the question carefully"],
        learning_points: ["Practice similar questions to improve"],
        key_concepts: ["Focus on understanding the core concept"],
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleGetExplanation = () => {
    // Show rationale if available
    if (question.question.rationale) {
      setIsSimpleExplanation(true);
      setAiFeedback({
        explanation: question.question.rationale,
        hints: [],
        learning_points: [],
        key_concepts: [],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="!max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden !grid-cols-1"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60 flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary text-sm">Q</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">
                  Quick Practice
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">
                  {totalQuestions && currentIndex !== undefined
                    ? `Question ${currentIndex + 1} of ${totalQuestions}`
                    : "Single Question Review"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Navigation buttons */}
              {totalQuestions && totalQuestions > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Previous question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {!showFeedback && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      disabled={!hasNext}
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      title="Skip question"
                    >
                      <SkipForward className="w-3 h-3 mr-1" />
                      Skip
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={!hasNext || !showFeedback}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title={hasNext ? "Next question" : "Finish"}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {totalQuestions &&
            totalQuestions > 1 &&
            currentIndex !== undefined && (
              <div className="px-6 pb-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 w-full">
          {/* Question Panel */}
          <div className="flex-1 flex flex-col min-w-[300px] overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-background">
              {question && question.question ? (
                <QuestionPanel 
                  key={question.session_question_id}
                  question={question} 
                  compact={true} 
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Question not available
                </div>
              )}
            </div>
          </div>

          {/* Answer Panel */}
          <div className="w-[480px] shrink-0 bg-background backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <AnswerPanel
                question={question}
                answer={answer}
                showFeedback={showFeedback}
                aiFeedback={isSimpleExplanation ? null : aiFeedback}
                loadingFeedback={loadingFeedback}
                onAnswerChange={handleAnswerChange}
                onGetFeedback={handleGetFeedback}
                onGetSimilarQuestion={undefined}
                onSaveQuestion={undefined}
                compact={true}
              />

              {/* Simple Explanation Display */}
              {isSimpleExplanation && aiFeedback && (
                <div className="px-8 pb-8">
                  <div className="mt-6 p-6 shadow-sm border-border/80 bg-card rounded-xl border">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <h4 className="text-base font-semibold tracking-tight">
                        Explanation
                      </h4>
                    </div>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: aiFeedback.explanation,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border bg-background backdrop-blur-sm space-y-3">
              {!showFeedback ? (
                <>
                  {/* Check Answer Button */}
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={
                      !answer || !answer.userAnswer?.[0] || isSubmitting
                    }
                    className={cn(
                      "w-full h-10 font-semibold transition-all shadow-sm hover:opacity-90 disabled:opacity-50 text-base flex items-center justify-center gap-2",
                      (!answer || !answer.userAnswer?.[0]) && "opacity-60"
                    )}
                    style={{
                      backgroundColor: "rgba(254, 165, 0, 0.25)",
                      color: "#fea500",
                    }}
                  >
                    <Check className="size-4" />
                    Check Answer
                  </Button>

                  {/* Explanation and AI Explanation Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleGetExplanation}
                      variant="outline"
                      className="w-full h-10 border-border/60 bg-background/50 hover:bg-accent transition-all text-base font-semibold flex items-center justify-center gap-2"
                    >
                      <Lightbulb className="size-4" />
                      Explanation
                    </Button>
                    <Button
                      onClick={handleGetFeedback}
                      disabled={loadingFeedback}
                      className="w-full h-10 font-semibold transition-all shadow-sm text-base flex items-center justify-center gap-2 !text-white"
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
                  </div>
                </>
              ) : (
                <>
                  {/* Done/Next Button */}
                  <Button
                    onClick={handleNext}
                    className="w-full h-10 px-6 font-semibold transition-all shadow-sm hover:opacity-90 text-base flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "rgba(254, 165, 0, 0.25)",
                      color: "#fea500",
                    }}
                  >
                    {hasNext ? (
                      <>
                        Next Question
                        <ChevronRight className="size-4" />
                      </>
                    ) : (
                      "Done"
                    )}
                  </Button>

                  {/* Explanation and AI Explanation Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleGetExplanation}
                      variant="outline"
                      className="w-full h-10 border-border/60 bg-background/50 hover:bg-accent transition-all text-base font-semibold flex items-center justify-center gap-2"
                    >
                      <Lightbulb className="size-4" />
                      Explanation
                    </Button>
                    <Button
                      onClick={handleGetFeedback}
                      disabled={loadingFeedback}
                      className="w-full h-10 font-semibold transition-all shadow-sm text-base flex items-center justify-center gap-2 !text-white"
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
