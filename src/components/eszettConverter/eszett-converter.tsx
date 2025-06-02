"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Replace,
  RotateCcw,
  Copy,
  Check,
  Undo,
  Redo,
  Info,
  HelpCircle,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface EszettConverterProps {
  initialText?: string
  onTextChange?: (text: string) => void
  onReplace?: (originalText: string, newText: string) => void
}

export function EszettConverter({
  initialText = "Straße, Weiß, Fußball, Größe, Beiß nicht!",
  onTextChange,
  onReplace,
}: EszettConverterProps) {
  const [text, setText] = useState(initialText)
  const [textHistory, setTextHistory] = useState<string[]>([initialText])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [highlightedPositions, setHighlightedPositions] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    onTextChange?.(text)
  }, [text, onTextChange])

  const addToHistory = useCallback(
    (newText: string) => {
      const newHistory = textHistory.slice(0, historyIndex + 1)
      newHistory.push(newText)
      setTextHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setText(newText)
    },
    [textHistory, historyIndex],
  )

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setText(textHistory[newIndex])
      setLastAction("Undid last change")
      showActionFeedback()
    }
  }

  const redo = () => {
    if (historyIndex < textHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setText(textHistory[newIndex])
      setLastAction("Redid change")
      showActionFeedback()
    }
  }

  const showActionFeedback = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setLastAction(null)
    }, 2000)
  }

  const updateText = (newText: string) => {
    if (newText !== text) {
      const originalText = text
      addToHistory(newText)
      onReplace?.(originalText, newText)
    }
  }

  useEffect(() => {
    const positions: number[] = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "ß") {
        positions.push(i)
      }
    }
    setHighlightedPositions(positions)
    setSelectedPosition(null)
  }, [text])

  const replaceAtPosition = (position: number) => {
    if (text[position] === "ß") {
      const newText = text.slice(0, position) + "ss" + text.slice(position + 1)
      updateText(newText)
      setLastAction("Replaced ß at position " + (position + 1))
      showActionFeedback()
    }
  }

  const replaceAll = () => {
    const eszettCount = (text.match(/ß/g) || []).length
    if (eszettCount > 0) {
      const newText = text.replace(/ß/g, "ss")
      updateText(newText)
      setLastAction(`Replaced all ${eszettCount} ß characters`)
      showActionFeedback()
    }
  }

  const reset = () => {
    setTextHistory([initialText])
    setHistoryIndex(0)
    setText(initialText)
    setSelectedPosition(null)
    setLastAction("Reset to original text")
    showActionFeedback()
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text !== textHistory[historyIndex] && text.trim() !== "") {
        addToHistory(text)
      }
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [text, textHistory, historyIndex, addToHistory])

  const copyFormattedText = async () => {
    if (!isClient) return

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setLastAction("Text copied to clipboard")
        showActionFeedback()
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getStats = () => {
    const eszettCount = (text.match(/ß/g) || []).length
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
    const characterCount = text.length
    return { eszettCount, wordCount, characterCount }
  }

  const stats = getStats()

  const loadSampleText = () => {
    const sampleTexts = [
      "Straße, Weiß, Fußball, Größe, Beiß nicht!",
      "Die weiße Straße führt zum großen Schloß.",
      "Heißes Wasser fließt durch die Röhre.",
      "Der Fuß des Berges ist sehr steil und weiß.",
    ]
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setText(randomText)
    setLastAction("Loaded sample text")
    showActionFeedback()
  }

  const renderHighlightedText = () => {
    if (!text.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">No text entered yet</p>
          <p className="text-xs">Type or paste text above to get started</p>
        </div>
      )
    }

    if (highlightedPositions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
          <span className="text-muted-foreground text-sm mb-1">No ß characters found</span>
          <span className="text-xs text-muted-foreground">Your text is already in Swiss format!</span>
        </div>
      )
    }

    const parts = []
    let lastIndex = 0

    highlightedPositions.forEach((position, index) => {
      if (position > lastIndex) {
        parts.push(
          <span key={`text-${index}`} className="text-foreground whitespace-pre-wrap">
            {text.slice(lastIndex, position)}
          </span>,
        )
      }

      parts.push(
        <span key={`eszett-container-${index}`} className="relative inline-block group">
          <span
            className={`cursor-pointer px-1.5 py-1 rounded-md font-bold transition-all duration-200 ${
              selectedPosition === position
                ? "bg-pink-200 text-pink-800 ring-2 ring-pink-400 dark:bg-pink-800 dark:text-pink-200 dark:ring-pink-600 scale-105"
                : "bg-yellow-200 text-yellow-800 hover:bg-yellow-300 hover:scale-105 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700"
            }`}
            onClick={() => setSelectedPosition(position)}
            title={`Click to select ß at position ${position + 1}`}
          >
            ß
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-1 h-6 w-6 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100 dark:hover:bg-pink-900 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              replaceAtPosition(position)
            }}
            title="Replace this ß with ss"
          >
            <Replace className="h-3 w-3" />
          </Button>
        </span>,
      )

      lastIndex = position + 1
    })

    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end" className="text-foreground whitespace-pre-wrap">
          {text.slice(lastIndex)}
        </span>,
      )
    }

    return parts
  }

  return (
    <TooltipProvider>
      <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
        <div className="mb-6">
          <div className="bg-blue-200 dark:bg-blue-900/40 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-blue-500 text-white self-center">
                <Replace className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-blue-950 dark:text-white">Eszett Converter</h2>
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Detects German `&quot;`ß`&quot;` characters and converts them to Swiss `&quot;`ss`&quot;` format.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showSuccess && lastAction && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{lastAction}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">ß (Eszett) to ss Converter</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    The eszett (ß) is used in German but not in Swiss German. This tool helps convert German text to
                    Swiss format by replacing ß with ss.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="text-input" className="block text-sm font-medium items-center gap-1">
                Enter or paste your text:
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paste or type German text containing ß characters here</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSampleText}
                className="text-xs hover:bg-muted/50 transition-colors"
              >
                <Zap className="h-3 w-3 mr-1" />
                Load Sample
              </Button>
            </div>
            <Textarea
              id="text-input"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type or paste text containing ß characters..."
              className="min-h-[120px] text-base resize-y transition-all focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Type or paste your text above. ß characters will be highlighted in the preview below.
              </p>
              {text.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setText("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={stats.eszettCount > 0 ? "default" : "secondary"}
              className="flex items-center gap-1 transition-colors"
            >
              <Search className="h-3 w-3" />
              {stats.eszettCount} ß found
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {stats.wordCount} words
            </Badge>
            {selectedPosition !== null && (
              <Badge variant="destructive" className="animate-pulse">
                Position {selectedPosition + 1} selected
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-auto">{stats.characterCount} characters</span>
          </div>

          <div className="space-y-4">
            <div className="flex border-b">
              <div className="px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary flex items-center gap-2">
                <Replace className="h-4 w-4" />
                Preview with Highlighted ß Characters
              </div>
            </div>

            <div>
              {highlightedPositions.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Found {highlightedPositions.length} ß character{highlightedPositions.length !== 1 ? "s" : ""}.
                      Click on any highlighted ß or use the replace buttons below.
                    </span>
                  </p>
                </div>
              )}

              <div className="p-6 bg-card border-2 border-border/60 dark:border-border/80 rounded-lg min-h-[120px] text-base leading-relaxed shadow-sm transition-all hover:shadow-md">
                {renderHighlightedText()}
              </div>

              {highlightedPositions.length > 0 && (
                <div className="mt-4 p-4 bg-secondary/50 border-2 border-secondary-foreground/20 dark:border-secondary-foreground/30 rounded-lg">
                  <p className="text-sm text-secondary-foreground font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    How to use:
                  </p>
                  <ul className="text-sm text-secondary-foreground/80 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                        Yellow
                      </span>
                      <span>= detected ß symbols (hover to see replace button)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-pink-200 dark:bg-pink-800 px-2 py-0.5 rounded text-xs font-medium">Pink</span>
                      <span>= selected for replacement</span>
                    </li>
                    <li>• Click any ß to select it, then use &quot;Replace Selected&quot; button</li>
                    <li>• Or use &quot;Replace All&quot; to convert all ß characters at once</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex border-b">
              <div className="px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        variant="outline"
                        className="flex items-center justify-center hover:bg-muted/50 transition-colors"
                      >
                        <Undo className="h-4 w-4 mr-2" />
                        Undo
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Undo the last change</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={redo}
                        disabled={historyIndex >= textHistory.length - 1}
                        variant="outline"
                        className="flex items-center justify-center hover:bg-muted/50 transition-colors"
                      >
                        <Redo className="h-4 w-4 mr-2" />
                        Redo
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Redo the last undone change</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {highlightedPositions.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={replaceAll}
                        className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-700 dark:hover:bg-pink-800 dark:text-white transition-colors"
                      >
                        <Replace className="h-4 w-4 mr-2" />
                        Replace All ß → ss ({highlightedPositions.length})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replace all {highlightedPositions.length} ß characters with ss</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="space-y-4">
                {selectedPosition !== null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => replaceAtPosition(selectedPosition)}
                        variant="destructive"
                        className="w-full transition-colors"
                      >
                        <Replace className="h-4 w-4 mr-2" />
                        Replace Selected (Position {selectedPosition + 1})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replace the selected ß at position {selectedPosition + 1}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={copyFormattedText}
                        variant="outline"
                        className="flex items-center justify-center hover:bg-muted/50 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Text
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy the current text to clipboard</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={reset}
                        className="text-muted-foreground flex items-center justify-center hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset to the original sample text</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {textHistory.length > 1 && (
            <div className="text-xs text-muted-foreground text-center bg-muted/50 border border-border/40 dark:border-border/60 py-2 px-3 rounded-md mt-2 flex items-center justify-center gap-2">
              <Info className="h-3 w-3" />
              <span>
                Step {historyIndex + 1} of {textHistory.length} • Changes are automatically saved
              </span>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}
