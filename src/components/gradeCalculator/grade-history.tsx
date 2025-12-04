"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  Trash2,
  Download,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  BarChart3,
  LogIn,
  ArrowUpDown,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { getGradeQualityColor, getGradeQualityBadgeColor } from "@/lib/grade-colors"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Grade = {
  id: string
  subject_id: string
  assignment: string
  grade: number
  max_grade: number
  weight: number
  date: string
  category?: string
}

type Subject = {
  id: string
  name: string
}

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
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${day}.${month}.${year}`
}

export function GradeHistory({ history: externalHistory, onUpdateHistory }: GradeHistoryProps = {}) {
  const [history, setHistory] = useState<HistoryEntry[]>(externalHistory || [])
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "subject" | "grade">("date")
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    setIsClient(true)
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)

    if (user) {
      loadGradesFromDatabase()
    }
  }

  useEffect(() => {
    if (!isClient || !user) return

    const channel = supabase
      .channel("grades-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "grades" }, () => {
        loadGradesFromDatabase()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isClient, user])

  const loadGradesFromDatabase = async () => {
    const savedSystem = localStorage.getItem("schoolPlayground_gradingSystem") || "switzerland"

    // Fetch grades and subjects in parallel
    const [gradesRes, subjectsRes] = await Promise.all([
      supabase.from("grades").select("*").order("date", { ascending: false }),
      supabase.from("subjects").select("id, name"),
    ])

    if (gradesRes.error) {
      console.error("Failed to load grades:", gradesRes.error)
      return
    }

    if (subjectsRes.error) {
      console.error("Failed to load subjects:", subjectsRes.error)
      return
    }

    // Create a map of subject_id to subject name
    const subjectMap = new Map<string, string>()
    if (subjectsRes.data) {
      for (const subject of subjectsRes.data) {
        subjectMap.set(subject.id, subject.name)
      }
    }

    if (gradesRes.data) {
      const converted: HistoryEntry[] = gradesRes.data.map((g: Grade) => ({
        id: g.id,
        date: new Date(g.date),
        system: savedSystem,
        grade: g.grade,
        details: g.assignment || "Untitled",
        subject: subjectMap.get(g.subject_id) || "Unknown Subject",
        maxPoints: g.max_grade,
        achievedPoints: g.grade,
      }))
      setHistory(converted)
      onUpdateHistory?.(converted)
    }
  }

  const clearHistory = async () => {
    const { error } = await supabase.from("grades").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      console.error("Failed to clear history:", error)
      return
    }

    setHistory([])
    onUpdateHistory?.([])
  }

  const removeEntry = async (id: string) => {
    const { error } = await supabase.from("grades").delete().eq("id", id)

    if (error) {
      console.error("Failed to remove grade:", error)
      return
    }

    setHistory(history.filter((h) => h.id !== id))
    onUpdateHistory?.(history.filter((h) => h.id !== id))
  }

  const getGradeColor = (grade: number, system = "switzerland") => {
    return getGradeQualityColor(grade, system)
  }

  const getGradeBadgeColor = (grade: number, system = "switzerland") => {
    return getGradeQualityBadgeColor(grade, system)
  }

  const getSubjects = () => {
    const subjects = Array.from(new Set(history.map((entry) => entry.subject).filter((subject): subject is string => Boolean(subject))))
    return subjects.sort((a, b) => a.localeCompare(b))
  }

  const getFilteredHistory = () => {
    if (filterSubject === "all") return history
    return history.filter((entry) => entry.subject === filterSubject)
  }

  const getSortedHistory = () => {
    const filtered = getFilteredHistory()

    switch (sortBy) {
      case "date":
        return [...filtered].sort((a, b) => b.date.getTime() - a.date.getTime())
      case "subject":
        return [...filtered].sort((a, b) => {
          const subjectA = a.subject || ""
          const subjectB = b.subject || ""
          return subjectA.localeCompare(subjectB)
        })
      case "grade":
        return [...filtered].sort((a, b) => b.grade - a.grade)
      default:
        return filtered
    }
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

  const filteredHistory = getSortedHistory()
  const averageGrade = getAverageGrade()
  const trend = getLatestTrend()
  const subjects = getSubjects()

  if (loading) {
    return (
      <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
        <div className="bg-purple-200 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-purple-500 text-white self-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grade History</h2>
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  Overview of all your entered grades from the Grade Tool
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
          <LogIn className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg font-medium mb-2 text-foreground">Login Required</p>
          <p className="text-sm mb-6 max-w-md mx-auto text-muted-foreground">
            Please log in to view your grade history. Your grades are securely stored and synced across all your
            devices.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
      <div className="bg-purple-200 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-purple-500 text-white self-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grade History</h2>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                Overview of all your entered grades from the Grade Tool
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportHistory} className="bg-white/50 dark:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearHistory} className="bg-white/50 dark:bg-white/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg font-medium mb-2 text-foreground">No grades yet</p>
          <p className="text-sm mb-6 max-w-md mx-auto text-muted-foreground">
            Start tracking your academic progress by entering grades in the Grade Tool. They'll appear here
            automatically.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Average</span>
              </div>
              <p className={`text-3xl font-bold ${getGradeColor(Number(averageGrade))}`}>{averageGrade || "N/A"}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Trend</span>
              </div>
              <div className="text-2xl font-bold">
                {trend === "up" && <span className="text-green-600 dark:text-green-400">↗ Up</span>}
                {trend === "down" && <span className="text-red-600 dark:text-red-400">↘ Down</span>}
                {trend === "same" && <span className="text-yellow-600 dark:text-yellow-400">→ Stable</span>}
                {trend === null && <span className="text-muted-foreground text-base">—</span>}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Grades</span>
              </div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{filteredHistory.length}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Subjects</span>
              </div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{subjects.length}</p>
            </Card>
          </div>

          <div className="mb-6 space-y-4">
            {subjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">Filter:</span>
                <Button
                  variant={filterSubject === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSubject("all")}
                  className="h-8"
                >
                  All Subjects
                </Button>
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={filterSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSubject(subject ?? "")}
                    className="h-8"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "subject" | "grade")}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                  <SelectItem value="subject">Subject (A-Z)</SelectItem>
                  <SelectItem value="grade">Grade (Highest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg hover:bg-muted/50 transition-all group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="font-medium text-base text-foreground">{entry.details}</p>
                      {entry.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {entry.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`text-xl font-bold px-3 py-1 rounded-md border ${getGradeBadgeColor(entry.grade, entry.system)}`}
                    >
                      {entry.grade}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
