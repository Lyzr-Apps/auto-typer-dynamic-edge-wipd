'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Copy, Check, Pause, Play, Square, X } from 'lucide-react'

interface TypingEditorProps {
  typedText: string
  isTyping: boolean
  isPaused: boolean
  progress: number
  currentWpm: number
  elapsedTime: number
  countdown: number | null
  isVisible: boolean
  onPauseResume: () => void
  onStop: () => void
}

export default function TypingEditor({
  typedText,
  isTyping,
  isPaused,
  progress,
  currentWpm,
  elapsedTime,
  countdown,
  isVisible,
  onPauseResume,
  onStop,
}: TypingEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Auto-scroll to bottom as text is typed
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.scrollTop = editorRef.current.scrollHeight
    }
  }, [typedText])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(typedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = typedText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Split typed text into lines for line numbering
  const lines = typedText ? typedText.split('\n') : ['']

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Notepad++ style title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-destructive" />
            <div className="w-3 h-3 bg-primary" />
            <div className="w-3 h-3 bg-accent" />
          </div>
          <span className="font-mono text-sm text-foreground">
            AutoTyper Pro - Typing Output
          </span>
          {isTyping && (
            <Badge className="font-mono text-xs bg-accent text-accent-foreground border-0 animate-pulse">
              TYPING
            </Badge>
          )}
          {isPaused && (
            <Badge className="font-mono text-xs bg-primary text-primary-foreground border-0">
              PAUSED
            </Badge>
          )}
          {!isTyping && !isPaused && countdown === null && typedText.length > 0 && (
            <Badge className="font-mono text-xs bg-accent text-accent-foreground border-0">
              DONE
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {typedText.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 font-mono text-xs border-border hover:bg-secondary gap-1.5"
            >
              {copied ? (
                <><Check className="h-3 w-3 text-accent" /> Copied</>
              ) : (
                <><Copy className="h-3 w-3" /> Copy Output</>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="h-7 font-mono text-xs border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center space-y-6">
            <p className="text-sm font-mono uppercase tracking-widest text-accent font-semibold">
              Typing begins in
            </p>
            <p className="text-8xl font-mono font-bold text-primary tabular-nums">
              {countdown}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-mono text-muted-foreground">
                Text will appear here character by character
              </p>
              <p className="text-xs font-mono text-muted-foreground/60">
                with human-like speed, pauses, and typo corrections
              </p>
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
        </div>
      )}

      {/* Editor area - visible when typing or done */}
      {countdown === null && (
        <>
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers gutter */}
            <div className="w-14 bg-card border-r border-border overflow-hidden flex-shrink-0">
              <div className="py-3 px-2">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs text-muted-foreground text-right pr-2 leading-6 select-none"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Text content area */}
            <div
              ref={editorRef}
              className="flex-1 overflow-y-auto py-3 px-4 bg-background"
            >
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words leading-6 min-h-full">
                {typedText}
                {(isTyping || isPaused) && (
                  <span
                    className="inline-block w-[2px] h-[16px] bg-primary ml-[1px] align-text-bottom"
                    style={{
                      animation: isPaused ? 'none' : 'blink 1s step-end infinite',
                    }}
                  />
                )}
              </pre>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border">
            <div className="flex items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${isTyping && !isPaused ? 'bg-accent animate-pulse' : isPaused ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <span className="text-xs font-mono text-muted-foreground">
                  {isTyping && !isPaused ? 'Typing...' : isPaused ? 'Paused' : 'Complete'}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round(progress)}%
                </span>
                <Progress value={progress} className="h-1.5 w-24 bg-secondary" />
              </div>

              {/* Stats */}
              <span className="text-xs font-mono text-muted-foreground">
                {typedText.length} chars
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Ln {lines.length}, Col {(lines[lines.length - 1]?.length ?? 0) + 1}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* WPM & Time */}
              <span className="text-xs font-mono text-primary tabular-nums">
                {currentWpm} WPM
              </span>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {formatTime(elapsedTime)}
              </span>

              {/* Controls */}
              {(isTyping || isPaused) && (
                <div className="flex items-center gap-1.5 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPauseResume}
                    className="h-7 font-mono text-xs border-border hover:bg-secondary"
                  >
                    {isPaused ? (
                      <><Play className="mr-1 h-3 w-3" /> Resume</>
                    ) : (
                      <><Pause className="mr-1 h-3 w-3" /> Pause</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStop}
                    className="h-7 font-mono text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Square className="mr-1 h-3 w-3" /> Stop
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
