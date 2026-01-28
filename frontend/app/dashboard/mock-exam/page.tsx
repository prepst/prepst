"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { Clock, AlertCircle, Zap, Target, Award, BookOpen } from "lucide-react";
import { components } from "@/lib/types/api.generated";
import { Skeleton } from "@/components/ui/skeleton";
import { MockExamPerformance } from "@/components/analytics/MockExamPerformance";
import { useMockExamAnalytics } from "@/hooks/queries";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ONBOARDING_CONTENT } from "@/lib/onboardingContent";

type MockExam = components["schemas"]["MockExamListItem"];

export default function MockExamPage() {
  const router = useRouter();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const {
    data: mockExamData,
    isLoading: mockExamLoading,
    isError: mockExamError,
  } = useMockExamAnalytics();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(`${config.apiUrl}/api/mock-exams/`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to load exams");

      const data = await response.json();
      setExams(data.exams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  const createMockExam = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(`${config.apiUrl}/api/mock-exams/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_type: "full_length",
        }),
      });

      if (!response.ok) throw new Error("Failed to create exam");

      const data: components["schemas"]["MockExamResponse"] =
        await response.json();
      const examId = data.exam.id;

      // Navigate to first module (Reading/Writing Module 1)
      const firstModule = data.modules.find(
        (m) => m.module_type === "rw_module_1"
      );

      if (firstModule) {
        router.push(`/mock-exam/${examId}/module/${firstModule.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setIsCreating(false);
    }
  };

  const handleResumeExam = async (examId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      // Get exam details to find next incomplete module
      const response = await fetch(
        `${config.apiUrl}/api/mock-exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load exam");

      const data: components["schemas"]["MockExamResponse"] =
        await response.json();

      // Find first incomplete module
      const nextModule = data.modules.find(
        (m) => m.status === "not_started" || m.status === "in_progress"
      );

      if (nextModule) {
        router.push(`/mock-exam/${examId}/module/${nextModule.id}`);
      } else {
        // All modules complete, go to results
        router.push(`/mock-exam/${examId}/results`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume exam");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      not_started: "bg-muted text-muted-foreground",
      in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      completed: "bg-green-500/10 text-green-600 dark:text-green-400",
      abandoned: "bg-red-500/10 text-red-600 dark:text-red-400",
    };

    const labels = {
      not_started: "Not Started",
      in_progress: "In Progress",
      completed: "Completed",
      abandoned: "Abandoned",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.not_started
          }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl px-6 py-12 space-y-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Full-Length Practice Test
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Mock SAT Exam
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Experience the real SAT under timed conditions. Build endurance,
                  refine your strategy, and track your progress with detailed
                  analytics.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-transparent border border-blue-500/20 p-4 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                    128
                  </div>
                  <div className="text-xs font-semibold text-foreground mb-0.5">
                    Minutes Total
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Standard duration with breaks
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-transparent border border-purple-500/20 p-4 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                    4
                  </div>
                  <div className="text-xs font-semibold text-foreground mb-0.5">
                    Adaptive Modules
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    2 R&W • 2 Math sections
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-transparent border border-emerald-500/20 p-4 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                    Instant
                  </div>
                  <div className="text-xs font-semibold text-foreground mb-0.5">
                    Score & Analysis
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Detailed performance insights
                  </div>
                </div>
              </div>
            </div>

            {/* Start New Exam */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 md:p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Ready to test your skills?
                    </h2>
                  </div>
                  <div className="space-y-1.5 pl-14">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      Simulate real exam conditions and get instant feedback on
                      your performance.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>2+ hours recommended</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Quiet environment</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Cannot be paused</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={createMockExam}
                  disabled={isCreating}
                  className="h-12 px-6 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shrink-0 rounded-xl"
                >
                  {isCreating ? (
                    <>
                      <Zap className="w-5 h-5 mr-2 animate-pulse" />
                      Preparing Exam...
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5 mr-2" />
                      Start Mock Exam
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Previous Exams */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Exam History</h2>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : exams.length === 0 ? (
                <div className="bg-card rounded-3xl p-16 text-center border border-border border-dashed">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No exams taken yet
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your exam history will appear here. Start your first mock exam
                    to establish a baseline score.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {exams.slice(0, visibleCount).map((exam, index) => (
                      <div
                        key={exam.id}
                        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary/30 transition-all group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-foreground">
                                Mock Exam #{exams.length - index}
                              </h3>
                              {getStatusBadge(exam.status)}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {exam.started_at
                                  ? formatDate(exam.started_at)
                                  : "Not started"}
                              </span>
                              {exam.completed_at && (
                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                  <AlertCircle className="w-4 h-4" />{" "}
                                  {/* Using AlertCircle as generic icon for completed */}
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>

                          {exam.status === "completed" &&
                            exam.total_score != null && (
                              <div className="flex items-center gap-8 px-6 border-l border-border/50">
                                <div className="text-center">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Total
                                  </p>
                                  <p className="text-3xl font-black text-foreground">
                                    {exam.total_score}
                                  </p>
                                </div>
                                <div className="hidden sm:block text-center">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Math
                                  </p>
                                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {exam.math_score ?? "-"}
                                  </p>
                                </div>
                                <div className="hidden sm:block text-center">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    R&W
                                  </p>
                                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {exam.rw_score ?? "-"}
                                  </p>
                                </div>
                              </div>
                            )}

                          <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                            {exam.status === "completed" ? (
                              <Button
                                variant="outline"
                                className="w-full md:w-auto border-border hover:bg-accent text-foreground"
                                onClick={() =>
                                  router.push(`/mock-exam/${exam.id}/results`)
                                }
                              >
                                View Results
                              </Button>
                            ) : exam.status === "in_progress" ? (
                              <Button
                                onClick={() => handleResumeExam(exam.id)}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Resume Exam
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {visibleCount < exams.length && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleCount((prev) =>
                            Math.min(prev + 5, exams.length)
                          )
                        }
                        className="border-border hover:bg-accent text-foreground"
                      >
                        Show More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mock Exam Progress */}
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Mock Exam Progress
                </h2>
                <p className="text-muted-foreground">
                  Track your performance trends and score improvements over time.
                </p>
              </div>
              <MockExamPerformance
                data={mockExamData}
                isLoading={mockExamLoading}
                isError={mockExamError}
              />
            </div>
          </div>
        </div>
      </div>
      <OnboardingModal pageId="mock-exam" steps={ONBOARDING_CONTENT["mock-exam"]} />
    </>
  );
}
