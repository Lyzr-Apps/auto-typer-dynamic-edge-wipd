'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Type, Image, Upload, X, FileText } from 'lucide-react'

interface InputSectionProps {
  onExtract: (text: string, imageFile?: File) => void
  isProcessing: boolean
  statusMessage: string | null
  statusType: 'info' | 'success' | 'error' | null
}

export default function InputSection({ onExtract, isProcessing, statusMessage, statusType }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/bmp']
    if (!validTypes.includes(file.type)) {
      return
    }
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setFilePreviewUrl(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExtract = () => {
    if (activeTab === 'text' && textInput.trim()) {
      onExtract(textInput.trim())
    } else if (activeTab === 'image' && selectedFile) {
      onExtract('', selectedFile)
    }
  }

  const canExtract = activeTab === 'text' ? textInput.trim().length > 0 : selectedFile !== null

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Input Source
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary border border-border">
            <TabsTrigger value="text" className="flex-1 gap-2 font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Type className="h-3.5 w-3.5" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 gap-2 font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="h-3.5 w-3.5" />
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-3">
            <Textarea
              placeholder="Paste or type your text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[180px] font-mono text-sm bg-background border-border resize-none focus:ring-1 focus:ring-primary"
            />
            {textInput.length > 0 && (
              <div className="flex justify-end mt-1">
                <span className="text-xs font-mono text-muted-foreground">
                  {textInput.length} chars
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="image" className="mt-3">
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`min-h-[180px] border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-foreground font-mono">Drop an image here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">PNG, JPG, BMP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.bmp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
            ) : (
              <div className="border border-border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs border-primary text-primary">
                      {selectedFile.type.split('/')[1]?.toUpperCase() ?? 'IMG'}
                    </Badge>
                    <span className="text-xs font-mono text-foreground truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFile} className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {filePreviewUrl && (
                  <div className="bg-background border border-border p-2 flex items-center justify-center max-h-[160px] overflow-hidden">
                    <img src={filePreviewUrl} alt="Preview" className="max-h-[140px] object-contain" />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {statusMessage && (
          <div className={`px-3 py-2 border font-mono text-xs flex items-center gap-2 ${statusType === 'success' ? 'border-accent bg-accent/10 text-accent' : statusType === 'error' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-primary bg-primary/10 text-primary'}`}>
            {statusType === 'info' && <Loader2 className="h-3 w-3 animate-spin" />}
            {statusMessage}
          </div>
        )}

        <Button
          onClick={handleExtract}
          disabled={!canExtract || isProcessing}
          className="w-full font-mono text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            'Extract & Prepare'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
