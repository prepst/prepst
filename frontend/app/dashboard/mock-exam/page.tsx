"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { Clock, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import { components } from "@/lib/types/api.generated";
import { Skeleton } from "@/components/ui/skeleton";

type MockExam = components["schemas"]["MockExamListItem"];

export default function MockExamPage() {
  const router = useRouter();
  const [exams, setExams] = useState<MockExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.not_started
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Mock SAT Exam</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Take a full-length, adaptive practice test that simulates the real SAT experience. 
              Timed conditions help you build stamina and test-taking strategies.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">2 Hours 8 Minutes</h3>
              <p className="text-sm text-muted-foreground">Standard test duration with breaks</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">4 Adaptive Modules</h3>
              <p className="text-sm text-muted-foreground">2 Reading & Writing, 2 Math sections</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Smart Scoring</h3>
              <p className="text-sm text-muted-foreground">Instant results and performance analysis</p>
            </div>
          </div>

          {/* Start New Exam */}
          <div className="relative overflow-hidden bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-border p-10 shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Ready to test your skills?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Make sure you have 2+ hours available in a quiet environment. 
                  This test mimics real exam conditions and cannot be paused once a module starts.
                </p>
              </div>
              <Button
                onClick={createMockExam}
                disabled={isCreating}
                className="h-14 px-10 text-lg font-semibold bg-[#866ffe] hover:bg-[#7a5ffe] text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shrink-0"
              >
                {isCreating ? "Preparing Exam..." : "Start Mock Exam"}
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
            <h2 className="text-2xl font-bold text-foreground">
              Exam History
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
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
                  Your exam history will appear here. Start your first mock exam to establish a baseline score.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam, index) => (
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
                            {exam.started_at ? formatDate(exam.started_at) : "Not started"}
                          </span>
                          {exam.completed_at && (
                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                              <AlertCircle className="w-4 h-4" /> {/* Using AlertCircle as generic icon for completed */}
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {exam.status === "completed" && exam.total_score != null && (
                        <div className="flex items-center gap-8 px-6 border-l border-border/50">
                          <div className="text-center">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                            <p className="text-3xl font-black text-foreground">{exam.total_score}</p>
                          </div>
                          <div className="hidden sm:block text-center">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Math</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{exam.math_score ?? "-"}</p>
                          </div>
                          <div className="hidden sm:block text-center">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">R&W</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{exam.rw_score ?? "-"}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                        {exam.status === "completed" ? (
                          <Button
                            variant="outline"
                            className="w-full md:w-auto border-border hover:bg-accent text-foreground"
                            onClick={() => router.push(`/mock-exam/${exam.id}/results`)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
