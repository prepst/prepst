"use client";

import { BookOpen, Target, Calendar, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudyPlan, useMockExamAnalytics } from "@/hooks/queries";

export default function QuickActionsGrid() {
  const router = useRouter();
  const { data: studyPlan } = useStudyPlan();
  const mockExamQuery = useMockExamAnalytics();
  const mockExamData = mockExamQuery.data || null;
  const mockExamPerformance = mockExamData?.recent_exams || [];

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

  const stats = [
    {
      label: "Study Plan",
      value: `${completedSessions}/${totalSessions}`,
      desc: "Sessions completed",
      icon: BookOpen,
      progress: completionRate,
    },
    {
      label: "Mock Exams",
      value: totalMockExams.toString(),
      desc: averageScore > 0 ? `Avg: ${averageScore}` : "No scores yet",
      icon: Target,
    },
    {
      label: "Test Date",
      value: daysUntilTest > 0 ? daysUntilTest.toString() : "N/A",
      desc: daysUntilTest > 0 ? "days remaining" : "No date set",
      icon: Calendar,
    },
    {
      label: "Overall",
      value: `${Math.round(completionRate)}%`,
      desc: "Progress",
      icon: TrendingUp,
    },
  ];

  const handleCardClick = (stat: typeof stats[0]) => {
    if (stat.label === "Study Plan") {
      router.push("/dashboard/study-plan");
    } else if (stat.label === "Mock Exams") {
      router.push("/dashboard/mock-exam");
    } else if (stat.label === "Test Date") {
      router.push("/dashboard/my-sat");
    } else if (stat.label === "Overall") {
      router.push("/dashboard/progress");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={() => handleCardClick(stat)}
          className="rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40"
        >
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <stat.icon className="h-4 w-4" aria-hidden="true" />
            {stat.label}
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.desc}</p>
        </button>
      ))}
    </div>
  );
}
