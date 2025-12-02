import { Clock, List, X, Pause, Play, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimerConfig } from './TimerModal';
import type { TimerMode } from '@/hooks/useTimer';

interface PracticeHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timerMode: TimerMode;
  time: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleQuestionList: () => void;
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
              <span className="text-sm font-semibold text-foreground leading-none">Practice Session</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">SAT Prep</span>
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
            <Badge variant="secondary" className="font-mono font-medium bg-secondary/50 hover:bg-secondary/50">
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
                  <span className="text-xs font-medium text-muted-foreground">Timer</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-popover border-border shadow-xl" align="center" sideOffset={8}>
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
            <div className={`
              flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300
              ${timerMode === 'timer' 
                ? 'bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10' 
                : 'bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10'}
            `}>
              <div className="px-2 min-w-[60px] text-center">
                <span className={`text-sm font-mono font-bold tabular-nums tracking-tight ${
                  timerMode === 'timer' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                }`}>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <span className="hidden sm:inline text-xs font-medium">Exit Session</span>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-muted overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
