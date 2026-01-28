"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStudyPlan, useMockExamAnalytics } from "@/hooks/queries";
import { useTheme } from "@/contexts/ThemeContext";

export default function QuickActionsGrid() {
  const router = useRouter();
  const { data: studyPlan } = useStudyPlan();
  const mockExamQuery = useMockExamAnalytics();
  const mockExamData = mockExamQuery.data || null;
  const mockExamPerformance = mockExamData?.recent_exams || [];
  const { isDarkMode } = useTheme();

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
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))",
      bgColor: "bg-purple-500",
      textColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-purple-700 dark:text-purple-300",
      progress: completionRate,
      progressColor: "bg-purple-500",
      progressBg: "bg-purple-200 dark:bg-purple-900/30",
    },
    {
      label: "Mock Exams",
      value: totalMockExams.toString(),
      desc: averageScore > 0 ? `Avg: ${averageScore}` : "No scores yet",
      icon: Target,
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
      bgColor: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Test Date",
      value: daysUntilTest > 0 ? daysUntilTest.toString() : "N/A",
      desc: daysUntilTest > 0 ? "days remaining" : "No date set",
      icon: Calendar,
      gradient: "from-orange-500/20 via-yellow-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))",
      bgColor: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-700 dark:text-orange-300",
    },
    {
      label: "Overall",
      value: `${Math.round(completionRate)}%`,
      desc: "Progress",
      icon: TrendingUp,
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))",
      bgColor: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-700 dark:text-green-300",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className={`group relative flex flex-row items-start p-3 rounded-xl border hover:shadow-lg hover:-translate-y-0.5 transition-all text-left overflow-hidden bg-gradient-to-br ${stat.gradient ||
            "from-purple-500/20 via-purple-500/10 to-transparent"
            } ${stat.label === "Study Plan" || stat.label === "Mock Exams" || stat.label === "Test Date" || stat.label === "Overall" ? "cursor-pointer" : ""
            } ${isDarkMode ? "border-border/30" : "border-border/50"}`}
          onClick={() => handleCardClick(stat)}
        >
          {/* Icon container */}
          <div
            className={`relative z-10 p-2 rounded-lg ${stat.bgColor} mr-3 group-hover:scale-105 transition-transform flex-shrink-0`}
            style={{ filter: stat.iconGlow }}
          >
            <stat.icon className={`w-4 h-4 text-white`} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 min-w-0">
            <div className="space-y-0.5">
              <h3
                className={`font-semibold text-xs ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {stat.label}
              </h3>
              <p
                className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {stat.value}
              </p>
              <p
                className={`text-xs ${isDarkMode ? "text-white/90" : "text-gray-700"
                  }`}
              >
                {stat.desc}
              </p>
            </div>
          </div>

          {/* Vertical Progress bar for Study Plan */}
          {stat.progress !== undefined && (
            <div className="relative z-10 ml-3 flex-shrink-0">
              <div className="flex flex-col items-center space-y-1">
                {/* Custom Vertical Progress Bar */}
                <div
                  className={`h-11 w-2 rounded-full ${isDarkMode ? "bg-white/20" : stat.progressBg
                    } relative overflow-hidden`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300 ${isDarkMode ? "bg-white" : stat.progressColor
                      }`}
                    style={{ height: `${stat.progress}%` }}
                  />
                </div>
                <p
                  className={`text-xs ${isDarkMode ? "text-white" : "text-gray-800"
                    } text-center`}
                >
                  {Math.round(stat.progress)}%
                </p>
              </div>
            </div>
          )}

          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDarkMode ? "via-white/10" : "via-white/5"
                } to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
