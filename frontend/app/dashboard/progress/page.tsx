"use client";

import {
  useStudyPlan,
  useGrowthCurve,
  useSkillHeatmap,
  useMockExamAnalytics,
} from "@/hooks/queries";
import { MockExamPerformance } from "@/components/analytics/MockExamPerformance";
import { LineChart } from "@/components/charts/LineChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { AreaChart } from "@/components/charts/AreaChart";
import { SkillRadialChart } from "@/components/charts/SkillRadialChart";
import { PredictiveSATTracker } from "@/components/analytics/PredictiveSATTracker";
import MagicBento from "@/components/dashboard/MagicBento";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

function ProgressContent() {
  const router = useRouter();
  // Use TanStack Query hooks for automatic caching
  const { data: studyPlan, isLoading: studyPlanLoading } = useStudyPlan();
  const growthCurveQuery = useGrowthCurve(undefined, 30);
  const heatmapQuery = useSkillHeatmap();
  const {
    data: mockExamData,
    isLoading: mockExamLoading,
    isError: mockExamError,
  } = useMockExamAnalytics();

  // Derive data from queries
  const growthData = growthCurveQuery.data?.data || [];
  const heatmap = heatmapQuery.data?.heatmap || {};

  // Combined loading state
  const chartsLoading = growthCurveQuery.isLoading || heatmapQuery.isLoading;

  if (studyPlanLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-80 rounded-xl" />
            <Skeleton className="h-6 w-[500px] rounded-lg" />
          </div>

          {/* Skill Mastery Section Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-56 rounded-lg" />
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm"
                >
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="aspect-square rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-card border border-border rounded-[2.5rem] p-12 shadow-xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-8">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
              No Progress Data Yet
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Create a study plan to start tracking your SAT progress and see
              detailed analytics.
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
  const currentTotal =
    (study_plan.current_math_score ?? 0) + (study_plan.current_rw_score ?? 0);
  const targetTotal =
    (study_plan.target_math_score ?? 0) + (study_plan.target_rw_score ?? 0);
  const improvement = targetTotal - currentTotal;

  // Create SAT-focused card data with beautiful colors
  // Total scores are in positions 3 & 4 to make them the biggest cards
  const satCardData = [
    {
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple-blue gradient for current math
      title: study_plan.current_math_score?.toString() || "0",
      description: "Current Math Score",
      label: "Math",
    },
    {
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-red gradient for target math
      title: study_plan.target_math_score?.toString() || "800",
      description: "Target Math Score",
      label: "Target",
    },
    {
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Mint-pink gradient for current total (BIG CARD)
      title: currentTotal.toString(),
      description: `Current Total Score • ${
        improvement > 0 ? `+${improvement} to go` : "Target reached!"
      }`,
      label: "Current Total",
    },
    {
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Pink-yellow gradient for target total (BIG CARD)
      title: targetTotal.toString(),
      description: "Total Target Score",
      label: "Target",
    },
    {
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Blue-cyan gradient for current R/W
      title: study_plan.current_rw_score?.toString() || "0",
      description: "Current English R/W Score",
      label: "English R/W",
    },
    {
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green-teal gradient for target R/W
      title: study_plan.target_rw_score?.toString() || "800",
      description: "Target English R/W Score",
      label: "Target",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Progress Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor your SAT preparation journey and track your improvement
          </p>
        </div>

        {/* Skill Mastery Heatmap */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Skill Mastery
          </h2>
          {heatmapQuery.isLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm"
                >
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="aspect-square rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            Object.keys(heatmap).length > 0 && (
              <div className="space-y-8">
                {Object.entries(heatmap).map(([categoryName, category]) => (
                  <div key={categoryName} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {categoryName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-muted-foreground bg-muted font-medium"
                      >
                        {category.section === "math"
                          ? "Math"
                          : "Reading & Writing"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.skills.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="bg-card rounded-2xl p-1 border border-border shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <SkillRadialChart
                            skillName={skill.skill_name}
                            mastery={skill.mastery}
                            correctAttempts={skill.correct_attempts}
                            totalAttempts={skill.total_attempts}
                            velocity={skill.velocity}
                            plateau={skill.plateau}
                            skillId={skill.skill_id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* SAT Score Overview */}
        {/* <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            SAT Score Overview
          </h2>
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={120}
            particleCount={25}
            glowColor="132, 0, 255"
            cardData={satCardData}
          />
        </div> */}

        {/* Charts Section */}
        {chartsLoading ? (
          <div className="space-y-16">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        ) : (
          <>
            {/* SAT Score Progress */}
            {growthData.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  SAT Score Progress
                </h2>
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                  <LineChart
                    data={growthData.map((point) => ({
                      ...point,
                      date: new Date(point.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }),
                      total:
                        (point.predicted_sat_math || 0) +
                        (point.predicted_sat_rw || 0),
                    }))}
                    lines={[
                      {
                        dataKey: "predicted_sat_math",
                        color: "#10b981",
                        name: "Math Score",
                      },
                      {
                        dataKey: "predicted_sat_rw",
                        color: "#8b5cf6",
                        name: "R/W Score",
                      },
                      {
                        dataKey: "total",
                        color: "#3b82f6",
                        name: "Total Score",
                      },
                    ]}
                    xKey="date"
                    height={350}
                    yLabel="SAT Score"
                  />
                </div>
              </div>
            )}

            {/* Mastery Progress by Category */}
            {Object.keys(heatmap).length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Mastery by Category
                </h2>
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                  <RadarChart
                    data={(() => {
                      const categoryData = Object.entries(heatmap).map(
                        ([name, cat]) => ({
                          category: name,
                          mastery:
                            (cat.skills.reduce((sum, s) => sum + s.mastery, 0) /
                              cat.skills.length) *
                            100,
                          section: cat.section,
                          totalAttempts: cat.skills.reduce(
                            (sum, s) => sum + s.total_attempts,
                            0
                          ),
                        })
                      );

                      // Sort by total attempts and take top 8, or all if fewer than 8
                      const sortedData = categoryData.sort(
                        (a, b) => b.totalAttempts - a.totalAttempts
                      );
                      return sortedData.slice(0, 8);
                    })()}
                    dataKey="mastery"
                    categoryKey="category"
                    name="Mastery %"
                    height={350}
                    formatTooltip={(val) => `${Number(val).toFixed(1)}%`}
                  />
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Average Mastery:</span>
                      <span className="font-bold text-primary">
                        {(() => {
                          const categoryData = Object.entries(heatmap).map(
                            ([name, cat]) =>
                              (cat.skills.reduce(
                                (sum, s) => sum + s.mastery,
                                0
                              ) /
                                cat.skills.length) *
                              100
                          );
                          return `${(
                            categoryData.reduce((sum, val) => sum + val, 0) /
                            categoryData.length
                          ).toFixed(1)}%`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mock Exam Progress */}
            <MockExamPerformance
              data={mockExamData}
              isLoading={mockExamLoading}
              isError={mockExamError}
            />

            {/* Mastery Over Time */}
            {growthData.length > 0 &&
              growthData.some((d) => d.mastery !== undefined) && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Average Mastery Over Time
                  </h2>
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <AreaChart
                      data={growthData
                        .filter((d) => d.mastery !== undefined)
                        .map((point) => ({
                          ...point,
                          date: new Date(point.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          ),
                          mastery: (point.mastery || 0) * 100,
                        }))}
                      areas={[
                        {
                          dataKey: "mastery",
                          color: "#8b5cf6",
                          name: "Mastery %",
                        },
                      ]}
                      xKey="date"
                      height={300}
                      yLabel="Mastery %"
                      formatYAxis={(val) => `${val}%`}
                    />
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <ProgressContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
