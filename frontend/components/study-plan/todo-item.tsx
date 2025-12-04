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
import { useRouter } from "next/navigation";

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
    { emoji: "📊", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { emoji: "📚", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { emoji: "🎯", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { emoji: "📝", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { emoji: "🧮", className: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    { emoji: "🔬", className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    { emoji: "🌍", className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { emoji: "⚡", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
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
        router.push(`/practice/${todo.id}`);
      }
    } else if (isMockTest && todo.score !== undefined) {
        // Allow clicking completed mock exams to view results
        router.push(`/mock-exam/${todo.id}/results`);
    }
  };

  const getPriorityBadge = () => {
    if (!todo.priority) return null;
    
    const priorityConfig = {
      important: { label: "Important", className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
      "new-product": { label: "New", className: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
      delayed: { label: "Delayed", className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
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
        ${isMockTest ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-800/30" : "hover:shadow-md hover:scale-[1.01] hover:border-primary/20"}
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
                     <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-0">
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
                    status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                    status === 'in-progress' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' :
                    status === 'overdue' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
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
