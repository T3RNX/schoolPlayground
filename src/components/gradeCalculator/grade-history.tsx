"use client"

import { useState, useEffect } from "react"
import { Clock, Trash2, Download, Filter, TrendingUp, Calendar, Award, HelpCircle, Plus, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type HistoryEntry = {
  id: string
  date: Date
  system: string
  grade: number
  details: string
  subject?: string
  maxPoints?: number
  achievedPoints?: number
}

interface GradeHistoryProps {
  history?: HistoryEntry[]
  onUpdateHistory?: (history: HistoryEntry[]) => void
}

const formatDate = (date: Date) => {
  // Use a consistent format that works the same on server and client
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${day}.${month}.${year}`
}

export function GradeHistory({ history: externalHistory, onUpdateHistory }: GradeHistoryProps = {}) {
  const [history, setHistory] = useState<HistoryEntry[]>(
    externalHistory || [
      {
        id: "1",
        date: new Date(2023, 9, 15),
        system: "Switzerland",
        grade: 5.2,
        details: "Math Quiz: 26/30 points",
        subject: "Mathematics",
        maxPoints: 30,
        achievedPoints: 26,
      },
      {
        id: "2",
        date: new Date(2023, 9, 10),
        system: "Switzerland",
        grade: 4.8,
        details: "Physics Test: 24/30 points",
        subject: "Physics",
        maxPoints: 30,
        achievedPoints: 24,
      },
      {
        id: "3",
        date: new Date(2023, 9, 5),
        system: "Switzerland",
        grade: 3.5,
        details: "Chemistry Exam: 18/30 points",
        subject: "Chemistry",
        maxPoints: 30,
        achievedPoints: 18,
      },
      {
        id: "4",
        date: new Date(2023, 8, 28),
        system: "Switzerland",
        grade: 5.5,
        details: "Math Test: 28/30 points",
        subject: "Mathematics",
        maxPoints: 30,
        achievedPoints: 28,
      },
      {
        id: "5",
        date: new Date(2023, 8, 20),
        system: "Switzerland",
        grade: 4.2,
        details: "History Essay: 21/25 points",
        subject: "History",
        maxPoints: 25,
        achievedPoints: 21,
      },
    ],
  )

  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const clearHistory = () => {
    const newHistory: HistoryEntry[] = []
    setHistory(newHistory)
    onUpdateHistory?.(newHistory)
  }

  const removeEntry = (id: string) => {
    const newHistory = history.filter((entry) => entry.id !== id)
    setHistory(newHistory)
    onUpdateHistory?.(newHistory)
  }

  useEffect(() => {
    if (externalHistory) {
      setHistory(externalHistory)
    }
  }, [externalHistory])

  const getGradeColor = (grade: number, system = "switzerland") => {
    const passGrade = system === "germany" ? 4 : system === "usa" ? 60 : 4

    if (system === "germany") {
      return grade <= passGrade ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
    } else {
      return grade >= passGrade ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
    }
  }

  const getGradeBadgeVariant = (grade: number, system = "switzerland") => {
    const passGrade = system === "germany" ? 4 : system === "usa" ? 60 : 4

    if (system === "germany") {
      return grade <= passGrade ? "default" : "destructive"
    } else {
      return grade >= passGrade ? "default" : "destructive"
    }
  }

  const getSubjects = () => {
    const subjects = Array.from(new Set(history.map((entry) => entry.subject).filter(Boolean)))
    return subjects
  }

  const getFilteredHistory = () => {
    if (filterSubject === "all") return history
    return history.filter((entry) => entry.subject === filterSubject)
  }

  const getAverageGrade = () => {
    const filteredHistory = getFilteredHistory()
    if (filteredHistory.length === 0) return null

    const sum = filteredHistory.reduce((acc, entry) => acc + entry.grade, 0)
    return (sum / filteredHistory.length).toFixed(2)
  }

  const getLatestTrend = () => {
    const filteredHistory = getFilteredHistory()
    if (filteredHistory.length < 2) return null

    const sorted = [...filteredHistory].sort((a, b) => b.date.getTime() - a.date.getTime())
    const latest = sorted[0].grade
    const previous = sorted[1].grade

    return latest > previous ? "up" : latest < previous ? "down" : "same"
  }

  const exportHistory = () => {
    if (!isClient) return

    const csvContent = [
      "Date,Subject,Details,Grade,System,Max Points,Achieved Points",
      ...getFilteredHistory().map((entry) =>
        [
          formatDate(entry.date),
          entry.subject || "",
          entry.details,
          entry.grade,
          entry.system,
          entry.maxPoints || "",
          entry.achievedPoints || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "grade-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredHistory = getFilteredHistory()
  const averageGrade = getAverageGrade()
  const trend = getLatestTrend()

  return (
    <TooltipProvider>
      <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-blue-500 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Grade History</h3>
              <p className="text-sm text-muted-foreground">Track your academic progress over time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={exportHistory}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export history as CSV</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all history</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Average Grade</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average of all grades in the selected filter</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className={`text-2xl font-bold ${getGradeColor(Number(averageGrade))}`}>{averageGrade || "N/A"}</p>
            </div>

            <div className="p-4 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Recent Trend</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comparison between your last two grades</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                {trend === "up" && <span className="text-green-500">↗ Improving</span>}
                {trend === "down" && <span className="text-red-500">↘ Declining</span>}
                {trend === "same" && <span className="text-yellow-500">→ Stable</span>}
                {trend === null && <span className="text-muted-foreground">Not enough data</span>}
              </div>
            </div>

            <div className="p-4 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Total Entries</span>
              </div>
              <p className="text-2xl font-bold">{filteredHistory.length}</p>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by subject:</span>
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="h-8 rounded-md border border-input bg-muted/70 dark:bg-muted/80 px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Subjects</option>
              {getSubjects().map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-border/30 dark:border-border/50 rounded-lg bg-muted/20">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {history.length === 0 ? "No grade calculations yet" : "No grades found for this filter"}
            </p>
            <p className="text-sm mb-4">
              {history.length === 0
                ? "Your calculation history will appear here when you use the grade calculator."
                : "Try selecting a different subject filter or clear the current filter."}
            </p>
            {history.length === 0 && (
              <Button variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Calculate Your First Grade
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{entry.details}</p>
                        {entry.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.subject}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.date)}
                        </span>
                        <span>{entry.system}</span>
                        {entry.achievedPoints && entry.maxPoints && (
                          <span>
                            {entry.achievedPoints}/{entry.maxPoints} points (
                            {Math.round((entry.achievedPoints / entry.maxPoints) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={getGradeBadgeVariant(entry.grade, entry.system)} className="text-lg font-bold">
                          {entry.grade}
                        </Badge>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(entry.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove this entry</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
