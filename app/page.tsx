'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { callAIAgent, uploadFiles } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Keyboard, Cpu, CircleDot } from 'lucide-react'
import InputSection from './sections/InputSection'
import PreviewSection from './sections/PreviewSection'
import SettingsSection from './sections/SettingsSection'
import TypingOverlay from './sections/TypingOverlay'

const AGENT_ID = '69a2d88421bc5fff54108a9b'

// Sample data for toggle
const SAMPLE_DATA = {
  extractedText: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);\n}\n\n// Output:\n// fib(0) = 0\n// fib(1) = 1\n// fib(2) = 1\n// fib(3) = 2\n// fib(4) = 3`,
  confidence: 'high',
  sourceType: 'text',
  notes: 'Code snippet extracted with formatting preserved. Indentation and comments retained.',
  wordCount: 42,
  charCount: 267,
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm font-mono">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  // Extraction state
  const [extractedText, setExtractedText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [confidence, setConfidence] = useState<string | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [sourceType, setSourceType] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | null>(null)

  // Settings state
  const [wpm, setWpm] = useState(60)
  const [speedVariation, setSpeedVariation] = useState(true)
  const [microPauses, setMicroPauses] = useState(true)
  const [typoSimulation, setTypoSimulation] = useState(false)
  const [pauseFrequency, setPauseFrequency] = useState('medium')
  const [startDelay, setStartDelay] = useState(5)

  // Typing simulation state
  const [isTyping, setIsTyping] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentWpm, setCurrentWpm] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)

  // Sample data toggle
  const [useSampleData, setUseSampleData] = useState(false)

  // Agent status
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Refs for typing simulation
  const typingIndexRef = useRef(0)
  const isPausedRef = useRef(false)
  const isStoppedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  const charsTypedRef = useRef(0)

  // Update word/char count when text changes
  const handleTextChange = useCallback((text: string) => {
    setExtractedText(text)
    const trimmed = text.trim()
    setCharCount(text.length)
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0)
  }, [])

  // Sample data toggle handler
  useEffect(() => {
    if (useSampleData) {
      setExtractedText(SAMPLE_DATA.extractedText)
      setWordCount(SAMPLE_DATA.wordCount)
      setCharCount(SAMPLE_DATA.charCount)
      setConfidence(SAMPLE_DATA.confidence)
      setSourceType(SAMPLE_DATA.sourceType)
      setNotes(SAMPLE_DATA.notes)
    } else {
      setExtractedText('')
      setWordCount(0)
      setCharCount(0)
      setConfidence(null)
      setSourceType(null)
      setNotes(null)
    }
  }, [useSampleData])

  // Agent extraction handler
  const handleExtract = useCallback(async (text: string, imageFile?: File) => {
    setIsProcessing(true)
    setStatusMessage('Extracting content...')
    setStatusType('info')
    setActiveAgentId(AGENT_ID)

    try {
      let result
      if (imageFile) {
        const uploadResult = await uploadFiles(imageFile)
        if (!uploadResult.success || !uploadResult.asset_ids?.length) {
          setStatusMessage('Failed to upload image: ' + (uploadResult?.error ?? 'Unknown error'))
          setStatusType('error')
          setIsProcessing(false)
          setActiveAgentId(null)
          return
        }
        result = await callAIAgent(
          'Extract all text from the uploaded image. Preserve formatting, line breaks, indentation, and special characters.',
          AGENT_ID,
          { assets: uploadResult.asset_ids }
        )
      } else {
        result = await callAIAgent(
          `Clean and format the following text for typing simulation. Preserve the original formatting, line breaks, and structure:\n\n${text}`,
          AGENT_ID
        )
      }

      if (result?.success && result?.response?.status === 'success') {
        const data = result.response.result
        const extracted = data?.extracted_text ?? ''
        setExtractedText(extracted)
        setCharCount(data?.character_count ?? extracted.length)
        setWordCount(data?.word_count ?? (extracted.trim() ? extracted.trim().split(/\s+/).length : 0))
        setConfidence(data?.confidence ?? null)
        setSourceType(data?.source_type ?? null)
        setNotes(data?.notes ?? null)
        setStatusMessage('Content extracted successfully')
        setStatusType('success')
      } else {
        setStatusMessage('Failed to extract: ' + (result?.error ?? result?.response?.message ?? 'Unknown error'))
        setStatusType('error')
      }
    } catch (err) {
      setStatusMessage('Failed to extract: ' + (err instanceof Error ? err.message : 'Network error'))
      setStatusType('error')
    } finally {
      setIsProcessing(false)
      setActiveAgentId(null)
    }
  }, [])

  // Typing simulation
  const typeCharacter = useCallback(() => {
    if (isStoppedRef.current) return

    if (isPausedRef.current) {
      typingTimeoutRef.current = setTimeout(typeCharacter, 100)
      return
    }

    const text = extractedText
    const idx = typingIndexRef.current

    if (idx >= text.length) {
      // Done
      setIsTyping(false)
      setShowOverlay(false)
      setProgress(100)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const char = text[idx]
    const baseDelay = 60000 / (wpm * 5)

    // Decide what to type
    let delay = baseDelay

    // Speed variation
    if (speedVariation) {
      const variation = 0.7 + Math.random() * 0.6
      delay = baseDelay * variation
    }

    // Micro-pauses at punctuation/spaces
    if (microPauses) {
      const pauseMultiplier = pauseFrequency === 'high' ? 1.5 : pauseFrequency === 'medium' ? 1.0 : 0.5
      if (char === ' ') {
        delay += (200 + Math.random() * 600) * pauseMultiplier
      } else if (char === '.' || char === '!' || char === '?') {
        delay += (500 + Math.random() * 1000) * pauseMultiplier
      } else if (char === '\n') {
        delay += (300 + Math.random() * 700) * pauseMultiplier
      }
    }

    // Typo simulation
    if (typoSimulation && Math.random() < 0.03 && char.match(/[a-zA-Z]/)) {
      // Type a wrong character first
      const wrongChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1))
      setTypedText(prev => prev + wrongChar)
      typingTimeoutRef.current = setTimeout(() => {
        if (isStoppedRef.current) return
        // Backspace
        setTypedText(prev => prev.slice(0, -1))
        typingTimeoutRef.current = setTimeout(() => {
          if (isStoppedRef.current) return
          // Type correct character
          setTypedText(prev => prev + char)
          typingIndexRef.current = idx + 1
          charsTypedRef.current += 1
          setProgress(((idx + 1) / text.length) * 100)
          typingTimeoutRef.current = setTimeout(typeCharacter, delay)
        }, 150)
      }, 200)
      return
    }

    // Normal typing
    setTypedText(prev => prev + char)
    typingIndexRef.current = idx + 1
    charsTypedRef.current += 1
    setProgress(((idx + 1) / text.length) * 100)
    typingTimeoutRef.current = setTimeout(typeCharacter, delay)
  }, [extractedText, wpm, speedVariation, microPauses, typoSimulation, pauseFrequency])

  const startTyping = useCallback(() => {
    if (!extractedText.trim()) return

    setShowOverlay(true)
    setCountdown(startDelay)
    setTypedText('')
    setProgress(0)
    setElapsedTime(0)
    setCurrentWpm(0)
    setIsPaused(false)
    isPausedRef.current = false
    isStoppedRef.current = false
    typingIndexRef.current = 0
    charsTypedRef.current = 0

    let remaining = startDelay
    const countdownInterval = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(countdownInterval)
        setCountdown(null)
        setIsTyping(true)
        startTimeRef.current = Date.now()

        // Elapsed time timer
        timerRef.current = setInterval(() => {
          if (!isPausedRef.current) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
            setElapsedTime(elapsed)
            if (elapsed > 0) {
              const wordsTyped = charsTypedRef.current / 5
              setCurrentWpm(Math.round((wordsTyped / elapsed) * 60))
            }
          }
        }, 1000)

        typeCharacter()
      } else {
        setCountdown(remaining)
      }
    }, 1000)
  }, [extractedText, startDelay, typeCharacter])

  const handlePauseResume = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev
      isPausedRef.current = next
      return next
    })
  }, [])

  const handleStop = useCallback(() => {
    isStoppedRef.current = true
    setIsTyping(false)
    setShowOverlay(false)
    setCountdown(null)
    setIsPaused(false)
    isPausedRef.current = false
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [])

  const handleReset = useCallback(() => {
    handleStop()
    setTypedText('')
    setProgress(0)
    setElapsedTime(0)
    setCurrentWpm(0)
    setWpm(60)
    setSpeedVariation(true)
    setMicroPauses(true)
    setTypoSimulation(false)
    setPauseFrequency('medium')
    setStartDelay(5)
  }, [handleStop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-mono font-bold text-foreground tracking-tight">
                  AutoTyper Pro
                </h1>
                <p className="text-xs font-mono text-muted-foreground">
                  Intelligent typing simulation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="sample-toggle" className="text-xs font-mono text-muted-foreground cursor-pointer">
                Sample Data
              </Label>
              <Switch
                id="sample-toggle"
                checked={useSampleData}
                onCheckedChange={setUseSampleData}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - 60% */}
            <div className="lg:col-span-3 space-y-6">
              <InputSection
                onExtract={handleExtract}
                isProcessing={isProcessing}
                statusMessage={statusMessage}
                statusType={statusType}
              />
              <PreviewSection
                extractedText={extractedText}
                onTextChange={handleTextChange}
                wordCount={wordCount}
                charCount={charCount}
                confidence={confidence}
                notes={notes}
                sourceType={sourceType}
                typedText={typedText}
                isTyping={isTyping}
              />
            </div>

            {/* Right Column - 40% */}
            <div className="lg:col-span-2 space-y-6">
              <SettingsSection
                wpm={wpm}
                onWpmChange={setWpm}
                speedVariation={speedVariation}
                onSpeedVariationChange={setSpeedVariation}
                microPauses={microPauses}
                onMicroPausesChange={setMicroPauses}
                typoSimulation={typoSimulation}
                onTypoSimulationChange={setTypoSimulation}
                pauseFrequency={pauseFrequency}
                onPauseFrequencyChange={setPauseFrequency}
                startDelay={startDelay}
                onStartDelayChange={setStartDelay}
                canStart={extractedText.trim().length > 0}
                isTyping={isTyping || showOverlay}
                onStart={startTyping}
                onReset={handleReset}
              />

              {/* Agent Info */}
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    Agent Status
                  </p>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CircleDot className={`h-3 w-3 ${activeAgentId ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-mono text-foreground">Content Extractor</span>
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${activeAgentId ? 'border-accent text-accent' : 'border-border text-muted-foreground'}`}>
                      {activeAgentId ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Extracts and cleans text from input or images for typing simulation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Typing Overlay */}
        <TypingOverlay
          isVisible={showOverlay}
          progress={progress}
          currentWpm={currentWpm}
          elapsedTime={elapsedTime}
          isPaused={isPaused}
          countdown={countdown}
          onPauseResume={handlePauseResume}
          onStop={handleStop}
        />
      </div>
    </ErrorBoundary>
  )
}
