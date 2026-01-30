"use client";

import { TodoSession } from "./types";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Flame, Target, TrendingUp, Clock } from "lucide-react";
import { getSessionStatus } from "@/lib/utils/session-utils";

interface StudyPlanStatsProps {
  sessions: TodoSession[];
}

export function StudyPlanStats({ sessions }: StudyPlanStatsProps) {
  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => getSessionStatus(s) === "completed"
  ).length;
  const inProgressSessions = sessions.filter(
    (s) => getSessionStatus(s) === "in-progress"
  ).length;
  const overdueSessions = sessions.filter(
    (s) => getSessionStatus(s) === "overdue"
  ).length;

  const progressPercentage = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  // Calculate streak (mock - would come from backend in real implementation)
  const streak = 3; // Placeholder

  // Target sessions (mock calculation)
  const targetSessions = Math.max(5, Math.ceil(totalSessions * 0.2)); // 20% per week or minimum 5

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      {/* Main Progress */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-lg font-bold text-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5 bg-muted" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {completedSessions} of {totalSessions} sessions completed
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Streak */}
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3 border border-orange-100 dark:border-orange-800/20">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-xl font-bold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>

        {/* Done */}
        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Done</span>
          </div>
          <p className="text-xl font-bold text-foreground">{completedSessions}</p>
          <p className="text-[10px] text-muted-foreground">sessions</p>
        </div>

        {/* Target */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Target</span>
          </div>
          <p className="text-xl font-bold text-foreground">{targetSessions}</p>
          <p className="text-[10px] text-muted-foreground">this week</p>
        </div>

        {/* In Progress / Overdue indicator */}
        <div className={`rounded-xl p-3 border ${
          overdueSessions > 0 
            ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/20" 
            : "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/20"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${overdueSessions > 0 ? "text-red-500" : "text-purple-500"}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {overdueSessions > 0 ? "Overdue" : "Active"}
            </span>
          </div>
          <p className={`text-xl font-bold ${overdueSessions > 0 ? "text-red-600" : "text-foreground"}`}>
            {overdueSessions > 0 ? overdueSessions : inProgressSessions}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {overdueSessions > 0 ? "urgent" : "in progress"}
          </p>
        </div>
      </div>
    </div>
  );
}
