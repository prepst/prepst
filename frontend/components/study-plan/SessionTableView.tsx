"use client";

import { TodoSession } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Circle,
} from "lucide-react";
import {
  generateSessionName,
  estimateSessionTime,
  formatTimeEstimate,
  getSessionStatus,
  sortSessionsByPriority,
} from "@/lib/utils/session-utils";
import { usePathname, useRouter } from "next/navigation";
import { buildPracticeSessionPath } from "@/lib/practice-navigation";

interface SessionTableViewProps {
  sessions: TodoSession[];
  mockExams?: TodoSession[];
}

export function SessionTableView({ sessions, mockExams = [] }: SessionTableViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Combine and sort all sessions by priority
  const allSessions = [...sessions, ...mockExams];
  const sortedSessions = sortSessionsByPriority(allSessions) as TodoSession[];

  const handleSessionClick = (session: TodoSession) => {
    const status = getSessionStatus(session);
    if (status === "completed" && !session.examType) return;

    if (session.examType === "mock-exam") {
      if (session.id !== "mock-test" && session.id !== "mock-test-2") {
        if (status === "completed") {
          router.push(`/mock-exam/${session.id}/results`);
        } else {
          router.push(`/mock-exam/${session.id}`);
        }
        return;
      }
      router.push("/mock-exam");
    } else {
      router.push(buildPracticeSessionPath(session.id, pathname));
    }
  };

  const getStatusConfig = (session: TodoSession) => {
    const status = getSessionStatus(session);
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed",
          className: "bg-progress-soft text-progress border-progress/25 dark:bg-progress/20 dark:text-progress dark:border-progress",
        };
      case "in-progress":
        return {
          icon: <PlayCircle className="w-4 h-4" />,
          label: "In Progress",
          className: "bg-study-soft text-study border-study/25 dark:bg-study/20 dark:text-study dark:border-study",
        };
      case "overdue":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: "Overdue",
          className: "bg-destructive-soft text-destructive border-destructive/25 dark:bg-destructive/20 dark:text-destructive dark:border-destructive",
        };
      default:
        return {
          icon: <Circle className="w-4 h-4" />,
          label: "Upcoming",
          className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        };
    }
  };

  const getTopicPreview = (session: TodoSession) => {
    if (!session.topics || session.topics.length === 0) {
      return session.examType === "mock-exam" ? "Full SAT Practice Test" : "Practice session";
    }
    const topTopics = session.topics
      .slice(0, 2)
      .map((t) => t.topic_name.split(":").pop()?.trim() || t.topic_name);
    const moreCount = session.topics.length - 2;
    return (
      <>
        {topTopics.join(", ")}
        {moreCount > 0 && (
          <span className="text-muted-foreground"> +{moreCount} more</span>
        )}
      </>
    );
  };

  const getProgress = (session: TodoSession) => {
    if (session.total_questions && session.total_questions > 0) {
      return Math.round(
        ((session.completed_questions || 0) / session.total_questions) * 100
      );
    }
    return 0;
  };

  if (sortedSessions.length === 0) {
    return (
      <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Sessions Available
        </h3>
        <p className="text-muted-foreground text-sm">
          Create a study plan to start practicing
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Desktop Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-2">Status</div>
        <div className="col-span-4">Session</div>
        <div className="col-span-2">Duration</div>
        <div className="col-span-2">Progress</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {sortedSessions.map((session) => {
          const status = getSessionStatus(session);
          const statusConfig = getStatusConfig(session);
          const progress = getProgress(session);
          const isCompleted = status === "completed";
          const isMockTest = session.examType === "mock-exam";
          const sessionName = isMockTest
            ? "Full-Length Mock Test"
            : generateSessionName(session) || `Session ${session.session_number || 1}`;
          const timeEstimate = isMockTest
            ? "~2 hr 14 min"
            : formatTimeEstimate(estimateSessionTime(session));

          return (
            <div
              key={session.id}
              className={`group transition-colors hover:bg-muted/30 ${
                isCompleted && !isMockTest ? "opacity-75" : "cursor-pointer"
              }`}
              onClick={() => handleSessionClick(session)}
            >
              {/* Desktop View */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                {/* Status */}
                <div className="col-span-2">
                  <Badge
                    variant="outline"
                    className={`font-medium gap-1.5 px-2.5 py-1 ${statusConfig.className}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Session */}
                <div className="col-span-4 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {sessionName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {getTopicPreview(session)}
                  </p>
                </div>

                {/* Duration */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {timeEstimate}
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-2">
                  {progress > 0 || status === "in-progress" ? (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-1.5 bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        {progress}%
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {isCompleted ? "100%" : "Not started"}
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-2 text-right">
                  {isCompleted && !isMockTest ? (
                    <span className="text-sm font-medium text-progress">
                      Completed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={status === "overdue" ? "destructive" : "default"}
                      className={`gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        status === "overdue"
                          ? ""
                          : "border-transparent bg-primary text-white hover:bg-[#1a8cd8] !text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session);
                      }}
                    >
                      {status === "in-progress" ? "Resume" : "Start"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden px-4 py-4 space-y-3">
                {/* Mobile Header Row */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`font-medium gap-1.5 px-2 py-0.5 text-xs ${statusConfig.className}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                  {isCompleted && !isMockTest ? (
                    <span className="text-sm font-medium text-progress">
                      Done
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={status === "overdue" ? "destructive" : "default"}
                      className={`h-8 text-xs gap-1 ${
                        status === "overdue"
                          ? ""
                          : "border-transparent bg-primary text-white hover:bg-[#1a8cd8] !text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session);
                      }}
                    >
                      {status === "in-progress" ? "Resume" : "Start"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                {/* Mobile Content */}
                <div>
                  <p className="font-semibold text-foreground">{sessionName}</p>
                  <p className="text-sm text-muted-foreground">
                    {getTopicPreview(session)}
                  </p>
                </div>

                {/* Mobile Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeEstimate}
                  </div>
                  {progress > 0 && (
                    <div className="flex items-center gap-2 flex-1">
                      <Progress value={progress} className="h-1.5 flex-1 bg-muted" />
                      <span>{progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
