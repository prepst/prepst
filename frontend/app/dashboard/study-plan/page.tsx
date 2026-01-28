"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useStudyPlan } from "@/hooks/queries";
import { useMockExams } from "@/hooks/queries/useMockExams";
import { getSessionStatus } from "@/lib/utils/session-utils";
import type { PracticeSession } from "@/lib/types";
import { useDeleteStudyPlan } from "@/hooks/mutations";
import { isSameWeek } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Calendar, Zap } from "lucide-react";
import {
  TodoSection as TodoSectionType,
  TodoSession,
} from "@/components/study-plan/types";
import { TodoSection } from "@/components/study-plan/todo-section";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackButton } from "@/components/FeedbackButton";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ONBOARDING_CONTENT } from "@/lib/onboardingContent";

// Helper function to sort sessions within a section
function sortSessionsInSection(sessions: TodoSession[]): TodoSession[] {
  return sessions.sort((a, b) => {
    const statusA = getSessionStatus(a);
    const statusB = getSessionStatus(b);

    // In-progress sessions go to top
    if (statusA === "in-progress" && statusB !== "in-progress") return -1;
    if (statusB === "in-progress" && statusA !== "in-progress") return 1;

    // Completed sessions go to bottom
    if (statusA === "completed" && statusB !== "completed") return 1;
    if (statusB === "completed" && statusA !== "completed") return -1;

    // Otherwise maintain date order
    const dateA = new Date(a.scheduled_date || 0).getTime();
    const dateB = new Date(b.scheduled_date || 0).getTime();
    return dateA - dateB;
  });
}

// Helper function to categorize sessions into sections
function categorizeSessions(
  sessions: PracticeSession[],
  mockExams: any[] = []
): TodoSectionType[] {
  // Convert all sessions to TodoSession with priority
  const allSessions: TodoSession[] = sessions.map((session) => {
    const status = getSessionStatus(session);

    // Determine priority
    let priority: "important" | "new-product" | "delayed" | undefined;
    if (status === "overdue") {
      priority = "important";
    } else if (status === "in-progress") {
      priority = "delayed";
    }

    return { ...session, priority };
  });

  // Split all sessions into two halves (regardless of completion status)
  const totalSessions = allSessions.length;
  const firstHalfCount = Math.ceil(totalSessions / 2); // If odd, first half gets the extra one

  const thisWeekSessions = sortSessionsInSection(
    allSessions.slice(0, firstHalfCount)
  );
  const nextWeekSessions = sortSessionsInSection(
    allSessions.slice(firstHalfCount)
  );

  // Process Mock Exams for "This Week"
  const now = new Date();
  const thisWeekMockExams = mockExams.filter((exam) => {
    const examDate = exam.started_at
      ? new Date(exam.started_at)
      : new Date(exam.created_at);
    return isSameWeek(examDate, now);
  });

  const thisWeekMockTodos: TodoSession[] = thisWeekMockExams.map((exam) => ({
    id: exam.id,
    study_plan_id: sessions[0]?.study_plan_id || "mock",
    scheduled_date: exam.created_at,
    session_number: 0,
    status:
      exam.status === "completed"
        ? "completed"
        : exam.status === "in_progress"
          ? "in-progress"
          : "upcoming",
    started_at: exam.started_at,
    completed_at: exam.completed_at,
    created_at: exam.created_at,
    updated_at: exam.updated_at,
    topics: [],
    total_questions: exam.total_questions || 98,
    completed_questions: exam.completed_questions || 0,
    score: exam.total_score,
    examType: "mock-exam",
  }));

  // Create default mock test session placeholder
  const defaultMockSession: TodoSession = {
    id: "mock-test",
    study_plan_id: sessions[0]?.study_plan_id || "",
    scheduled_date: new Date().toISOString(),
    session_number: 0,
    status: "upcoming",
    started_at: null,
    completed_at: null,
    created_at: null,
    updated_at: null,
    topics: [],
    total_questions: 98,
    completed_questions: 0,
    examType: "mock-exam",
  };

  // If we have real mocks this week, use them. Otherwise use default placeholder.
  // We also append the default placeholder if all current mocks are completed,
  // encouraging another one (optional, but sticking to "show what I did" logic + "what to do")
  // For now, let's just show the list if not empty, else the placeholder.
  const mock1Todos =
    thisWeekMockTodos.length > 0 ? thisWeekMockTodos : [defaultMockSession];

  return [
    {
      id: "this-week",
      title: "This Week Batch",
      icon: "📅",
      todos: thisWeekSessions,
    },
    {
      id: "mock-1",
      title: "Mock Test",
      icon: "🎯",
      todos: mock1Todos,
    },
    {
      id: "next-week",
      title: "Next Week Batch",
      icon: "📆",
      todos: nextWeekSessions,
    },
    {
      id: "mock-2",
      title: "Mock Test",
      icon: "🎯",
      todos: [{ ...defaultMockSession, id: "mock-test-2" }],
    },
  ];
}

