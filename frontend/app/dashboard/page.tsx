"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyPlan, useMockExamAnalytics } from "@/hooks/queries";
import { useAuth } from "@/contexts/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Play, Target, Sparkles, ArrowRight } from "lucide-react";
import DashboardStatsBento from "@/components/dashboard/DashboardStatsBento";
import MissionCard from "@/components/dashboard/MissionCard";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import { TimeSelectionModal } from "@/components/dashboard/TimeSelectionModal";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardPage() {
  const router = useRouter();
  const { data: studyPlan, isLoading } = useStudyPlan();
  const { user } = useAuth();
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const { isDarkMode } = useTheme();

  const getDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  // Fetch mock exam performance data using TanStack Query
  const mockExamQuery = useMockExamAnalytics();
  const mockExamData = mockExamQuery.data || null;
  const mockExamPerformance = mockExamData?.recent_exams || [];

  const handleStartPractice = async (minutes: number) => {
    if (!user) return;

    try {
      // Calculate number of questions based on time
      // Assuming average 1.5-2 minutes per question
      const questionsPerMinute = 1.5;
      const numQuestions = Math.floor(minutes * questionsPerMinute);

      // Get random questions from the database
      const { data: questions, error } = await supabase
        .from("questions")
        .select(
          "id, stem, question_type, answer_options, correct_answer, difficulty, topics(name)"
        )
        .limit(numQuestions * 2); // Get more than needed for variety

      if (error) throw error;

      if (!questions || questions.length === 0) {
        alert("No questions available. Please try again later.");
        return;
      }

      // Randomly select questions and shuffle them
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, numQuestions);

      // Create a simple practice session in localStorage for now
      const sessionId = `quick-practice-${Date.now()}`;
      const practiceSession = {
        id: sessionId,
        questions: selectedQuestions,
        currentIndex: 0,
        timeLimit: minutes * 60, // Convert to seconds
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem(
        `practice-session-${sessionId}`,
        JSON.stringify(practiceSession)
      );

      // Navigate to a simple practice page
      router.push(`/practice/quick/${sessionId}`);
    } catch (error) {
      console.error("Error creating practice session:", error);
      alert("Failed to create practice session. Please try again.");
    }
  };

  // Get next session and transform it to match MissionCard's expected type
  const nextSessionRaw = studyPlan?.study_plan?.sessions
    ?.filter((s: any) => s.status !== "completed")
    .sort(
      (a: any, b: any) =>
        new Date(a.scheduled_date).getTime() -
        new Date(b.scheduled_date).getTime()
    )[0];

  // Transform PracticeSession to MissionCard's Session type
  type SessionForMissionCard = {
    id: string;
    topic_name: string;
    description?: string;
    scheduled_date: string;
    duration_minutes: number;
    status: string;
    num_questions: number;
  };

  const nextSession: SessionForMissionCard | undefined = nextSessionRaw
    ? ({
        id: nextSessionRaw.id,
        topic_name:
          nextSessionRaw.session_name ||
          `Session ${nextSessionRaw.session_number}`,
        scheduled_date: nextSessionRaw.scheduled_date,
        duration_minutes: nextSessionRaw.total_questions
          ? Math.round(nextSessionRaw.total_questions * 2)
          : 30, // Estimate 2 min per question
        status: nextSessionRaw.status,
        num_questions: nextSessionRaw.total_questions || 0,
      } as SessionForMissionCard)
    : undefined;

  // Mock stats (replace with real data calculations if available)
  const streak = 3; // TODO: Fetch real streak
  const studyTime = "4h 15m"; // TODO: Fetch real study time
  const questionsDone = 42; // TODO: Fetch real questions done
  const mockExamsCount = mockExamPerformance.length;

  const heroBgClass = isDarkMode
    ? "bg-[#0F172A]"
    : "bg-gradient-to-br from-cyan-50 to-purple-50";
  const heroTextColorClass = isDarkMode ? "text-white" : "text-foreground";
  const heroBlursPrimary = isDarkMode ? "bg-purple-600/30" : "bg-purple-200/50";
  const heroBlursSecondary = isDarkMode ? "bg-blue-600/30" : "bg-cyan-200/50";

  return (
    <div className="min-h-screen bg-background/50">
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-4 py-8 space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-[2.5rem] ${heroBgClass} ${heroTextColorClass} shadow-2xl`}
          >
            {/* Abstract Background */}
            <div className="absolute inset-0">
              <div
                className={`absolute top-0 right-0 w-[600px] h-[600px] ${heroBlursPrimary} rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3`}
              ></div>
              <div
                className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${heroBlursSecondary} rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4`}
              ></div>
            </div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/10 dark:border-black/10">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">
                    AI-Powered Learning
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Hello, <span>{getDisplayName().split(" ")[0]}</span>
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg">
                    Ready to crush your SAT goals? Let's get started! Your
                    personalized study plan is optimized for maximum score
                    improvement.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    onClick={() => setShowTimeSelection(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Quick Start
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/mock-exam")}
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent rounded-full px-8 py-6 text-lg font-medium backdrop-blur-sm"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Mock Exam
                  </Button>
                </div>
              </div>

              {/* Hero Illustration / Stats or 3D Element placeholder */}
              <div className="hidden lg:block relative w-80 h-80">
                {/* Circle Progress Concept */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-300 dark:border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                </div>
                <div className="absolute inset-8 rounded-full border-4 border-blue-300 dark:border-white/10 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-bold">1450</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                    Target Score
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Bento Grid */}
          <DashboardStatsBento
            streak={streak}
            studyTime={studyTime}
            questionsDone={questionsDone}
            mockExams={mockExamsCount}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mission Card (Next Session) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Current Objective
                </h3>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => router.push("/dashboard/study-plan")}
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
                  <MissionCard
                    session={nextSession}
                    isLoading={isLoading}
                    onStart={() => router.push("/dashboard/study-plan")}
                  />
                </div>
                <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
                  <RecommendationCard
                    onStart={() => router.push("/dashboard/drill")}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">
                Quick Actions
              </h3>
              <QuickActionsGrid />
            </div>
          </div>

          {/* Analytics Section */}
          <div className="pt-8">
            <ProgressOverview
              studyPlan={studyPlan}
              mockExamPerformance={mockExamPerformance}
              mockExamData={mockExamData}
            />
          </div>

          {/* Detailed Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceChart />
            {/* Can add another chart here or keep it empty/full width */}
          </div>

          <TimeSelectionModal
            isOpen={showTimeSelection}
            onClose={() => setShowTimeSelection(false)}
            onStartPractice={handleStartPractice}
          />
        </div>
      </div>
    </div>
  );
}
