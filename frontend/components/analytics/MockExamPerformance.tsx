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
  const mockExamMax = mockExamScores.length ? Math.max(...mockExamScores) : 0;
  const scoreSpan = Math.max(mockExamMax - mockExamMin, 80);
  const scorePad = Math.max(40, Math.round(scoreSpan * 0.35));
  const scoreLow = mockExamScores.length
    ? Math.max(200, Math.floor((mockExamMin - scorePad) / 50) * 50)
    : 400;
  let scoreHigh = mockExamScores.length
    ? Math.min(1600, Math.ceil((mockExamMax + scorePad) / 50) * 50)
    : 1600;
  if (scoreHigh - scoreLow < 200) scoreHigh = Math.min(1600, scoreLow + 200);
  const mockExamDomain: [number, number] = [scoreLow, scoreHigh];
  const scoreStep = scoreHigh - scoreLow > 400 ? 100 : 50;
  const mockExamYTicks = Array.from(
    { length: Math.floor((scoreHigh - scoreLow) / scoreStep) + 1 },
    (_, i) => scoreLow + i * scoreStep
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
    <div>
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-6">
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
                Performance trend
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  improvementFromLowest >= 0
                    ? "border-progress/40 bg-progress-soft text-progress"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                {improvementFromLowest >= 0 ? "+" : "-"}
                {Math.abs(improvementFromLowest).toFixed(0)} pts
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {mockCurrentScore.toFixed(0)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  improvementFromLowest >= 0
                    ? "text-progress"
                    : "text-destructive"
                }`}
              >
                {improvementFromLowest >= 0 ? "+" : "-"}
                {Math.abs(improvementFromLowest).toFixed(0)} (
                {improvementPctFromLowest.toFixed(1)}%)
              </span>
              <span className="text-xs text-muted-foreground">
                From {mockStartScore.toFixed(0)} · {mockExamPoints.length} exams
              </span>
            </div>

            <div className="h-[200px] sm:h-[280px]">
              <LineChart
                data={mockExamPoints}
                lines={[
                  {
                    dataKey: "total_score",
                    color: "#1d9bf0",
                    name: "Total Score",
                  },
                ]}
                xKey="date"
                height="100%"
                yDomain={mockExamDomain}
                xTicks={mockExamTicks}
                yTicks={mockExamYTicks}
                yAxisWidth={36}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                showLegend={false}
                gridColorDark="rgba(255,255,255,0.08)"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-muted/50 p-2.5 sm:p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Latest
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground sm:text-2xl">
                  {mockCurrentScore.toFixed(0)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-2.5 sm:p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Average
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-study sm:text-2xl">
                  {Math.round(data.avg_total_score)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-2.5 sm:p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Change
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-progress sm:text-2xl">
                  {improvementFromLowest > 0 ? "+" : ""}
                  {Math.round(improvementFromLowest)}
                </p>
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
              <div className="bg-study-soft border border-study/30 rounded-lg p-4 max-w-md">
                <p className="text-sm text-study">
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