function StudyPlanContent() {
  const router = useRouter();
  const { data: studyPlan, isLoading, error, refetch } = useStudyPlan();
  const { data: mockExamsData } = useMockExams();

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const deleteStudyPlanMutation = useDeleteStudyPlan();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sections, setSections] = useState<TodoSectionType[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "completed">("all");

  // Initialize sections when study plan loads
  // Only update sections when the study plan ID changes or sessions length changes
  // to preserve manual drag-and-drop ordering
  useEffect(() => {
    if (studyPlan?.study_plan?.sessions) {
      setSections(
        categorizeSessions(studyPlan.study_plan.sessions, mockExamsData?.exams)
      );
    }
  }, [
    studyPlan?.study_plan?.id,
    studyPlan?.study_plan?.sessions?.length,
    mockExamsData?.exams,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-6 w-96 rounded-lg" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-3xl p-8 shadow-sm border border-border space-y-6"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <Skeleton className="h-8 w-40 rounded-lg" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !studyPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-card border border-border rounded-[2.5rem] p-12 shadow-xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-8">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
              No Study Plan Yet
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Create a personalized study plan tailored to your SAT goals and
              timeline to start your journey.
            </p>
            <Button
              onClick={() => router.push("/onboard")}
              size="lg"
              className="h-12 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Create Study Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { study_plan } = studyPlan;

  const handleToggleTodo = (todoId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        todos: section.todos.map((todo) => {
          if (todo.id === todoId) {
            const status = getSessionStatus(todo);
            // Toggle between completed and in-progress
            return todo;
          }
          return todo;
        }),
      }))
    );
  };

  const handleDeletePlan = async () => {
    setIsDeleting(true);
    deleteStudyPlanMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setIsDeleting(false);
        refetch();
      },
      onError: (err) => {
        alert(
          err instanceof Error ? err.message : "Failed to delete study plan"
        );
        setIsDeleting(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Personalized Learning
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              SAT Study Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personalized roadmap • {study_plan.sessions.length} sessions
              total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
              <Button
                className="rounded-lg shadow-none"
                size="sm"
                variant={activeFilter === "all" ? "default" : "ghost"}
                onClick={() => setActiveFilter("all")}
              >
                All
              </Button>
              <Button
                variant={activeFilter === "completed" ? "default" : "ghost"}
                className="rounded-lg shadow-none"
                size="sm"
                onClick={() => setActiveFilter("completed")}
              >
                Completed
              </Button>
            </div>

            <div className="h-8 w-px bg-border/50 mx-2 hidden md:block" />

            <Button
              variant="outline"
              className="rounded-xl border-border/60 hover:bg-muted/50"
              onClick={() => router.push("/onboard")}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {study_plan.sessions.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No Practice Sessions
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              It looks like your plan is empty. Create a new study plan to
              generate your personalized schedule.
            </p>
            <Button
              onClick={() => router.push("/onboard")}
              size="lg"
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Study Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {sections
              .map((section) => {
                // Filter todos based on activeFilter
                const filteredTodos =
                  activeFilter === "completed"
                    ? section.todos.filter((todo) => {
                      const status = getSessionStatus(todo);
                      return status === "completed";
                    })
                    : section.todos;

                // Only show section if it has todos after filtering
                if (
                  filteredTodos.length === 0 &&
                  activeFilter === "completed"
                ) {
                  return null;
                }

                return (
                  <TodoSection
                    key={section.id}
                    section={{ ...section, todos: filteredTodos }}
                    onToggleTodo={handleToggleTodo}
                    isDraggedOver={false}
                  />
                );
              })
              .filter(Boolean)}
          </div>
        )}
      </div>

      <FeedbackButton />
      <OnboardingModal pageId="study-plan" steps={ONBOARDING_CONTENT["study-plan"]} />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Delete Study Plan?
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              This will permanently delete your study plan and all{" "}
              <span className="font-bold text-foreground">
                {study_plan.sessions.length} practice sessions
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StudyPlanPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <StudyPlanContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
