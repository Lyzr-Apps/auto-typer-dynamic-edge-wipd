'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Eye, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface PreviewSectionProps {
  extractedText: string
  onTextChange: (text: string) => void
  wordCount: number
  charCount: number
  confidence: string | null
  notes: string | null
  sourceType: string | null
  typedText: string
  isTyping: boolean
}

export default function PreviewSection({
  extractedText,
  onTextChange,
  wordCount,
  charCount,
  confidence,
  notes,
  sourceType,
  typedText,
  isTyping,
}: PreviewSectionProps) {
  const getConfidenceBadge = () => {
    if (!confidence) return null
    const lower = confidence.toLowerCase()
    if (lower === 'high') {
      return (
        <Badge className="font-mono text-xs bg-accent text-accent-foreground border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          HIGH
        </Badge>
      )
    }
    if (lower === 'medium') {
      return (
        <Badge className="font-mono text-xs bg-primary text-primary-foreground border-0">
          <Info className="h-3 w-3 mr-1" />
          MEDIUM
        </Badge>
      )
    }
    return (
      <Badge className="font-mono text-xs bg-destructive text-destructive-foreground border-0">
        <AlertCircle className="h-3 w-3 mr-1" />
        LOW
      </Badge>
    )
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Preview & Edit
          </CardTitle>
          <div className="flex items-center gap-2">
            {sourceType && (
              <Badge variant="outline" className="font-mono text-xs border-border">
                {sourceType}
              </Badge>
            )}
            {getConfidenceBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={extractedText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Extracted text will appear here. You can also edit it manually."
          className="min-h-[180px] font-mono text-sm bg-background border-border resize-none focus:ring-1 focus:ring-primary"
        />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground">
              Words: <span className="text-foreground">{wordCount}</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              Chars: <span className="text-foreground">{charCount}</span>
            </span>
          </div>
          {extractedText.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              ~{Math.ceil(wordCount / 40)} min @ 40 WPM
            </span>
          )}
        </div>

        {notes && (
          <>
            <Separator className="bg-border" />
            <div className="px-2 py-1.5 bg-secondary/50 border border-border">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-primary mr-1">NOTE:</span>
                {notes}
              </p>
            </div>
          </>
        )}

        {isTyping && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="w-2 h-2 bg-accent animate-pulse" />
                Typing Output
              </p>
              <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-3 bg-background border border-border font-mono text-sm whitespace-pre-wrap break-words">
                {typedText}
                <span className="inline-block w-[2px] h-[14px] bg-primary animate-pulse ml-[1px] align-text-bottom" />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
