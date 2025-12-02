import { Clock, Timer, ChevronLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimerConfigProps {
  showTimerSetup: boolean;
  customHours: number;
  customMinutes: number;
  setCustomHours: (hours: number) => void;
  setCustomMinutes: (minutes: number) => void;
  setShowTimerSetup: (show: boolean) => void;
  onStartStopwatch: () => void;
  onStartTimer: () => void;
  onClose: () => void;
}

export function TimerConfig({
  showTimerSetup,
  customHours,
  customMinutes,
  setCustomHours,
  setCustomMinutes,
  setShowTimerSetup,
  onStartStopwatch,
  onStartTimer,
  onClose,
}: TimerConfigProps) {
  if (showTimerSetup) {
    return (
      <div className="w-64">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTimerSetup(false)}
            className="h-6 w-6"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold text-foreground">Set Timer</h3>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            {/* Hours Input */}
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-lg p-2 mb-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCustomHours(Math.max(0, Math.min(23, val)));
                  }}
                  className="w-12 text-2xl font-bold text-center bg-transparent text-foreground outline-none p-0 border-none focus:ring-0"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">hr</span>
            </div>

            <span className="text-2xl font-bold text-muted-foreground mb-5">:</span>

            {/* Minutes Input */}
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-lg p-2 mb-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCustomMinutes(Math.max(0, Math.min(59, val)));
                  }}
                  className="w-12 text-2xl font-bold text-center bg-transparent text-foreground outline-none p-0 border-none focus:ring-0"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">min</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            onStartTimer();
            onClose();
          }}
          disabled={customHours === 0 && customMinutes === 0}
          className="w-full"
        >
          <Play className="w-3.5 h-3.5 mr-2" />
          Start Timer
        </Button>
      </div>
    );
  }

  return (
    <div className="w-56 grid grid-cols-1 gap-2">
      {/* Stopwatch Option */}
      <Button
        variant="outline"
        onClick={() => {
          onStartStopwatch();
          onClose();
        }}
        className="h-auto py-4 justify-start px-4 border-border hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm text-foreground">Stopwatch</span>
            <span className="text-xs text-muted-foreground font-normal">Count up</span>
          </div>
        </div>
      </Button>

      {/* Timer Option */}
      <Button
        variant="outline"
        onClick={() => setShowTimerSetup(true)}
        className="h-auto py-4 justify-start px-4 border-border hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Timer className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm text-foreground">Timer</span>
            <span className="text-xs text-muted-foreground font-normal">Count down</span>
          </div>
        </div>
      </Button>
    </div>
  );
}
