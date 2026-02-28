'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, Play, RotateCcw, Minus, Plus, Zap, Timer, Keyboard } from 'lucide-react'

interface SettingsSectionProps {
  wpm: number
  onWpmChange: (val: number) => void
  speedVariation: boolean
  onSpeedVariationChange: (val: boolean) => void
  microPauses: boolean
  onMicroPausesChange: (val: boolean) => void
  typoSimulation: boolean
  onTypoSimulationChange: (val: boolean) => void
  pauseFrequency: string
  onPauseFrequencyChange: (val: string) => void
  startDelay: number
  onStartDelayChange: (val: number) => void
  canStart: boolean
  isTyping: boolean
  onStart: () => void
  onReset: () => void
}

export default function SettingsSection({
  wpm,
  onWpmChange,
  speedVariation,
  onSpeedVariationChange,
  microPauses,
  onMicroPausesChange,
  typoSimulation,
  onTypoSimulationChange,
  pauseFrequency,
  onPauseFrequencyChange,
  startDelay,
  onStartDelayChange,
  canStart,
  isTyping,
  onStart,
  onReset,
}: SettingsSectionProps) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Speed (WPM)
            </Label>
            <span className="font-mono text-sm text-primary font-semibold tabular-nums">{wpm}</span>
          </div>
          <Slider
            value={[wpm]}
            onValueChange={(val) => onWpmChange(val[0])}
            min={10}
            max={300}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>10</span>
            <span>150</span>
            <span>300</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Human Simulation Toggles */}
        <div className="space-y-3">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Keyboard className="h-3.5 w-3.5 text-primary" />
            Human Simulation
          </Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-mono text-foreground">Speed Variation</p>
                <p className="text-xs text-muted-foreground">Natural acceleration & deceleration</p>
              </div>
              <Switch checked={speedVariation} onCheckedChange={onSpeedVariationChange} />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-mono text-foreground">Micro-Pauses</p>
                <p className="text-xs text-muted-foreground">Pauses between words & sentences</p>
              </div>
              <Switch checked={microPauses} onCheckedChange={onMicroPausesChange} />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-mono text-foreground">Typo Simulation</p>
                <p className="text-xs text-muted-foreground">Occasional typos with auto-correction</p>
              </div>
              <Switch checked={typoSimulation} onCheckedChange={onTypoSimulationChange} />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Pause Frequency */}
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Pause Frequency
          </Label>
          <Select value={pauseFrequency} onValueChange={onPauseFrequencyChange}>
            <SelectTrigger className="font-mono text-sm bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="low" className="font-mono text-sm">Low</SelectItem>
              <SelectItem value="medium" className="font-mono text-sm">Medium</SelectItem>
              <SelectItem value="high" className="font-mono text-sm">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Delay */}
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-primary" />
            Start Delay (seconds)
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-border"
              onClick={() => onStartDelayChange(Math.max(3, startDelay - 1))}
              disabled={startDelay <= 3}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="font-mono text-sm text-foreground w-8 text-center tabular-nums">{startDelay}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-border"
              onClick={() => onStartDelayChange(Math.min(30, startDelay + 1))}
              disabled={startDelay >= 30}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-mono text-muted-foreground ml-1">sec</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onStart}
            disabled={!canStart || isTyping}
            className="w-full font-mono text-xs uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Typing
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full font-mono text-xs uppercase tracking-wider border-border hover:bg-secondary"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
