"use client";

import type { useMockExamAnalytics } from "@/hooks/queries";
import { LineChart } from "@/components/charts/LineChart";
import { Skeleton } from "@/components/ui/skeleton";

type MockExamPerformanceProps = {
  data?: ReturnType<typeof useMockExamAnalytics>["data"];
  isLoading?: boolean;
  isError?: boolean;
  heading?: string;
};

export function MockExamPerformance({
  data,
  isLoading,
  isError,
  heading = "Mock Exam Performance",
}: MockExamPerformanceProps) {
  const mockExamPointsRaw =
    data?.recent_exams?.map((exam) => ({
      ...exam,
      date: new Date(exam.completed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    })) ?? [];

  const mockExamPoints = [...mockExamPointsRaw].sort(
    (a, b) =>
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );
  const mockExamScores = mockExamPoints.map(
    (exam) => Number(exam.total_score) || 0
  );
  const mockExamMin = mockExamScores.length ? Math.min(...mockExamScores) : 0;
  const mockExamFloor = Math.max(0, Math.floor((mockExamMin - 50) / 100) * 100);
  const mockExamDomain: [number, number] =
    mockExamScores.length > 0 ? [mockExamFloor, 1600] : [0, 1600];
  const mockExamYTicks = Array.from(
    { length: Math.floor((1600 - mockExamDomain[0]) / 200) + 1 },
    (_, i) => mockExamDomain[0] + i * 200
  );
  const mockExamTicks = Array.from(
    new Set(mockExamPoints.map((exam) => exam.date))
  );
  const mockExamFirst = mockExamPoints[0];
  const mockExamLatest = mockExamPoints[mockExamPoints.length - 1];
  const mockStartScore = Number(mockExamFirst?.total_score) || 0;
  const mockCurrentScore = Number(mockExamLatest?.total_score) || 0;
  const improvementFromLowest = mockExamScores.length
    ? mockCurrentScore - mockExamMin
    : 0;
  const improvementPctFromLowest =
    mockExamMin > 0 ? (improvementFromLowest / mockExamMin) * 100 : 0;

  return (
    <div className="mb-12">
      <div className="bg-card border border-border rounded-2xl p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Unable to load mock exam data
            </h3>
            <p className="text-sm text-muted-foreground">
              Please try again in a moment.
            </p>
          </div>
        ) : data && data.recent_exams?.length > 0 ? (
          <div className="bg-gradient-to-br from-white via-brand-surface/60 to-white dark:from-[#0f0f1a] dark:via-[#0b0b13] dark:to-[#0f0f1a] border border-brand-border/70 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="relative h-full p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-black/10 dark:bg-white/10 border border-white/10 text-foreground">
                    Performance trend
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${
                      improvementFromLowest >= 0
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/40"
                        : "bg-rose-500/10 text-rose-300 border-rose-400/40"
                    }`}
                  >
                    {improvementFromLowest >= 0 ? "+" : "-"}
                    {Math.abs(improvementFromLowest).toFixed(0)} pts
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-6 flex-wrap text-xs sm:text-base">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-4xl font-mono font-bold text-foreground">
                    {mockCurrentScore.toFixed(0)}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      improvementFromLowest >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {improvementFromLowest >= 0 ? "+" : "-"}
                    {Math.abs(improvementFromLowest).toFixed(0)} (
                    {improvementPctFromLowest.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground">
                  From {mockStartScore.toFixed(0)} start ·{" "}
                  {mockExamPoints.length} exams
                </div>
              </div>

              <div className="relative flex-1 rounded-xl border backdrop-blur-sm overflow-hidden border-black/10 bg-white/60 dark:border-white/5 dark:bg-black/10">
                <div className="h-full min-h-[320px]">
                  <LineChart
                    data={mockExamPoints}
                    lines={[
                      {
                        dataKey: "total_score",
                        color: "#3b82f6",
                        name: "Total Score",
                      },
                    ]}
                    xKey="date"
                    height={320}
                    yLabel="Score"
                    yDomain={mockExamDomain}
                    xTicks={mockExamTicks}
                    yTicks={mockExamYTicks}
                    gridColorDark="rgba(255,255,255,0.08)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div className="bg-white/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/10 rounded-xl p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Latest Total Score
                  </p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {mockCurrentScore.toFixed(0)}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/10 rounded-xl p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Average Score
                  </p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300 mt-1">
                    {Math.round(data.avg_total_score)}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/10 rounded-xl p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Improvement
                  </p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-300 mt-1">
                    {improvementFromLowest > 0 ? "+" : ""}
                    {Math.round(improvementFromLowest)} pts
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Mock Exams Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Take your first mock exam to start tracking your progress
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Tip:</strong> Mock exams help you practice under real
                  test conditions and track your improvement over time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
