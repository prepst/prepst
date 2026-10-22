"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ProgressOverviewProps {
  studyPlan?: any;
  mockExamPerformance?: any[];
  mockExamData?: any;
}

export function ProgressOverview({
  studyPlan,
  mockExamPerformance,
  mockExamData,
}: ProgressOverviewProps) {
  // Calculate progress metrics
  const totalSessions = studyPlan?.study_plan?.sessions?.length || 0;
  const completedSessions =
    studyPlan?.study_plan?.sessions?.filter(
      (s: any) => s.status === "completed"
    ).length || 0;
  const completionRate =
    totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Use mockExamData if available, otherwise fall back to mockExamPerformance
  const totalMockExams =
    mockExamData?.total_exams || mockExamPerformance?.length || 0;
  const averageScore = mockExamData?.avg_total_score
    ? Math.round(mockExamData.avg_total_score)
    : mockExamPerformance && mockExamPerformance.length > 0
    ? Math.round(
        mockExamPerformance.reduce((sum, exam) => sum + exam.total_score, 0) /
          mockExamPerformance.length
      )
    : 0;

  // Calculate days until test
  const testDate = studyPlan?.study_plan?.test_date
    ? new Date(studyPlan.study_plan.test_date)
    : null;
  const daysUntilTest = testDate
    ? Math.ceil(
        (testDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Your Progress Overview
        </h2>
        <p className="text-muted-foreground">
          Track your journey to SAT success
        </p>
      </div>

      {/* Main Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Study Plan Progress */}
        <Card className="border-0 shadow-none bg-study-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-study rounded-xl shadow-md">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-study font-medium">
                  Study Plan
                </p>
                <p className="text-2xl font-bold text-study dark:text-study">
                  {completedSessions}/{totalSessions}
                </p>
                <p className="text-xs text-study/80 dark:text-study/80">
                  Sessions completed
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={completionRate}
                className="h-2 bg-study-soft dark:bg-study/30"
                indicatorClassName="bg-study"
              />
              <p className="text-xs text-study mt-1">
                {Math.round(completionRate)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mock Exam Performance */}
        <Card className="border-0 shadow-none bg-study-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-study rounded-xl shadow-md">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-study font-medium">
                  Mock Exams
                </p>
                <p className="text-2xl font-bold text-study dark:text-study">
                  {totalMockExams}
                </p>
                <p className="text-xs text-study/80 dark:text-study/80">
                  {averageScore > 0 ? `Avg: ${averageScore}` : "No scores yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days Until Test */}
        <Card className="border-0 shadow-none bg-schedule-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-background text-schedule">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-schedule font-medium">
                  Test Date
                </p>
                <p className="text-2xl font-bold text-schedule dark:text-schedule">
                  {daysUntilTest > 0 ? daysUntilTest : "N/A"}
                </p>
                <p className="text-xs text-schedule/80 dark:text-schedule/80">
                  {daysUntilTest > 0 ? "days remaining" : "No date set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="border-0 shadow-none bg-progress-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-progress rounded-xl shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-progress font-medium">
                  Overall
                </p>
                <p className="text-2xl font-bold text-progress dark:text-progress">
                  {Math.round(completionRate)}%
                </p>
                <p className="text-xs text-progress/80">
                  Progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Plan Timeline */}
      {/* <div className="grid grid-cols-1 gap-6">
        <Card className="border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <div className="p-2 bg-study-soft rounded-lg">
                <BookOpen className="h-5 w-5 text-study" />
              </div>
              Study Plan Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan?.study_plan?.sessions
                ?.slice(0, 5)
                .map((session: any, index: number) => (
                  <div
                    key={session.id || `session-${index}`}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        session.status === "completed"
                          ? "bg-progress text-white"
                          : session.status === "in_progress"
                          ? "bg-schedule-soft text-schedule"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">
                        {session.topic_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">
                        {session.total_questions ||
                          session.topics?.reduce(
                            (sum: number, t: any) =>
                              sum + (t.num_questions || 0),
                            0
                          ) ||
                          0}{" "}
                        questions
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              {totalSessions > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    +{totalSessions - 5} more sessions
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
