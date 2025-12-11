"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  useProfile,
  useMockExamAnalytics,
  useStudyTime,
} from "@/hooks/queries";
import DashboardStatsBento from "@/components/dashboard/DashboardStatsBento";
import { Target, Award } from "lucide-react";
import { profileCache } from "@/lib/profile-cache";

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
  topSkills: Array<{ name: string; mastery: number; color: string }>;
}

// Initialize cache synchronously outside component to avoid flicker
const getInitialCache = () => {
  if (typeof window === 'undefined') return { photo: null, name: "" };
  const cached = profileCache.get();
  return {
    photo: cached?.profile_photo_url || null,
    name: cached?.display_name || "",
  };
};

export function StatisticsPanel({
  userName = "Buyan Khurelbaatar",
  progressPercentage = 32,
  currentSession,
}: StatisticsPanelProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);

  // Initialize with cached data synchronously - no flicker!
  const initialCache = getInitialCache();
  const [cachedProfilePhoto, setCachedProfilePhoto] = useState<string | null>(initialCache.photo);
  const [cachedDisplayName, setCachedDisplayName] = useState<string>(initialCache.name);

  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const { data: mockExamAnalytics } = useMockExamAnalytics();
  const { data: studyTimeData } = useStudyTime(7);

  // Update cache when profile data changes
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      const displayName = (profile as any).name || profile.email?.split("@")[0] || "";
      const photoUrl = profile.profile_photo_url;

      profileCache.set(photoUrl || null, displayName || userName);

      // Update state with fresh data
      if (photoUrl) setCachedProfilePhoto(photoUrl);
      if (displayName) setCachedDisplayName(displayName);
    }
  }, [profileData, userName]);

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

  // Get real mock exams count from analytics
  const mockExamsCount = mockExamAnalytics?.total_exams || 0;

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
        // Use real study time data, fall back to mock for other stats
        const mockStats: StudyStats = {
          totalStudyTime: studyTimeData?.total_minutes || 0,
          sessionsCompleted: studyTimeData?.sessions_count || 0,
          currentStreak: 7,
          longestStreak: 12,
          averageScore: 78,
          improvementRate: 12,
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
      }
    };

    loadStudyStats();
  }, [studyTimeData]);

  // Use cached data immediately, fall back to fresh data or defaults
  const displayPhoto = cachedProfilePhoto || profileData?.profile?.profile_photo_url || "/profile.png";
  const displayName = cachedDisplayName || getDisplayName() || userName;

  // Only show profile if we have cache OR profile data is loaded
  const hasProfileData = cachedProfilePhoto || cachedDisplayName || !isLoadingProfile;

  return (
    <div className="w-full max-w-full p-4 md:p-5 bg-card rounded-3xl shadow-sm border border-border">
      <h2 className="text-3xl font-bold mb-8 text-card-foreground">
        Study Statistics
      </h2>

      {/* Profile - only render when we have data to show */}
      {hasProfileData && (
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="w-36 h-36 rounded-full bg-primary/5 flex items-center justify-center relative shadow-sm border border-border">
              <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center">
                <div className="w-28 h-28 rounded-full overflow-hidden">
                  <Image
                    src={displayPhoto}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center mb-2 text-foreground">
            {displayName}
          </h3>
        </div>
      )}

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
    </div>
  );
}
