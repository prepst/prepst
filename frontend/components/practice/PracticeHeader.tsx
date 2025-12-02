import { Clock, List, X, Pause, Play, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { TimerMode } from '@/hooks/useTimer';

interface PracticeHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timerMode: TimerMode;
  time: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleQuestionList: () => void;
  onToggleTimerModal: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onCloseTimer: () => void;
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
  onToggleTimerModal,
  onPauseResume,
  onReset,
  onCloseTimer,
  onExit,
}: PracticeHeaderProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="bg-background/90 backdrop-blur-sm border-b border-border px-8 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Question List Button */}
          <button
            onClick={onToggleQuestionList}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors border border-border"
            title="View all questions"
          >
            <List className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Practice Session</h1>
          <span className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1} / {totalQuestions}
          </span>

          {/* Timer/Stopwatch */}
          {!timerMode ? (
            <div className="relative">
              <button
                onClick={onToggleTimerModal}
                className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors border border-border"
              >
                <Clock className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                timerMode === 'timer'
                  ? 'bg-orange-500/10 border-orange-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatTime(time)}
              </span>
              <button
                onClick={onPauseResume}
                className="p-1 hover:bg-background/50 rounded-full transition-colors"
              >
                {isRunning ? (
                  <Pause
                    className={`w-3.5 h-3.5 ${
                      timerMode === 'timer' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                ) : (
                  <Play
                    className={`w-3.5 h-3.5 ${
                      timerMode === 'timer' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                )}
              </button>
              <button
                onClick={onReset}
                className="p-1 hover:bg-background/50 rounded-full transition-colors"
              >
                <RotateCcw
                  className={`w-3.5 h-3.5 ${
                    timerMode === 'timer' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
              </button>
              <button
                onClick={onCloseTimer}
                className="p-1 hover:bg-background/50 rounded-full transition-colors"
              >
                <X
                  className={`w-3.5 h-3.5 ${
                    timerMode === 'timer' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onExit}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <Progress value={progress} className="h-2 bg-muted" />
    </div>
  );
}
