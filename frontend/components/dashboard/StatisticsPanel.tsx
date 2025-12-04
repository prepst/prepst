"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { SkillProgressList } from "./SkillProgressList";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useProfile, useMockExamAnalytics } from "@/hooks/queries";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { api } from "@/lib/api";
import DashboardStatsBento from "@/components/dashboard/DashboardStatsBento";
import {
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Calendar as CalendarIcon,
  Award,
  Zap,
  CheckCircle,
} from "lucide-react";

interface StatisticsPanelProps {
  userName?: string;
  progressPercentage?: number;
  currentSession?: {
    number: number;
    title: string;
  };
}

interface StudyStats {
  totalStudyTime: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  improvementRate: number;
  weeklyActivity: Array<{ day: string; minutes: number; score?: number }>;
  topSkills: Array<{ name: string; mastery: number; color: string }>;
}

export function StatisticsPanel({
  userName = "Buyan Khurelbaatar",
  progressPercentage = 32,
  currentSession,
}: StatisticsPanelProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profileData } = useProfile();
  const { studyPlan, isLoading: isLoadingStudyPlan } = useStudyPlan();
  const { data: mockExamAnalytics } = useMockExamAnalytics();

  // Helper functions for profile display
  const getDisplayName = () => {
    if (!profileData) return "";
    const profile = profileData.profile;
    if ((profile as any).name) return (profile as any).name;
    if (profile.email) return profile.email.split("@")[0];
    return "";
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    if (!displayName) return "U";
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName[0].toUpperCase();
  };

  // Calculate real progress percentage based on study plan
  const calculateProgressPercentage = () => {
    if (!studyPlan?.study_plan) return 0;

    const currentTotal =
      (studyPlan.study_plan.current_math_score ?? 0) +
      (studyPlan.study_plan.current_rw_score ?? 0);
    const targetTotal =
      (studyPlan.study_plan.target_math_score ?? 0) +
      (studyPlan.study_plan.target_rw_score ?? 0);

    if (targetTotal === 0) return 0;
    return Math.min(Math.round((currentTotal / targetTotal) * 100), 100);
  };

  const realProgressPercentage = calculateProgressPercentage();

  // Get real mock exams count from analytics
  const mockExamsCount = mockExamAnalytics?.total_count || 0;

  // Calculate questions done per week
  // Use total_questions_answered from profile stats and estimate weekly average
  const totalQuestionsAnswered =
    profileData?.stats?.total_questions_answered || 0;
  const questionsDoneThisWeek = (() => {
    // Simple estimate: if user has been active for less than a week, use total
    // Otherwise, estimate weekly average (rough calculation)
    if (totalQuestionsAnswered === 0) return 0;

    // For now, use a simple approach: estimate based on total
    // In a real implementation, you'd query session_questions with date filter for last 7 days
    // For simplicity, we'll use total / weeks since account creation (or use total if < 1 week)
    const accountCreatedAt = profileData?.profile?.created_at
      ? new Date(profileData.profile.created_at)
      : new Date();
    const daysSinceCreation = Math.max(
      1,
      Math.floor(
        (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const weeksSinceCreation = Math.max(1, Math.ceil(daysSinceCreation / 7));

    // If less than a week, return total
    if (daysSinceCreation < 7) {
      return totalQuestionsAnswered;
    }

    // Otherwise, estimate weekly average
    return Math.round(totalQuestionsAnswered / weeksSinceCreation);
  })();

  useEffect(() => {
    const loadStudyStats = async () => {
      try {
        setIsLoading(true);

        // Mock data for now - replace with real API calls
        const mockStats: StudyStats = {
          totalStudyTime: 1240, // minutes
          sessionsCompleted: 23,
          currentStreak: 7,
          longestStreak: 12,
          averageScore: 78,
          improvementRate: 12,
          weeklyActivity: [
            { day: "Mon", minutes: 45, score: 82 },
            { day: "Tue", minutes: 60, score: 85 },
            { day: "Wed", minutes: 30, score: 78 },
            { day: "Thu", minutes: 90, score: 88 },
            { day: "Fri", minutes: 75, score: 91 },
            { day: "Sat", minutes: 120, score: 89 },
            { day: "Sun", minutes: 0, score: 0 },
          ],
          topSkills: [
            { name: "Algebra", mastery: 85, color: "bg-blue-500" },
            {
              name: "Reading Comprehension",
              mastery: 78,
              color: "bg-green-500",
            },
            { name: "Geometry", mastery: 72, color: "bg-purple-500" },
            { name: "Grammar", mastery: 68, color: "bg-orange-500" },
            { name: "Data Analysis", mastery: 65, color: "bg-pink-500" },
          ],
        };

        setStudyStats(mockStats);
      } catch (error) {
        console.error("Failed to load study stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudyStats();
  }, []);

  if (isLoading) {
    return (
      <div className="w-64 md:w-72 xl:w-80 p-4 md:p-5 flex-shrink-0 bg-white rounded-3xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8"></div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-36 h-36 bg-gray-200 rounded-full mb-5"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-4 md:p-5 bg-card rounded-3xl shadow-sm border border-border">
      <h2 className="text-3xl font-bold mb-8 text-card-foreground">
        Study Statistics
      </h2>

      {/* Profile with Progress Ring */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-5">
          {/* Progress ring - simplified version */}
          <div className="w-36 h-36 rounded-full bg-primary/5 flex items-center justify-center relative shadow-sm border border-border">
            <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center">
              <div className="w-28 h-28 rounded-full overflow-hidden">
                <Image
                  src="/profile.png"
                  alt="Profile"
                  width={112}
                  height={112}
                  className="object-cover"
                />
              </div>
            </div>
            <Badge className="absolute -top-2 -right-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-sm font-bold rounded-full shadow-md">
              {isLoadingStudyPlan ? (
                <span
                  className="inline-flex items-center justify-center"
                  aria-label="Loading progress"
                >
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                </span>
              ) : !studyPlan ? (
                "0%"
              ) : (
                `${realProgressPercentage}%`
              )}
            </Badge>
          </div>
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-foreground">
          {getDisplayName() || userName}
        </h3>
        <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
          {realProgressPercentage >= 100
            ? "🎉 Congratulations! You've reached your target!"
            : `Keep studying! ${100 - realProgressPercentage}% to go!`}
        </p>
      </div>

      {/* Study Metrics */}
      {studyStats && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">
            This Week's Activity
          </h3>
          <DashboardStatsBento
            streak={
              profileData?.streak?.current_streak || studyStats.currentStreak
            }
            studyTime={`${Math.floor(studyStats.totalStudyTime / 60)}h ${
              studyStats.totalStudyTime % 60
            }m`}
            questionsDone={questionsDoneThisWeek}
            mockExams={mockExamsCount}
            studyTimeGoal="2h 0m"
            questionsGoal={50}
          />

          {/* Weekly Activity Chart */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Daily Study Time
            </h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={studyStats.weeklyActivity}>
                <XAxis
                  dataKey="day"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "currentColor",
                    className: "text-muted-foreground fill-current",
                  }}
                />
                <YAxis hide />
                <Bar
                  dataKey="minutes"
                  fill="var(--color-primary)"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Skills */}
      {studyStats && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Skills</h3>
          <div className="space-y-3">
            {studyStats.topSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${skill.color}`}></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {skill.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {skill.mastery}%
                  </span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.mastery}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Calendar */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Study Calendar
        </h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl bg-muted/30 p-4 border-0"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {studyStats
              ? `${studyStats.currentStreak} day streak`
              : "Start your study streak!"}
          </p>
        </div>
      </div>

      {/* Study Goals & Achievements */}
      {studyStats && (
        <div className="space-y-4">
          <Card className="p-5 bg-purple-500/10 border-purple-500/20 rounded-2xl shadow-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shadow-sm">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Study Goal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {studyStats.currentStreak >= 7
                    ? "🎉 Weekly goal achieved!"
                    : `${
                        7 - studyStats.currentStreak
                      } more days to weekly goal`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-green-500/10 border-green-500/20 rounded-2xl shadow-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shadow-sm">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Achievement</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {studyStats.improvementRate > 0
                    ? `+${studyStats.improvementRate}% improvement this week`
                    : "Keep studying to see improvement!"}
                </p>
              </div>
            </div>
          </Card>

          {currentSession && (
            <Card className="p-5 bg-orange-500/10 border-orange-500/20 rounded-2xl shadow-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shadow-sm">
                  <div className="w-7 h-7 rounded-full border-2 border-orange-600 dark:border-orange-400 border-t-transparent animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Session {currentSession.number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentSession.title}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
