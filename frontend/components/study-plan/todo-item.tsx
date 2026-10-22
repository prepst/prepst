"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronRight } from "lucide-react";
import { TodoSession } from "./types";
import {
  generateSessionName,
  estimateSessionTime,
  formatTimeEstimate,
  getSessionStatus,
} from "@/lib/utils/session-utils";
import { usePathname, useRouter } from "next/navigation";
import { buildPracticeSessionPath } from "@/lib/practice-navigation";

interface TodoItemProps {
  todo: TodoSession;
  onToggle: () => void;
}

// Helper function to get session emoji and color styles
function getSessionStyle(session: TodoSession) {
  if (!session) {
    return {
      emoji: "📚",
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    };
  }

  const sessionName = generateSessionName(session) || "Session";
  const sessionNumber = session.session_number || 1;

  const styles = [
    { emoji: "📊", className: "bg-study-soft text-study" },
    { emoji: "📚", className: "bg-progress-soft text-progress" },
    { emoji: "🎯", className: "bg-study-soft text-study" },
    { emoji: "📝", className: "bg-schedule-soft text-schedule" },
    { emoji: "🧮", className: "bg-destructive/10 text-destructive dark:text-destructive" },
    { emoji: "🔬", className: "bg-study/10 text-study dark:text-study" },
    { emoji: "🌍", className: "bg-study/10 text-study dark:text-study" },
    { emoji: "⚡", className: "bg-schedule/10 text-schedule dark:text-schedule" },
  ];

  const colorIndex = (sessionNumber - 1) % styles.length;

  if (
    sessionName.includes("Math") ||
    sessionName.includes("Algebra") ||
    sessionName.includes("Geometry")
  ) {
    return styles[0];
  } else if (
    sessionName.includes("Reading") ||
    sessionName.includes("Writing") ||
    sessionName.includes("Literature")
  ) {
    return styles[1];
  } else if (
    sessionName.includes("Science") ||
    sessionName.includes("Physics") ||
    sessionName.includes("Chemistry")
  ) {
    return styles[5];
  } else if (
    sessionName.includes("History") ||
    sessionName.includes("Social")
  ) {
    return styles[6];
  } else if (sessionName.includes("Mixed") || sessionName.includes("Review")) {
    return styles[2];
  }
  
  // Default fallback
  return styles[colorIndex];
}

// Helper function to get session progress
function getSessionProgress(session: TodoSession) {
  if (!session) return 0;
  const totalQuestions = session.total_questions || 0;
  const completedQuestions = session.completed_questions || 0;
  if (totalQuestions === 0) return 0;
  return Math.round((completedQuestions / totalQuestions) * 100);
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const router = useRouter();
  const pathname = usePathname();

  const status = getSessionStatus(todo);
  const progress = getSessionProgress(todo);
  const { emoji, className } = getSessionStyle(todo);
  const isMockTest = todo.examType === "mock-exam" || todo.id === "mock-test" || todo.id === "mock-test-2";
  const sessionName = isMockTest ? "Full-Length Mock Test" : (generateSessionName(todo) || `Session ${todo.session_number || 1}`);
  const timeEstimate = isMockTest ? "~2 hr 14 min" : formatTimeEstimate(estimateSessionTime(todo) || 30);

  const completed = status === "completed";

  const handleClick = () => {
    if (status !== "completed") {
      // Check if this is a mock test session
      if (isMockTest) {
        // If it has a specific UUID (real mock exam), go to that, otherwise go to landing
        if (todo.id !== "mock-test" && todo.id !== "mock-test-2") {
           // Navigate to the mock exam page
           router.push(`/mock-exam/${todo.id}`);
           return;
        }
        router.push("/mock-exam");
      } else {
        router.push(buildPracticeSessionPath(todo.id, pathname));
      }
    } else if (isMockTest && todo.score !== undefined) {
        // Allow clicking completed mock exams to view results
        router.push(`/mock-exam/${todo.id}/results`);
    }
  };

  const getPriorityBadge = () => {
    if (!todo.priority) return null;
    
    const priorityConfig = {
      important: { label: "Important", className: "border-destructive/25 bg-destructive-soft text-destructive dark:bg-destructive/20 dark:text-destructive dark:border-destructive" },
      "new-product": { label: "New", className: "border-study/25 bg-study-soft text-study dark:bg-study/20 dark:text-study dark:border-study" },
      delayed: { label: "Delayed", className: "border-schedule/25 bg-schedule-soft text-schedule dark:bg-schedule/20 dark:text-schedule dark:border-schedule" },
    };

    const config = priorityConfig[todo.priority];
    return (
      <Badge variant="outline" className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div
      className={`group relative mb-3 rounded-2xl border border-border bg-card p-5 transition-all duration-300 
        ${isMockTest ? "bg-study-soft/50 dark:bg-study/20 border-study/25 dark:border-study/30" : "hover:shadow-md hover:scale-[1.01] hover:border-primary/20"}
        ${completed && !isMockTest ? "opacity-60 grayscale-[0.5]" : "cursor-pointer"}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${className}`}>
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
             <div className="flex flex-col">
                <h3 className={`text-base font-bold text-foreground truncate pr-2 ${completed && !isMockTest ? "line-through decoration-2 decoration-muted-foreground/50" : ""}`}>
                    {sessionName}
                </h3>
                {todo.score !== undefined && (
                   <div className="mt-1">
                     <Badge variant="secondary" className="bg-progress-soft text-progress dark:bg-progress/30 dark:text-progress hover:bg-progress-soft border-0">
                        Score: {todo.score}
                     </Badge>
                   </div>
                )}
             </div>
             {getPriorityBadge()}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-3">
             <div className="flex items-center gap-1.5">
               <Clock className="w-3.5 h-3.5" />
               {timeEstimate}
             </div>
             {todo.total_questions && (
               <div className="flex items-center gap-1.5">
                 <span>•</span>
                 <span>{todo.total_questions} questions</span>
               </div>
             )}
          </div>

          {/* Progress & Status */}
          <div className="space-y-2">
            {progress > 0 && (
              <div className="flex items-center gap-3">
                 <Progress value={progress} className="h-1.5 flex-1 bg-muted" />
                 <span className="text-xs font-bold text-muted-foreground tabular-nums">{progress}%</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'completed' ? 'bg-progress shadow-[0_0_8px_rgba(0, 186, 124,0.4)]' :
                    status === 'in-progress' ? 'bg-study shadow-[0_0_8px_rgba(29, 155, 240,0.4)]' :
                    status === 'overdue' ? 'bg-destructive shadow-[0_0_8px_rgba(244, 33, 46,0.4)]' :
                    'bg-muted-foreground/30'
                  }`} />
                  <span className="text-xs font-semibold text-muted-foreground capitalize tracking-wide">
                    {status.replace("-", " ")}
                  </span>
               </div>
               
               {(!completed || isMockTest) && (
                 <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
