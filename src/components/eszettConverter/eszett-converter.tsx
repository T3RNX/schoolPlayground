"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Replace,
  RotateCcw,
  Copy,
  Check,
  Undo,
  Redo,
  Languages,
} from "lucide-react";

interface EszettConverterProps {
  initialText?: string;
  onTextChange?: (text: string) => void;
  onReplace?: (originalText: string, newText: string) => void;
}

export function EszettConverter({
  initialText = "Straße, Weiß, Fußball, Größe, Beiß nicht!",
  onTextChange,
  onReplace,
}: EszettConverterProps) {
  const [text, setText] = useState(initialText);
  const [textHistory, setTextHistory] = useState<string[]>([initialText]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [highlightedPositions, setHighlightedPositions] = useState<number[]>(
    []
  );
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    onTextChange?.(text);
  }, [text, onTextChange]);

  const addToHistory = (newText: string) => {
    const newHistory = textHistory.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setText(newText);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(textHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < textHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(textHistory[newIndex]);
    }
  };

  const updateText = (newText: string) => {
    if (newText !== text) {
      const originalText = text;
      addToHistory(newText);
      onReplace?.(originalText, newText);
    }
  };

  useEffect(() => {
    const positions: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "ß") {
        positions.push(i);
      }
    }
    setHighlightedPositions(positions);
    setSelectedPosition(null);
  }, [text]);

  const replaceAtPosition = (position: number) => {
    if (text[position] === "ß") {
      const newText = text.slice(0, position) + "ss" + text.slice(position + 1);
      updateText(newText);
    }
  };

  const replaceAll = () => {
    const newText = text.replace(/ß/g, "ss");
    updateText(newText);
  };

  const reset = () => {
    setTextHistory([initialText]);
    setHistoryIndex(0);
    setText(initialText);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text !== textHistory[historyIndex] && text.trim() !== "") {
        addToHistory(text);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [text, textHistory, historyIndex]);

  const copyFormattedText = async () => {
    if (!isClient) return;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getStats = () => {
    const eszettCount = (text.match(/ß/g) || []).length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { eszettCount, wordCount };
  };

  const stats = getStats();
  const renderHighlightedText = () => {
    if (highlightedPositions.length === 0) {
      return (
        <span className="text-muted-foreground italic">
          No ß (Eszett) found in the text.
        </span>
      );
    }

    const parts = [];
    let lastIndex = 0;

    highlightedPositions.forEach((position, index) => {
      if (position > lastIndex) {
        parts.push(
          <span
            key={`text-${index}`}
            className="text-muted-foreground whitespace-pre-wrap"
          >
            {text.slice(lastIndex, position)}
          </span>
        );
      }

      parts.push(
        <span
          key={`eszett-container-${index}`}
          className="relative inline-block"
        >
          <span
            className={`cursor-pointer px-1 py-0.5 rounded font-bold transition-colors ${
              selectedPosition === position
                ? "bg-pink-200 text-pink-800 ring-2 ring-pink-400"
                : "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
            }`}
            onClick={() => setSelectedPosition(position)}
            title="Click to select this ß for replacement"
          >
            ß
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-1 h-6 w-6 p-0 text-xs hover:bg-pink-100"
            onClick={(e) => {
              e.stopPropagation();
              replaceAtPosition(position);
            }}
            title="Replace this ß with ss"
          >
            <Replace className="h-3 w-3" />
          </Button>
        </span>
      );

      lastIndex = position + 1;
    });

    if (lastIndex < text.length) {
      parts.push(
        <span
          key="text-end"
          className="text-muted-foreground whitespace-pre-wrap"
        >
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full p-2 bg-blue-500 text-white">
          <Replace className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold">Eszett Converter</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-row flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">ß (Eszett) to ss Converter</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Detects German "ß" characters and converts them to Swiss "ss" format
          </p>
        </div>

        <div>
          <label
            htmlFor="text-input"
            className="block text-sm font-medium mb-2"
          >
            Enter or paste your text:
          </label>
          <Textarea
            id="text-input"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste text containing ß characters..."
            className="min-h-[120px] text-base resize-y"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Type or paste your text above. ß characters will be highlighted in
            the preview below.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            {stats.eszettCount} ß found
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {stats.wordCount} words
          </Badge>
          {selectedPosition !== null && (
            <Badge variant="destructive">
              Position {selectedPosition + 1} selected
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-auto">
            {text.length} characters
          </span>
        </div>

        <div className="flex border-b mb-2">
          <div className="px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary">
            Preview with Highlighted ß Characters
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Click on any highlighted ß to select it, or use the small replace
            button next to each ß
          </p>

          <div className="p-6 bg-white border rounded-lg min-h-[120px] text-base leading-relaxed">
            {text ? (
              renderHighlightedText()
            ) : (
              <span className="text-muted-foreground italic">
                No text entered
              </span>
            )}
          </div>

          {highlightedPositions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                How to use:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <span className="bg-yellow-200 px-1 rounded">Yellow</span> =
                  detected ß symbols
                </li>
                <li>
                  • <span className="bg-pink-200 px-1 rounded">Pink</span> =
                  selected for replacement
                </li>
                <li>
                  • Click the small replace button next to any ß for instant
                  replacement
                </li>
                <li>• Or use the controls below</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex border-b mb-2">
          <div className="px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary">
            Quick Actions
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={undo}
                disabled={historyIndex <= 0}
                variant="outline"
                className="flex items-center justify-center"
                title="Undo last change"
              >
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                onClick={redo}
                disabled={historyIndex >= textHistory.length - 1}
                variant="outline"
                className="flex items-center justify-center"
                title="Redo last undone change"
              >
                <Redo className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>

            {highlightedPositions.length > 0 && (
              <Button
                onClick={replaceAll}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                <Replace className="h-4 w-4 mr-2" />
                Replace All ß → ss
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {selectedPosition !== null && (
              <Button
                onClick={() => replaceAtPosition(selectedPosition)}
                variant="destructive"
                className="w-full"
              >
                <Replace className="h-4 w-4 mr-2" />
                Replace Selected
              </Button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={copyFormattedText}
                variant="outline"
                className="flex items-center justify-center"
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

              <Button
                variant="ghost"
                onClick={reset}
                className="text-muted-foreground flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {textHistory.length > 1 && (
          <div className="text-xs text-muted-foreground text-center bg-muted/50 py-1 rounded mt-2">
            Step {historyIndex + 1} of {textHistory.length}
          </div>
        )}
      </div>
    </Card>
  );
}
