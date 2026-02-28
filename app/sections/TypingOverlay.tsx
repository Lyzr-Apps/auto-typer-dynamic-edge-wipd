'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Pause, Play, Square, Monitor, MousePointer } from 'lucide-react'

interface TypingOverlayProps {
  isVisible: boolean
  progress: number
  currentWpm: number
  elapsedTime: number
  isPaused: boolean
  countdown: number | null
  onPauseResume: () => void
  onStop: () => void
}

export default function TypingOverlay({
  isVisible,
  progress,
  currentWpm,
  elapsedTime,
  isPaused,
  countdown,
  onPauseResume,
  onStop,
}: TypingOverlayProps) {
  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
      <div className="bg-card border-2 border-primary shadow-lg shadow-primary/10 p-5 w-[520px] max-w-[95vw] pointer-events-auto">
        {countdown !== null ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-accent">
              <MousePointer className="h-5 w-5" />
              <p className="text-sm font-mono font-semibold uppercase tracking-wider">
                Switch to Notepad++ Now
              </p>
            </div>
            <p className="text-5xl font-mono font-bold text-primary tabular-nums">
              {countdown}
            </p>
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground">
                Click inside Notepad++ where you want typing to begin
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Typing starts automatically when countdown reaches 0
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
                <Monitor className="h-3.5 w-3.5" />
                <span>Target: Active Window</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="font-mono text-xs uppercase border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Square className="mr-2 h-3 w-3" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${isPaused ? 'bg-primary' : 'bg-accent animate-pulse'}`} />
                <span className="text-xs font-mono uppercase tracking-wider text-foreground">
                  {isPaused ? 'Paused' : 'Typing into active window...'}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {formatTime(elapsedTime)}
              </span>
            </div>

            {isPaused && (
              <div className="px-3 py-2 border border-primary/30 bg-primary/5">
                <p className="text-xs font-mono text-primary">
                  Typing paused. Click Resume when your cursor is in the target window.
                </p>
              </div>
            )}

            <Progress value={progress} className="h-2 bg-secondary" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Progress</p>
                  <p className="text-sm font-mono text-foreground tabular-nums">{Math.round(progress)}%</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">WPM</p>
                  <p className="text-sm font-mono text-primary tabular-nums">{currentWpm}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPauseResume}
                  className="font-mono text-xs uppercase border-border hover:bg-secondary"
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-1.5 h-3 w-3" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-1.5 h-3 w-3" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStop}
                  className="font-mono text-xs uppercase border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Square className="mr-1.5 h-3 w-3" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
