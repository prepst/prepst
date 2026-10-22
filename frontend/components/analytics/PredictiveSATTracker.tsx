"use client";

import { useState } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { AreaChart } from "@/components/charts/AreaChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PredictiveScoresAnalytics } from "@/lib/types";

interface PredictiveSATTrackerProps {
  data: PredictiveScoresAnalytics;
}

export function PredictiveSATTracker({ data }: PredictiveSATTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const getGoalStatusVariant = (status: string) => {
    switch (status) {
      case "Ahead of Schedule":
        return "default";
      case "On Track":
        return "secondary";
      case "Behind Schedule":
        return "outline";
      case "Needs Acceleration":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case "Ahead of Schedule":
        return <CheckCircle className="w-4 h-4" />;
      case "On Track":
        return <Target className="w-4 h-4" />;
      case "Behind Schedule":
        return <AlertTriangle className="w-4 h-4" />;
      case "Needs Acceleration":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const formatDaysToGoal = (days: number | null) => {
    if (days === null) return "No goal set";
    if (days === 0) return "Goal reached!";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 365)} years`;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-study-soft/80 to-study-soft/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-study to-study rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-700 mb-2">
                SAT Score Predictions
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-study to-study bg-clip-text text-transparent">
                  {data.predicted_total_in_30_days}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  in 30 days
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="border-study/25 text-study hover:bg-study-soft hover:border-study transition-all duration-200"
          >
            {expanded ? "Hide Details" : "View Details"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current vs Predicted */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white/90 backdrop-blur-sm border border-study/25 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Current Total
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {data.current_total}
            </p>
          </div>
          <div className="bg-gradient-to-br from-study-soft to-study-soft border border-study/25 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-medium text-study uppercase tracking-wide mb-2">
              30-Day Prediction
            </p>
            <p className="text-2xl font-bold text-study">
              {data.predicted_total_in_30_days}
            </p>
          </div>
        </div>

        {/* Goal Status */}
        <div className="flex items-center gap-3">
          <Badge
            variant={getGoalStatusVariant(data.goal_status)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm rounded-full"
          >
            {getGoalStatusIcon(data.goal_status)}
            {data.goal_status}
          </Badge>
        </div>

        {/* Days to Goal */}
        {data.days_to_goal_total !== null && (
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-slate-600 mb-2">Days to goal</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatDaysToGoal(data.days_to_goal_total)}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-600 mb-2">
                  Velocity needed
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {data.velocity_needed}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-8 pt-4 border-t border-study/25">
            {/* Prediction Timeline Chart */}
            {data.prediction_timeline.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Score Trajectory (12 Weeks)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={data.prediction_timeline.map((point) => ({
                      ...point,
                      week: `Week ${point.week}`,
                    }))}
                    areas={[
                      {
                        dataKey: "total_score",
                        color: "#1d9bf0",
                        name: "Total Score",
                      },
                      {
                        dataKey: "math_score",
                        color: "#1d9bf0",
                        name: "Math",
                      },
                      {
                        dataKey: "rw_score",
                        color: "#00ba7c",
                        name: "R/W",
                      },
                    ]}
                    xKey="week"
                    height={300}
                    yLabel="Score"
                    formatXAxis={(val) => String(val).replace("Week ", "W")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Confidence Intervals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Confidence Intervals (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-destructive/25 bg-destructive-soft">
                    <CardContent className="p-3">
                      <p className="text-xs text-destructive font-medium">
                        Pessimistic
                      </p>
                      <p className="text-lg font-bold text-destructive">
                        {data.confidence_intervals.total.pessimistic}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-study/25 bg-study-soft">
                    <CardContent className="p-3">
                      <p className="text-xs text-study font-medium">
                        Realistic
                      </p>
                      <p className="text-lg font-bold text-study">
                        {data.confidence_intervals.total.realistic}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-progress/25 bg-progress-soft">
                    <CardContent className="p-3">
                      <p className="text-xs text-progress font-medium">
                        Optimistic
                      </p>
                      <p className="text-lg font-bold text-progress">
                        {data.confidence_intervals.total.optimistic}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-study/25 bg-study-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-study">Math</p>
                        <TrendingUp className="w-4 h-4 text-study" />
                      </div>
                      <p className="text-2xl font-bold text-study">
                        {data.predicted_math_in_30_days}
                      </p>
                      <p className="text-sm text-study">
                        Current: {data.current_math} •
                        {data.days_to_goal_math
                          ? ` Goal in ${formatDaysToGoal(
                              data.days_to_goal_math
                            )}`
                          : " No goal"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-progress/25 bg-progress-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-progress">
                          Reading & Writing
                        </p>
                        <TrendingUp className="w-4 h-4 text-progress" />
                      </div>
                      <p className="text-2xl font-bold text-progress">
                        {data.predicted_rw_in_30_days}
                      </p>
                      <p className="text-sm text-progress">
                        Current: {data.current_rw} •
                        {data.days_to_goal_rw
                          ? ` Goal in ${formatDaysToGoal(data.days_to_goal_rw)}`
                          : " No goal"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <Card className="border-study/25 bg-study-soft">
                <CardHeader>
                  <CardTitle className="text-base text-study">
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.recommendations.map((recommendation, idx) => (
                      <p key={idx} className="text-sm text-study">
                        {recommendation}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Alert */}
            {!data.on_track && data.goal_status !== "No Data" && (
              <Card className="border-schedule/25 bg-schedule-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-schedule" />
                    <h4 className="font-semibold text-schedule">
                      Action Needed
                    </h4>
                  </div>
                  <p className="text-sm text-schedule">
                    You&apos;re not currently on track to meet your goals.
                    Consider increasing your study time or focusing on your
                    weakest areas for maximum improvement.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
