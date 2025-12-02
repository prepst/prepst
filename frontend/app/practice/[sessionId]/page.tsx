"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/ui/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { PracticeHeader } from "@/components/practice/PracticeHeader";
import { QuestionPanel } from "@/components/practice/QuestionPanel";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { NavigationControls } from "@/components/practice/NavigationControls";
import { QuestionListSidebar } from "@/components/practice/QuestionListSidebar";
import { TimerModal } from "@/components/practice/TimerModal";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { useTimer } from "@/hooks/useTimer";
import { useQuestionNavigation } from "@/hooks/useQuestionNavigation";
import "./practice-session.css";

function PracticeSessionContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Custom hooks
  const {
    questions,
    answers,
    isLoading,
    isSubmitting,
    error,
    aiFeedback,
    loadingFeedback,
    loadSession,
    handleAnswerChange: sessionHandleAnswerChange,
    handleSubmit: sessionHandleSubmit,
    handleGetFeedback,
    handleAddSimilarQuestion,
    clearAiFeedback,
    resetQuestionTimer,
    getTimeSpent,
  } = usePracticeSession(sessionId);

  const timer = useTimer(sessionId);

  const {
    currentIndex,
    currentQuestion,
    currentAnswer,
    showFeedback,
    setCurrentIndex,
    setShowFeedback,
    navigateToQuestion,
    handleNext: navHandleNext,
    handlePrevious: navHandlePrevious,
  } = useQuestionNavigation(questions, answers);

  // Local UI state
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(3); // Default confidence

  // Draggable divider state
  const [dividerPosition, setDividerPosition] = useState(480); // Initial width for right panel
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(480);

  // Saved questions (local persistence)
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("saved-questions");
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      
      // If typing in an input, ONLY handle Enter key (for submission), ignore everything else
      if (isInputFocused && key !== 'enter') {
        return;
      }

      // Prevent default behavior for keys we handle (unless typing)
      const isHandledKey = ['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'Enter'].includes(event.key);
      if (isHandledKey && !isInputFocused) {
        event.preventDefault();
      }

      if (!currentQuestion || isSubmitting) return;

      const isMultipleChoice = currentQuestion.question.question_type === 'mc';

      // --- Handle Answer Selection (1, 2, 3, 4, A, B, C, D) ---
      // Only if NOT typing in an input box
      if (!isInputFocused && isMultipleChoice && !showFeedback) {
        const options = Array.isArray(currentQuestion.question.answer_options)
          ? currentQuestion.question.answer_options
          : Object.entries(currentQuestion.question.answer_options);

        let selectedOptionId: string | undefined;

        // Map numerical keys to options
        if (key >= '1' && key <= '4') { // Assuming max 4 options for now
          const index = parseInt(key) - 1;
          if (index < options.length) {
            selectedOptionId = String((options[index] as any).id || (options[index] as any)[0]);
          }
        } else if (key >= 'a' && key <= 'd') { // Map alphabetical keys to options
          const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
          if (index < options.length) {
            selectedOptionId = String((options[index] as any).id || (options[index] as any)[0]);
          }
        }

        if (selectedOptionId) {
          handleAnswerChange(selectedOptionId);
        }
      }

      // --- Handle Enter Key for Submit/Next ---
      if (key === 'enter') {
        // For Enter, we generally want to prevent default (form submission) and handle it manually
        event.preventDefault();
        
        if (!showFeedback) { // Currently answering
          if (currentAnswer?.userAnswer.length > 0 && !isSubmitting) {
            handleSubmit();
          }
        } else { // Feedback is shown
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestion, currentAnswer, showFeedback, isSubmitting, handleAnswerChange, handleSubmit, handleNext]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestion || showFeedback) return;
    sessionHandleAnswerChange(currentQuestion.question.id, value);
  };

  const handleSubmit = async () => {
    if (!currentAnswer || !currentQuestion) return;
    // Submit with current confidence score (default or user-selected)
    const timeSpent = getTimeSpent();
    const isCorrect = await sessionHandleSubmit(
      currentQuestion.question.id,
      currentAnswer.userAnswer,
      confidenceScore, // Use current confidence score
      timeSpent
    );

    if (isCorrect !== undefined) {
      setShowFeedback(true);
    }
  };

  const handleConfidenceSelected = (selectedConfidence: number) => {
    // Just update the confidence score, don't submit
    setConfidenceScore(selectedConfidence);
  };

  const handleNext = () => {
    const isLastQuestion = handleNavigation(() => navHandleNext());
    if (isLastQuestion) {
      router.push(`/practice/${sessionId}/summary`);
    }
  };

  const handlePrevious = () => {
    handleNavigation(() => navHandlePrevious());
  };

  const handleQuestionNavigation = (questionIndex: number) => {
    clearAiFeedback();
    resetQuestionTimer();
    navigateToQuestion(questionIndex);
    setShowQuestionList(false);
  };

  const handleGetAiFeedback = () => {
    if (!currentQuestion) return;
    handleGetFeedback(currentQuestion.question.id);
  };

  const handleGetSimilarQuestion = async () => {
    if (!currentQuestion) return;

    try {
      // Add similar question to the end of the list (don't navigate to it)
      await handleAddSimilarQuestion(
        currentQuestion.question.id,
        currentQuestion.topic.id
      );

      // Just move to the next question like skip button
      handleNext();
    } catch (error) {
      console.error("Failed to add similar question:", error);
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion) return;
    const qid = currentQuestion.question.id;
    setSavedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(qid);
      try {
        localStorage.setItem("saved-questions", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
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

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Left question panel */}
          <div className="flex-1 p-6 space-y-4 min-w-0">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          {/* Divider */}
          <div className="w-1 bg-border" />
          {/* Right answer panel */}
          <div className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col" style={{ width: `480px` }}>
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-64" />
                </div>
              ))}
            </div>
            <div className="mt-auto p-4 border-t border-border bg-card/70">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentQuestion) {
    return (
      <ErrorDisplay
        message={error || "Question not found"}
        onRetry={() => router.push("/dashboard/study-plan")}
        retryLabel="Back to Study Plan"
      />
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header with Progress */}
      <PracticeHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        timerMode={timer.timerMode}
        time={timer.time}
        isRunning={timer.isRunning}
        formatTime={timer.formatTime}
        onToggleQuestionList={() => setShowQuestionList(!showQuestionList)}
        
        // Timer Props
        showTimerModal={timer.showTimerModal}
        onToggleTimerModal={timer.setShowTimerModal}
        showTimerSetup={timer.showTimerSetup}
        setShowTimerSetup={timer.setShowTimerSetup}
        customHours={timer.customHours}
        setCustomHours={timer.setCustomHours}
        customMinutes={timer.customMinutes}
        setCustomMinutes={timer.setCustomMinutes}
        onStartStopwatch={timer.handleStartStopwatch}
        onStartTimer={timer.handleStartTimer}
        onPauseResume={timer.handlePauseResume}
        onReset={timer.handleReset}
        onCloseTimer={timer.handleCloseTimer}
        
        onExit={() => router.push("/dashboard/study-plan")}
      />

      <div
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Left Sidebar - Question List */}
        {showQuestionList && (
          <QuestionListSidebar
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onNavigate={handleQuestionNavigation}
            onClose={() => setShowQuestionList(false)}
          />
        )}

        {/* Question Panel - Flexible width */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuestionPanel question={currentQuestion} />
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

        {/* Right Panel - Answer Choices & Feedback - Dynamic width */}
        <div
          className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col"
          style={{ width: `${dividerPosition}px` }}
        >
          <AnswerPanel
            question={currentQuestion}
            answer={currentAnswer}
            showFeedback={showFeedback}
            aiFeedback={aiFeedback}
            loadingFeedback={loadingFeedback}
            onAnswerChange={handleAnswerChange}
            onGetFeedback={handleGetAiFeedback}
            onGetSimilarQuestion={handleGetSimilarQuestion}
            onSaveQuestion={handleSaveQuestion}
            isQuestionSaved={savedQuestionIds.has(currentQuestion.question.id)}
            onConfidenceSelect={handleConfidenceSelected}
            defaultConfidence={confidenceScore}
          />

          {/* Navigation Controls */}
          <NavigationControls
            showFeedback={showFeedback}
            hasAnswer={!!currentAnswer}
            isSubmitting={isSubmitting}
            isFirstQuestion={currentIndex === 0}
            isLastQuestion={currentIndex === questions.length - 1}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      </div>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <ProtectedRoute>
      <PracticeSessionContent />
    </ProtectedRoute>
  );
}
