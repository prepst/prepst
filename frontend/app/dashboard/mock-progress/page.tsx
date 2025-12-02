"use client";

import { useMockExamAnalytics } from "@/hooks/queries";
import { LineChart } from "@/components/charts/LineChart";
import { Skeleton } from "@/components/ui/skeleton";

export default function MockProgressPage() {
  // Use TanStack Query hook for data fetching
  const { data: mockExamData, isLoading: loading } = useMockExamAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4 py-8">
            <Skeleton className="h-10 w-72 mb-8" />
            <div className="bg-white border rounded-2xl p-8">
              <Skeleton className="h-80 w-full rounded-xl" />
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg p-4 text-center"
                  >
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Mock Exam Progress
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Track your performance trends and score improvements over time.
            </p>
          </div>

          {/* Mock Exam Performance */}
          <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">Performance Trend</h2>
            </div>
            
            {mockExamData && mockExamData.recent_exams.length > 0 ? (
              <div className="space-y-10">
                <div className="h-[400px] w-full">
                  <LineChart
                    data={mockExamData.recent_exams.map((exam) => ({
                      ...exam,
                      date: new Date(exam.completed_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      ),
                    }))}
                    lines={[
                      {
                        dataKey: "total_score",
                        color: "hsl(var(--primary))", // Use theme primary color
                        name: "Total Score",
                      },
                    ]}
                    xKey="date"
                    height={400}
                    yLabel="Score"
                  />
                </div>

                {/* Mock Exam Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-muted/30 rounded-2xl p-6 hover:bg-muted/50 transition-colors border border-transparent hover:border-border group">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Exams</p>
                    <p className="text-3xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">
                      {mockExamData.total_count}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-2xl p-6 hover:bg-muted/50 transition-colors border border-transparent hover:border-border group">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Average Score</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform origin-left">
                      {mockExamData.recent_exams.length > 0
                        ? Math.round(
                            mockExamData.recent_exams.reduce(
                              (sum, exam) => sum + exam.total_score,
                              0
                            ) / mockExamData.recent_exams.length
                          )
                        : 0}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-2xl p-6 hover:bg-muted/50 transition-colors border border-transparent hover:border-border group">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Improvement</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform origin-left">
                      {mockExamData.recent_exams.length >= 2
                        ? (() => {
                            const scores = mockExamData.recent_exams.map(
                              (e) => e.total_score
                            );
                            const improvement =
                              scores[scores.length - 1] - scores[0];
                            return improvement > 0 ? `+${Math.round(improvement)}` : Math.round(improvement);
                          })()
                        : "—"}
                      <span className="text-lg font-medium text-muted-foreground ml-1">pts</span>
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-2xl p-6 hover:bg-muted/50 transition-colors border border-transparent hover:border-border group">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Latest Score</p>
                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform origin-left">
                      {mockExamData.recent_exams.length > 0
                        ? mockExamData.recent_exams[mockExamData.recent_exams.length - 1].total_score
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-muted-foreground/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Data Available
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Complete your first mock exam to unlock detailed performance analytics and trend tracking.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
