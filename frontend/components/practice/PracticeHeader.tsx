import {
  Clock,
  List,
  X,
  Pause,
  Play,
  RotateCcw,
  Flame,
  Trophy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimerConfig } from "./TimerModal";
import type { TimerMode } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";

interface PracticeHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timerMode: TimerMode;
  time: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleQuestionList: () => void;
  // Gamification Props
  streak?: number;
  score?: number;
  // Timer State Props
  showTimerModal?: boolean; // Optional now if we use internal state, but better controlled
  onToggleTimerModal: (open: boolean) => void; // Changed signature to match onOpenChange

  // Timer Config Props
  showTimerSetup?: boolean;
  setShowTimerSetup?: (show: boolean) => void;
  customHours?: number;
  setCustomHours?: (hours: number) => void;
  customMinutes?: number;
  setCustomMinutes?: (minutes: number) => void;

  // Timer Actions
  onPauseResume: () => void;
  onReset: () => void;
  onCloseTimer: () => void;
  onStartStopwatch?: () => void;
  onStartTimer?: () => void;

  onExit: () => void;
}

export function PracticeHeader({
  currentIndex,
  totalQuestions,
  timerMode,
  time,
  isRunning,
  formatTime,
  onToggleQuestionList,
  streak = 0,
  score = 0,

  // Timer props
  showTimerModal,
  onToggleTimerModal,
  showTimerSetup = false,
  setShowTimerSetup = () => {},
  customHours = 0,
  setCustomHours = () => {},
  customMinutes = 0,
  setCustomMinutes = () => {},
  onStartStopwatch = () => {},
  onStartTimer = () => {},

  onPauseResume,
  onReset,
  onCloseTimer,
  onExit,
}: PracticeHeaderProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left: Branding & Session Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none">
                Practice Session
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">
                SAT Prep
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-border/60 hidden sm:block" />

          <div className="flex items-center gap-2 hidden sm:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleQuestionList}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Question List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Badge
              variant="secondary"
              className="font-mono font-medium bg-secondary/50 hover:bg-secondary/50"
            >
              <span className="text-foreground">{currentIndex + 1}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-muted-foreground">{totalQuestions}</span>
            </Badge>
          </div>
        </div>

        {/* Center: Timer (Absolute Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {!timerMode ? (
            <Popover open={showTimerModal} onOpenChange={onToggleTimerModal}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-border/60 bg-background/50 hover:bg-accent gap-2 px-4 shadow-sm"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Timer
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-2 bg-popover border-border shadow-xl"
                align="center"
                sideOffset={8}
              >
                <TimerConfig
                  showTimerSetup={showTimerSetup}
                  setShowTimerSetup={setShowTimerSetup}
                  customHours={customHours}
                  setCustomHours={setCustomHours}
                  customMinutes={customMinutes}
                  setCustomMinutes={setCustomMinutes}
                  onStartStopwatch={onStartStopwatch}
                  onStartTimer={onStartTimer}
                  onClose={() => onToggleTimerModal(false)}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div
              className={`
              flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300
              ${
                timerMode === "timer"
                  ? "bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10"
                  : "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10"
              }
            `}
            >
              <div className="px-2 min-w-[60px] text-center">
                <span
                  className={`text-sm font-mono font-bold tabular-nums tracking-tight ${
                    timerMode === "timer"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {formatTime(time)}
                </span>
              </div>

              <div className="h-4 w-px bg-border/50" />

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPauseResume}
                  className="h-6 w-6 rounded-full hover:bg-background/80"
                >
                  {isRunning ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-6 w-6 rounded-full hover:bg-background/80"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCloseTimer}
                  className="h-6 w-6 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Gamification Stats */}
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame
                className={cn(
                  "w-4 h-4 text-orange-500",
                  streak > 0 && "fill-orange-500 animate-pulse"
                )}
              />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {streak}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400 tabular-nums">
                {score}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-border/60 hidden md:block" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Exit Session"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar - Premium Design */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-muted/20 overflow-hidden">
        {/* Animated gradient progress bar */}
        <div
          className="relative h-full transition-all duration-700 ease-out overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Main gradient fill with vibrant colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />

          {/* Secondary gradient layer for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-60" />

          {/* Animated shine/shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />

          {/* Glow effect at the leading edge */}
          <div
            className="absolute top-0 right-0 w-8 h-full bg-primary/60 blur-md transition-all duration-700"
            style={{
              boxShadow: "0 0 20px rgba(var(--primary), 0.6)",
            }}
          />

          {/* Animated particles/glow dots at the leading edge */}
          <div className="absolute top-0 right-0 w-12 h-full overflow-hidden">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/70 blur-[3px] animate-pulse"
              style={{
                right: "4px",
                animationDelay: "0s",
                animationDuration: "1.5s",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/90 blur-[1px] animate-pulse"
              style={{
                right: "8px",
                animationDelay: "0.3s",
                animationDuration: "1.2s",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white blur-[0.5px] animate-pulse"
              style={{
                right: "12px",
                animationDelay: "0.6s",
                animationDuration: "1s",
              }}
            />
          </div>
        </div>

        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Bottom shadow for depth */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-black/5 dark:bg-white/5" />
      </div>
    </div>
  );
}
