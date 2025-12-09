"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/ui/page-loader";
import { ErrorDisplay } from "@/components/ui/error-display";
import { QuestionPanel } from "@/components/practice/QuestionPanel";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { QuestionListSidebar } from "@/components/practice/QuestionListSidebar";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { components } from "@/lib/types/api.generated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Flag,
  List,
  CheckCircle2,
} from "lucide-react";
import type { SessionQuestion, AnswerState } from "@/lib/types";

type DiagnosticQuestionWithDetails = Omit<
  components["schemas"]["DiagnosticTestQuestionWithDetails"],
  "question" | "topic"
> & {
  question: components["schemas"]["Question"];
  topic: components["schemas"]["Topic"];
};
type DiagnosticTest = components["schemas"]["DiagnosticTest"];
type DiagnosticTestResponse = {
  test: DiagnosticTest;
  questions: DiagnosticQuestionWithDetails[];
  total_questions?: number;
};

function DiagnosticTestContent() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [questions, setQuestions] = useState<DiagnosticQuestionWithDetails[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<DiagnosticTest | null>(null);
  const [showQuestionList, setShowQuestionList] = useState(false);

  // Draggable divider state
  const [dividerPosition, setDividerPosition] = useState(480);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(480);

  const currentQuestion = questions[currentIndex];

  // Transform diagnostic question to match SessionQuestion structure for shared components
  const transformedQuestions: SessionQuestion[] = questions.map((q) => ({
    session_question_id: q.diagnostic_question_id,
    question: q.question,
    topic: q.topic,
    status: q.status as any,
    display_order: q.display_order,
    user_answer: q.user_answer,
    is_saved: false,
  }));

  const currentTransformedQuestion = transformedQuestions[currentIndex];

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.question.id]
    : null;

  // Mark for review is stored in the custom field of AnswerState in our local state
  // We need to extend AnswerState interface locally if we want to use it strictly,
  // but we are casting for components anyway.
  // Let's look at how we store it.

  const loadTest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Start the test
      await fetch(`${config.apiUrl}/api/diagnostic-test/${testId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      // Load questions
      const response = await fetch(
        `${config.apiUrl}/api/diagnostic-test/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load diagnostic test");

      const data: DiagnosticTestResponse = await response.json();
      setTestData(data.test);
      setQuestions(data.questions);

      // Initialize answers from saved state
      const initialAnswers: Record<
        string,
        AnswerState & { isMarkedForReview?: boolean }
      > = {};
      data.questions.forEach((q: DiagnosticQuestionWithDetails) => {
        if (q.user_answer && q.user_answer.length > 0) {
          initialAnswers[q.question.id] = {
            userAnswer: q.user_answer,
            status: "answered",
            isMarkedForReview: q.is_marked_for_review || false,
          };
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load diagnostic test"
      );
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    const currentAns = answers[currentQuestion.question.id];
    setAnswers({
      ...answers,
      [currentQuestion.question.id]: {
        userAnswer: [value],
        status: "answered",
        // @ts-ignore - using custom property
        isMarkedForReview: currentAns?.isMarkedForReview || false,
      },
    });
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    const currentAns = answers[currentQuestion.question.id];
    setAnswers({
      ...answers,
      [currentQuestion.question.id]: {
        userAnswer: currentAns?.userAnswer || [],
        status: currentAns?.status || "not_started",
        // @ts-ignore - using custom property
        isMarkedForReview: !(currentAns?.isMarkedForReview || false),
      },
    });
  };

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.question.id] as AnswerState & {
      isMarkedForReview?: boolean;
    };
    if (!answer) return;

    // Fire-and-forget - do not block UI
    const submitInBackground = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch(
          `${config.apiUrl}/api/diagnostic-test/${testId}/questions/${currentQuestion.question.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_answer: answer.userAnswer,
              status: "answered",
              is_marked_for_review: answer.isMarkedForReview,
            }),
          }
        );
      } catch (err) {
        console.error("Failed to submit answer in background:", err);
      }
    };

    submitInBackground();
  }, [testId, currentQuestion, answers]);

  const handleNext = async () => {
    submitAnswer(); // No await - fire and forget

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = async () => {
    submitAnswer(); // No await - fire and forget

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleQuestionNavigation = async (index: number) => {
    submitAnswer(); // No await - fire and forget
    setCurrentIndex(index);
    setShowQuestionList(false);
  };

  const handleCompleteTest = async () => {
    if (isSubmitting) return;

    const unansweredCount = questions.filter(
      (q) => !answers[q.question.id]?.userAnswer?.length
    ).length;

    if (unansweredCount > 0) {
      if (
        !confirm(
          `You have ${unansweredCount} unanswered questions. Are you sure you want to complete the test?`
        )
      ) {
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Submit current answer if any
      await submitAnswer();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Complete the test
      const response = await fetch(
        `${config.apiUrl}/api/diagnostic-test/${testId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to complete test");

      // Navigate to results, preserve returnToOnboarding parameter
      const urlParams = new URLSearchParams(window.location.search);
      const returnToOnboarding = urlParams.get("returnToOnboarding");
      if (returnToOnboarding === "true") {
        router.push(
          `/diagnostic-test/${testId}/results?returnToOnboarding=true`
        );
      } else {
        router.push(`/diagnostic-test/${testId}/results`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete test");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Draggable divider handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPosition(dividerPosition);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const newPosition = dragStartPosition - deltaX;

    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const minWidth = 250;
    const maxWidth = rect.width - 250;

    const clampedPosition = Math.max(minWidth, Math.min(maxWidth, newPosition));
    setDividerPosition(clampedPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (isInputFocused && key !== "enter") {
        return;
      }

      const isHandledKey = [
        "1",
        "2",
        "3",
        "4",
        "a",
        "b",
        "c",
        "d",
        "Enter",
      ].includes(event.key);
      if (isHandledKey && !isInputFocused) {
        event.preventDefault();
      }

      if (!currentQuestion || isSubmitting) return;

      const isMultipleChoice = currentQuestion.question.question_type === "mc";

      // --- Handle Answer Selection (1, 2, 3, 4, A, B, C, D) ---
      if (isMultipleChoice && !isInputFocused) {
        const answerOptions = currentQuestion.question.answer_options;
        const options = Array.isArray(answerOptions)
          ? answerOptions
          : answerOptions
          ? Object.entries(answerOptions)
          : [];

        let selectedOptionId: string | undefined;

        if (key >= "1" && key <= "4") {
          const index = parseInt(key) - 1;
          if (index < options.length) {
            selectedOptionId = String(
              (options[index] as any).id || (options[index] as any)[0]
            );
          }
        } else if (key >= "a" && key <= "d") {
          const index = key.charCodeAt(0) - "a".charCodeAt(0);
          if (index < options.length) {
            selectedOptionId = String(
              (options[index] as any).id || (options[index] as any)[0]
            );
          }
        }

        if (selectedOptionId) {
          handleAnswerChange(selectedOptionId);
        }
      }

      // --- Handle Enter Key for Next/Complete ---
      if (key === "enter") {
        event.preventDefault();
        if (
          currentAnswer?.userAnswer &&
          currentAnswer.userAnswer.length > 0 &&
          !isSubmitting
        ) {
          if (currentIndex < questions.length - 1) {
            handleNext();
          } else {
            handleCompleteTest();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentQuestion,
    currentAnswer,
    isSubmitting,
    handleNext,
    handleCompleteTest,
    currentIndex,
    questions.length,
  ]);

  if (isLoading) {
    return <PageLoader message="Loading diagnostic test..." />;
  }

  if (error || !currentQuestion) {
    return (
      <ErrorDisplay
        message={error || "Question not found"}
        onRetry={() => router.push("/dashboard")}
        retryLabel="Back to Dashboard"
      />
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = questions.filter(
    (q) => answers[q.question.id]?.userAnswer?.length
  ).length;

  // Cast answers for QuestionListSidebar which expects a specific structure
  // We need to make sure we are passing the right structure
  const sidebarAnswers = answers as Record<string, AnswerState>;

  // Check if current question is marked for review
  const isCurrentMarked = (answers[currentQuestion.question.id] as any)
    ?.isMarkedForReview;

  return (
    <div
      className="h-screen bg-background flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">
                  Diagnostic Test
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">
                  Baseline Assessment
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-border/60 hidden sm:block" />

            <div className="flex items-center gap-2 hidden sm:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Question List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Badge
                variant="secondary"
                className="font-mono font-medium bg-secondary/50 hover:bg-secondary/50"
              >
                <span className="text-foreground">{currentIndex + 1}</span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className="text-muted-foreground">
                  {questions.length}
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">
                {answeredCount} answered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <span className="hidden sm:inline text-xs font-medium">Exit</span>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question List Sidebar */}
        {showQuestionList && (
          <QuestionListSidebar
            questions={transformedQuestions}
            answers={sidebarAnswers}
            currentIndex={currentIndex}
            onNavigate={handleQuestionNavigation}
            onClose={() => setShowQuestionList(false)}
          />
        )}

        {/* Question Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuestionPanel question={currentTransformedQuestion} />
        </div>

        {/* Draggable Divider */}
        <div
          className={`w-1 bg-border hover:bg-primary cursor-col-resize transition-colors ${
            isDragging ? "bg-primary" : ""
          }`}
          onMouseDown={handleMouseDown}
          style={{
            userSelect: "none",
            cursor: isDragging ? "col-resize" : "col-resize",
          }}
        />

        {/* Answer Panel */}
        <div
          className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col"
          style={{ width: `${dividerPosition}px` }}
        >
          <AnswerPanel
            question={currentTransformedQuestion}
            answer={currentAnswer}
            showFeedback={false}
            aiFeedback={null}
            loadingFeedback={false}
            onAnswerChange={handleAnswerChange}
            onGetFeedback={() => {}}
          />

          {/* Action Buttons */}
          <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm space-y-3">
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                onClick={toggleMarkForReview}
                className={`flex-1 border-border hover:bg-accent text-foreground ${
                  isCurrentMarked
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"
                    : ""
                }`}
              >
                <Flag
                  className={`w-4 h-4 mr-2 ${
                    isCurrentMarked ? "fill-orange-500 text-orange-500" : ""
                  }`}
                />
                {isCurrentMarked ? "Marked" : "Mark for Review"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 border-border hover:bg-accent text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleCompleteTest}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  {isSubmitting ? "Completing..." : "Complete Test"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-[#866ffe] hover:bg-[#7a5ffe] text-white border-0"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticTestPage() {
  return (
    <ProtectedRoute>
      <DiagnosticTestContent />
    </ProtectedRoute>
  );
}
