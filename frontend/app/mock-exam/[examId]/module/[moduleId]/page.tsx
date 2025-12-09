"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import {
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Flag,
  List,
  Clock,
} from "lucide-react";
import { components } from "@/lib/types/api.generated";
import type {
  SubmitModuleAnswerRequest,
  BatchSubmitResponse,
  MockQuestionStatus,
} from "@/lib/types";

type QuestionWithDetails = components["schemas"]["MockExamQuestionWithDetails"];
type ModuleData = components["schemas"]["MockExamModule"];

interface AnswerState {
  userAnswer: string[];
  isMarkedForReview: boolean;
}

function ModuleContent() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const moduleId = params.moduleId as string;

  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [showQuestionList, setShowQuestionList] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(32 * 60); // 32 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Draggable divider state
  const [dividerPosition, setDividerPosition] = useState(480); // Initial width for right panel
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(480);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.question?.id]
    : null;

  const loadModule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Start the module
      await fetch(
        `${config.apiUrl}/api/mock-exams/${examId}/modules/${moduleId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Load questions
      const response = await fetch(
        `${config.apiUrl}/api/mock-exams/${examId}/modules/${moduleId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load module");

      const data = await response.json();
      setModuleData(data.module);
      setQuestions(data.questions);

      // Initialize answers from saved state
      const initialAnswers: Record<string, AnswerState> = {};
      data.questions.forEach((q: QuestionWithDetails) => {
        if (q.user_answer && q.user_answer.length > 0) {
          initialAnswers[q.question.id] = {
            userAnswer: q.user_answer,
            isMarkedForReview: q.is_marked_for_review || false,
          };
        }
      });
      setAnswers(initialAnswers);

      // Start timer
      setIsTimerRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load module");
    } finally {
      setIsLoading(false);
    }
  }, [examId, moduleId]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;

    setAnswers({
      ...answers,
      [currentQuestion.question.id]: {
        userAnswer: [value],
        isMarkedForReview:
          answers[currentQuestion.question.id]?.isMarkedForReview || false,
      },
    });
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    setAnswers({
      ...answers,
      [currentQuestion.question.id]: {
        userAnswer: currentAnswer?.userAnswer || [],
        isMarkedForReview: !(currentAnswer?.isMarkedForReview || false),
      },
    });
  };

  const submitAnswer = useCallback(async () => {
    if (!currentAnswer || !currentQuestion) return;

    // Fire-and-forget submission - don't block UI or set loading state
    const submitInBackground = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch(
          `${config.apiUrl}/api/mock-exams/${examId}/modules/${moduleId}/questions/${currentQuestion.question.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question_id: currentQuestion.question.id,
              user_answer: currentAnswer.userAnswer,
              status: "answered",
              is_marked_for_review: currentAnswer.isMarkedForReview,
            }),
          }
        );
      } catch (err) {
        console.error("Background submission failed:", err);
        // Silent failure is acceptable here as we re-submit all answers 
        // in batch at the end of the module as a failsafe
      }
    };

    submitInBackground();
  }, [currentAnswer, currentQuestion, examId, moduleId]);

  const handleCompleteModule = useCallback(async () => {
    try {
      if (isCompleting) return;
      setIsCompleting(true);
      setIsTimerRunning(false);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Collect answers to submit
      const answersToSubmit = questions
        .map((q) => {
          const answer = answers[q.question.id];
          if (answer?.userAnswer && answer.userAnswer.length > 0) {
            return {
              question_id: q.question.id,
              user_answer: answer.userAnswer,
              status: "answered" as MockQuestionStatus,
              is_marked_for_review: answer.isMarkedForReview,
            } as SubmitModuleAnswerRequest;
          }
          return null;
        })
        .filter((a): a is SubmitModuleAnswerRequest => a !== null);

      // Fire batch submission in background (don't await)
      if (answersToSubmit.length > 0) {
        fetch(
          `${config.apiUrl}/api/mock-exams/${examId}/modules/${moduleId}/questions/batch`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(answersToSubmit),
          }
        )
          .then(async (response) => {
            if (response.ok) {
              const result: BatchSubmitResponse = await response.json();
              console.log(
                `✓ Submitted ${result.successful}/${result.total} answers`
              );
            } else {
              console.error("Failed to submit batch answers");
            }
          })
          .catch((err) => {
            console.error("Batch submission error:", err);
          });
      }

      // Complete module immediately (don't wait for batch)
      await fetch(
        `${config.apiUrl}/api/mock-exams/${examId}/modules/${moduleId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            time_remaining_seconds: timeRemaining,
          }),
        }
      );

      // Get exam details to find next module
      const examResponse = await fetch(
        `${config.apiUrl}/api/mock-exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (examResponse.ok) {
        const examData: components["schemas"]["MockExamResponse"] =
          await examResponse.json();

        // Find next incomplete module
        const nextModule = examData.modules.find(
          (m) => m.status === "not_started" || m.status === "in_progress"
        );

        if (nextModule) {
          // Only show break screen between sections (after RW Module 2, before Math Module 1)
          const currentModuleType = moduleData?.module_type;
          const nextModuleType = nextModule.module_type;
          const isSectionTransition =
            currentModuleType === "rw_module_2" &&
            nextModuleType === "math_module_1";

          if (isSectionTransition) {
            // Navigate to break screen between sections
            router.push(
              `/mock-exam/${examId}/break?nextModule=${nextModule.id}&completed=${currentModuleType}`
            );
          } else {
            // Navigate directly to next module (within same section)
            router.push(`/mock-exam/${examId}/module/${nextModule.id}`);
          }
        } else {
          // All modules complete, go to results
          router.push(`/mock-exam/${examId}/results`);
        }
      } else {
        // Fallback to mock exam page
        router.push(`/dashboard/mock-exam`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete module"
      );
      setIsCompleting(false);
    }
  }, [examId, moduleId, questions, answers, timeRemaining, moduleData, router, isCompleting]);

  const handleNext = async () => {
    // Submit current answer if there is one
    if (currentAnswer?.userAnswer && currentAnswer.userAnswer.length > 0) {
      await submitAnswer();
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentIndex(index);
    setShowQuestionList(false);
  };

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          // Auto-submit module when time expires
          handleCompleteModule();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, handleCompleteModule]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

    // Calculate how much the mouse has moved since drag started
    const deltaX = e.clientX - dragStartX;

    // Invert delta to fix direction
    const newPosition = dragStartPosition - deltaX;

    // Set minimum and maximum widths (ensure both panels have reasonable space)
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const minWidth = 250;
    const maxWidth = rect.width - 250;

    // Clamp the position to reasonable bounds
    const clampedPosition = Math.max(minWidth, Math.min(maxWidth, newPosition));

    setDividerPosition(clampedPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser behavior for keys we handle
      const key = event.key.toLowerCase();
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";
      const isMultipleChoice =
        currentQuestion?.question?.question_type === "mc";

      // If typing in an input, ONLY handle Enter key (for submission), ignore everything else
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

      // --- Handle Answer Selection (1, 2, 3, 4, A, B, C, D) ---
      // Only for MC questions and when NOT typing
      if (isMultipleChoice && !isInputFocused) {
        const options = Array.isArray(currentQuestion.question.answer_options)
          ? currentQuestion.question.answer_options
          : Object.entries(currentQuestion.question.answer_options);

        let selectedOptionId: string | undefined;

        // Map numerical keys to options
        if (key >= "1" && key <= "4") {
          // Assuming max 4 options for now
          const index = parseInt(key) - 1;
          if (index < options.length) {
            selectedOptionId = String(
              (options[index] as any).id || (options[index] as any)[0]
            );
          }
        } else if (key >= "a" && key <= "d") {
          // Map alphabetical keys to options
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

      // --- Handle Enter Key for Next/Complete Module ---
      if (key === "enter") {
        if (
          currentAnswer?.userAnswer &&
          currentAnswer.userAnswer.length > 0 &&
          !isSubmitting
        ) {
          if (currentIndex < questions.length - 1) {
            handleNext();
          } else {
            handleCompleteModule();
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
    handleAnswerChange,
    handleNext,
    handleCompleteModule,
    currentIndex,
    questions.length,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card border border-border p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Oops!</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Question not found"}
          </p>
          <Button
            onClick={() => router.push("/dashboard/mock-exam")}
            size="lg"
            variant="default"
          >
            Back to Mock Exams
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key].userAnswer.length > 0
  ).length;

  const getModuleTitle = (moduleType: string) => {
    const typeMap: Record<string, string> = {
      rw_module_1: "Reading and Writing - Module 1",
      rw_module_2: "Reading and Writing - Module 2",
      math_module_1: "Math - Module 1",
      math_module_2: "Math - Module 2",
    };
    return typeMap[moduleType] || moduleType;
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header with Progress */}
      <div className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {getModuleTitle(moduleData?.module_type || "")}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">
                  Mock Exam
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

          {/* Center: Timer (Absolute Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${
                timeRemaining <= 300
                  ? "bg-red-500/10 border-red-500/20 ring-1 ring-red-500/10"
                  : timeRemaining <= 600
                  ? "bg-orange-500/10 border-orange-500/20 ring-1 ring-orange-500/10"
                  : "bg-blue-500/10 border-blue-500/20 ring-1 ring-blue-500/10"
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  timeRemaining <= 300
                    ? "text-red-600 dark:text-red-400"
                    : timeRemaining <= 600
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
              <span
                className={`text-sm font-mono font-bold tabular-nums tracking-tight ${
                  timeRemaining <= 300
                    ? "text-red-700 dark:text-red-300"
                    : timeRemaining <= 600
                    ? "text-orange-700 dark:text-orange-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dev: Auto-fill all B answers - Hidden in production or styled minimally */}
            <Button
              onClick={() => {
                const newAnswers: Record<string, AnswerState> = {};
                for (const q of questions) {
                  if (q.question.question_type === "spr") {
                    newAnswers[q.question.id] = {
                      userAnswer: ["2"],
                      isMarkedForReview: false,
                    };
                  } else {
                    const answerOptions = q.question.answer_options as any;
                    if (
                      answerOptions &&
                      Array.isArray(answerOptions) &&
                      answerOptions.length > 1
                    ) {
                      const optionB = answerOptions[1];
                      const optionId =
                        typeof optionB === "object" && optionB !== null
                          ? optionB.id || optionB[0]
                          : optionB;

                      newAnswers[q.question.id] = {
                        userAnswer: [String(optionId)],
                        isMarkedForReview: false,
                      };
                    }
                  }
                }
                setAnswers(newAnswers);
              }}
              variant="ghost"
              size="sm"
              className="hidden lg:flex text-xs text-purple-600/50 hover:text-purple-600 hover:bg-purple-500/10"
            >
              Dev Fill
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/mock-exam")}
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
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Question List Sidebar */}
        {showQuestionList && (
          <div className="w-[400px] border-r border-border bg-background/95 backdrop-blur-xl flex flex-col h-full shadow-xl z-20">
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
              <h3 className="text-base font-semibold text-foreground">
                Question Navigator
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuestionList(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {questions.map((question, index) => {
                const answer = answers[question.question.id];
                const isCurrent = index === currentIndex;
                const isAnswered = answer?.userAnswer.length > 0;
                const isMarked = answer?.isMarkedForReview;

                return (
                  <button
                    key={question.question.id}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`
                      group w-full p-3 rounded-xl text-left transition-all duration-200 border
                      ${
                        isCurrent
                          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                          : isMarked
                          ? "border-orange-500/30 bg-orange-500/5"
                          : isAnswered
                          ? "border-border bg-muted/30 hover:bg-muted/50"
                          : "border-transparent hover:bg-accent hover:border-border"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`
                            flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-medium transition-colors
                            ${
                              isCurrent
                                ? "bg-primary text-primary-foreground"
                                : isAnswered
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <span
                            className={`text-sm font-medium ${
                              isCurrent
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          >
                            Question {index + 1}
                          </span>
                        </div>
                      </div>
                      {isMarked && (
                        <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Content - Flexible width */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 min-w-0">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Question Meta */}
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="pl-2 pr-3 py-1 gap-2 border-border bg-card text-foreground font-medium"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentQuestion.question.difficulty === "E"
                      ? "bg-emerald-500"
                      : currentQuestion.question.difficulty === "M"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                {currentQuestion.question.difficulty === "E"
                  ? "Easy"
                  : currentQuestion.question.difficulty === "M"
                  ? "Medium"
                  : "Hard"}
              </Badge>
            </div>

            {/* Question Stem */}
            <div
              className="prose prose-xl dark:prose-invert max-w-none text-foreground font-medium leading-relaxed tracking-tight"
              dangerouslySetInnerHTML={{
                __html: currentQuestion.question.stem,
              }}
            />

            {/* Stimulus (Passage/Context) - Only for English questions */}
            {currentQuestion.question.stimulus && (
              <div className="relative pl-6 border-l-4 border-primary/20">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.question.stimulus,
                  }}
                />
              </div>
            )}
          </div>
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

        {/* Answer Panel - Dynamic width */}
        <div
          className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col"
          style={{ width: `${dividerPosition}px` }}
        >
          {/* Transform mock exam data to match AnswerPanel expectations */}
          <AnswerPanel
            key={currentQuestion.question.id}
            question={
              {
                session_question_id: currentQuestion.question.id,
                question: currentQuestion.question,
                topic: "Mock Exam",
                status:
                  !currentAnswer || currentAnswer.userAnswer.length === 0
                    ? "not_started"
                    : "answered",
                display_order: currentIndex,
              } as any
            }
            answer={
              currentAnswer
                ? ({
                    ...currentAnswer,
                    status:
                      currentAnswer.userAnswer.length === 0
                        ? "not_started"
                        : "answered",
                    session_question_id: currentQuestion.question.id,
                  } as any)
                : null
            }
            showFeedback={false} // Mock exams don't show feedback during questions
            aiFeedback={null}
            loadingFeedback={false}
            onAnswerChange={handleAnswerChange}
            onGetFeedback={() => {}} // Not used in mock exams
          />

          {/* Action Buttons */}
          <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm space-y-3">
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                onClick={toggleMarkForReview}
                className={`flex-1 border-border hover:bg-accent text-foreground ${
                  currentAnswer?.isMarkedForReview
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"
                    : ""
                }`}
              >
                <Flag
                  className={`w-4 h-4 mr-2 ${
                    currentAnswer?.isMarkedForReview
                      ? "fill-orange-500 text-orange-500"
                      : ""
                  }`}
                />
                {currentAnswer?.isMarkedForReview
                  ? "Marked"
                  : "Mark for Review"}
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
                Back
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-[#866ffe] hover:bg-[#7a5ffe] text-white border-0"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteModule}
                  disabled={isCompleting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Complete Module"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModulePage() {
  return (
    <ProtectedRoute>
      <ModuleContent />
    </ProtectedRoute>
  );
}
