"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Plus,
  CalendarIcon,
  Award,
  Check,
  X,
  LogIn,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Layers,
  Pencil,
  Settings,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { getGradeQualityColor, getGradeQualityBadgeColor } from "@/lib/grade-colors"
import {
  calculatePluspoints,
  calculateTotalPluspoints,
  getPluspointsColor,
  getPluspointsBadgeColor,
} from "@/lib/pluspoints"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type Semester = {
  id: string
  user_id: string
  name: string
  start_date: string | null
  end_date: string | null
}

type Subject = {
  id: string
  semester_id: string
  user_id: string
  name: string
  color?: string
}

type Grade = {
  id: string
  user_id: string
  semester_id: string
  subject_id: string
  subject?: string // Legacy field
  assignment?: string // Now optional
  grade: number
  max_grade: number
  weight: number
  date: string
  category?: string
}

const GRADE_CATEGORIES = ["Test", "Homework", "Quiz", "Project", "Participation", "Other"]

const GRADING_SYSTEMS = {
  switzerland: { min: 1, max: 6, pass: 4, name: "Switzerland (1-6)" },
  germany: { min: 1, max: 6, pass: 4, name: "Germany (1-6)" },
  usa: { min: 0, max: 100, pass: 60, name: "USA (0-100)" },
}

export function GradeTool() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [system, setSystem] = useState<keyof typeof GRADING_SYSTEMS>("switzerland")
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [displayMode, setDisplayMode] = useState<"pluspoints" | "average">("pluspoints")

  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set())
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [showNewSemester, setShowNewSemester] = useState(false)
  const [showNewSubject, setShowNewSubject] = useState<string | null>(null)
  const [showNewGrade, setShowNewGrade] = useState<string | null>(null)

  const [newSemesterName, setNewSemesterName] = useState("")
  const [newSemesterStart, setNewSemesterStart] = useState<Date | undefined>(undefined)
  const [newSemesterEnd, setNewSemesterEnd] = useState<Date | undefined>(undefined)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [gradeForm, setGradeForm] = useState({
    assignment: "",
    grade: "",
    weight: "1",
    category: "Test",
  })

  const [editingGrade, setEditingGrade] = useState<string | null>(null)

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
      loadData()
      loadGradingSystem()
      loadDisplayMode()
    }
  }

  const loadData = async () => {
    const [semestersRes, subjectsRes, gradesRes] = await Promise.all([
      supabase.from("semesters").select("*").order("start_date", { ascending: false }),
      supabase.from("subjects").select("*"),
      supabase.from("grades").select("*").order("date", { ascending: false }),
    ])

    if (semestersRes.data) setSemesters(semestersRes.data)
    if (subjectsRes.data) setSubjects(subjectsRes.data)
    if (gradesRes.data) setGrades(gradesRes.data)
  }

  const loadGradingSystem = async () => {
    const saved = localStorage.getItem("schoolPlayground_gradingSystem")
    if (saved && saved in GRADING_SYSTEMS) {
      setSystem(saved as keyof typeof GRADING_SYSTEMS)
    }
  }

  const loadDisplayMode = () => {
    const saved = localStorage.getItem("schoolPlayground_displayMode")
    if (saved === "pluspoints" || saved === "average") {
      setDisplayMode(saved)
    }
  }

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("schoolPlayground_gradingSystem", system)
    }
  }, [system, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("schoolPlayground_displayMode", displayMode)
    }
  }, [displayMode, isClient])

  const addSemester = async () => {
    if (!newSemesterName.trim()) return

    const { data, error } = await supabase
      .from("semesters")
      .insert([
        {
          user_id: user.id,
          name: newSemesterName.trim(),
          start_date: newSemesterStart ? format(newSemesterStart, "yyyy-MM-dd") : null,
          end_date: newSemesterEnd ? format(newSemesterEnd, "yyyy-MM-dd") : null,
        },
      ])
      .select()

    if (error) {
      console.error("Failed to add semester:", error)
      return
    }

    if (data) {
      setSemesters([data[0], ...semesters])
      setExpandedSemesters(new Set([...expandedSemesters, data[0].id]))
    }

    setNewSemesterName("")
    setNewSemesterStart(undefined)
    setNewSemesterEnd(undefined)
    setShowNewSemester(false)
  }

  const addSubject = async (semesterId: string) => {
    if (!newSubjectName.trim()) return

    const { data, error } = await supabase
      .from("subjects")
      .insert([
        {
          user_id: user.id,
          semester_id: semesterId,
          name: newSubjectName.trim(),
        },
      ])
      .select()

    if (error) {
      console.error("Failed to add subject:", error)
      return
    }

    if (data) {
      setSubjects([...subjects, data[0]])
      setExpandedSubjects(new Set([...expandedSubjects, data[0].id]))
    }

    setNewSubjectName("")
    setShowNewSubject(null)
  }

  const addGrade = async (subjectId: string) => {
    if (!gradeForm.grade.trim()) return

    const gradeNum = Number.parseFloat(gradeForm.grade)
    const selectedSystem = GRADING_SYSTEMS[system]
    if (isNaN(gradeNum) || gradeNum < selectedSystem.min || gradeNum > selectedSystem.max) return

    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) return

    const { data, error } = await supabase
      .from("grades")
      .insert([
        {
          user_id: user.id,
          semester_id: subject.semester_id,
          subject_id: subjectId,
          assignment: gradeForm.assignment.trim() || null,
          grade: gradeNum,
          max_grade: selectedSystem.max,
          weight: Number.parseFloat(gradeForm.weight) || 1,
          date: new Date().toISOString().split("T")[0],
          category: gradeForm.category,
        },
      ])
      .select()

    if (error) {
      console.error("Failed to add grade:", error)
      return
    }

    if (data) {
      setGrades([data[0], ...grades])
    }

    setGradeForm({ assignment: "", grade: "", weight: "1", category: "Test" })
    setShowNewGrade(null)
  }

  const updateGrade = async (gradeId: string, subjectId: string) => {
    if (!gradeForm.grade.trim()) return

    const gradeNum = Number.parseFloat(gradeForm.grade)
    const selectedSystem = GRADING_SYSTEMS[system]
    if (isNaN(gradeNum) || gradeNum < selectedSystem.min || gradeNum > selectedSystem.max) return

    const { data, error } = await supabase
      .from("grades")
      .update({
        assignment: gradeForm.assignment.trim() || null,
        grade: gradeNum,
        weight: Number.parseFloat(gradeForm.weight) || 1,
        category: gradeForm.category,
      })
      .eq("id", gradeId)
      .select()

    if (error) {
      console.error("Failed to update grade:", error)
      return
    }

    if (data) {
      setGrades(grades.map((g) => (g.id === gradeId ? data[0] : g)))
    }

    setGradeForm({ assignment: "", grade: "", weight: "1", category: "Test" })
    setEditingGrade(null)
    setShowNewGrade(null)
  }

  const deleteGrade = async (id: string) => {
    const { error } = await supabase.from("grades").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete grade:", error)
      return
    }
    setGrades(grades.filter((g) => g.id !== id))
  }

  const getSubjectGrades = (subjectId: string) => {
    return grades.filter((g) => g.subject_id === subjectId)
  }

  const calculateSubjectAverage = (subjectId: string) => {
    const subjectGrades = getSubjectGrades(subjectId)
    if (subjectGrades.length === 0) return null

    const weightedSum = subjectGrades.reduce((sum, g) => sum + g.grade * g.weight, 0)
    const totalWeight = subjectGrades.reduce((sum, g) => sum + g.weight, 0)

    return weightedSum / totalWeight
  }

  const calculateSemesterAverage = (semesterId: string) => {
    const semesterSubjects = subjects.filter((s) => s.semester_id === semesterId)
    const averages = semesterSubjects.map((s) => calculateSubjectAverage(s.id)).filter((a) => a !== null) as number[]

    if (averages.length === 0) return null
    return averages.reduce((sum, avg) => sum + avg, 0) / averages.length
  }

  const calculateSemesterPluspoints = (semesterId: string) => {
    const semesterSubjects = subjects.filter((s) => s.semester_id === semesterId)
    const subjectPluspoints = semesterSubjects
      .map((s) => calculateSubjectPluspoints(s.id))
      .filter((p) => p !== null) as number[]

    if (subjectPluspoints.length === 0) return null
    return subjectPluspoints.reduce((sum, pts) => sum + pts, 0)
  }

  const calculateSubjectPluspoints = (subjectId: string) => {
    const subjectGrades = getSubjectGrades(subjectId)
    if (subjectGrades.length === 0) return null

    return calculateTotalPluspoints(subjectGrades.map((g) => g.grade))
  }

  const toggleSemester = (id: string) => {
    const newExpanded = new Set(expandedSemesters)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSemesters(newExpanded)
  }

  const toggleSubject = (id: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSubjects(newExpanded)
  }

  const startEditGrade = (grade: Grade) => {
    setEditingGrade(grade.id)
    setShowNewGrade(grade.subject_id)
    setGradeForm({
      assignment: grade.assignment || "",
      grade: grade.grade.toString(),
      weight: grade.weight.toString(),
      category: grade.category || "Test",
    })
  }

  const cancelEdit = () => {
    setEditingGrade(null)
    setShowNewGrade(null)
    setGradeForm({ assignment: "", grade: "", weight: "1", category: "Test" })
  }

  const selectedSystem = GRADING_SYSTEMS[system]

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
          <div className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-purple-500 text-white self-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grade Tool</h2>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                Track grades by semester and subject with pluspoints calculation
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
          <LogIn className="h-16 w-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">Login Required</p>
          <p className="text-sm mb-6 max-w-md mx-auto">
            Please log in to start tracking your grades by semester and subject.
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
      {/* Header */}
      <div className="bg-purple-200 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full p-2 bg-purple-500 text-white self-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grade Tool</h2>
            <p className="text-sm text-purple-900 dark:text-purple-100">
              Organize grades by semester and subject • Track {displayMode === "pluspoints" ? "pluspoints" : "averages"}
            </p>
          </div>
        </div>
      </div>

      {/* Grading System Selector and Display Mode Toggle */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
          <Label className="text-sm font-medium mb-2 block">Grading System</Label>
          <Select value={system} onValueChange={(value) => setSystem(value as keyof typeof GRADING_SYSTEMS)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GRADING_SYSTEMS).map(([key, sys]) => (
                <SelectItem key={key} value={key}>
                  {sys.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Display Mode
          </Label>
          <Select value={displayMode} onValueChange={(value) => setDisplayMode(value as "pluspoints" | "average")}>
            <SelectTrigger className="w-full h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="average">Average Grade</SelectItem>
              <SelectItem value="pluspoints">Pluspoints (Swiss System)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add Semester Button */}
      <div className="mb-6">
        {!showNewSemester ? (
          <Button onClick={() => setShowNewSemester(true)} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
        ) : (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              New Semester
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="semester-name" className="text-xs mb-1.5 block">
                  Semester Name *
                </Label>
                <Input
                  id="semester-name"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  placeholder="e.g., Fall 2024"
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Start Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal",
                          !newSemesterStart && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSemesterStart ? format(newSemesterStart, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newSemesterStart} onSelect={setNewSemesterStart} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">End Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal",
                          !newSemesterEnd && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSemesterEnd ? format(newSemesterEnd, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newSemesterEnd} onSelect={setNewSemesterEnd} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addSemester} className="flex-1" disabled={!newSemesterName.trim()}>
                  <Check className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button onClick={() => setShowNewSemester(false)} variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Semesters List */}
      {semesters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium mb-1">No semesters yet</p>
          <p className="text-sm">Create your first semester to start organizing your grades!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {semesters.map((semester) => {
            const isExpanded = expandedSemesters.has(semester.id)
            const semesterSubjects = subjects.filter((s) => s.semester_id === semester.id)
            const semesterAvg = calculateSemesterAverage(semester.id)
            const semesterPluspoints = calculateSemesterPluspoints(semester.id)

            return (
              <div key={semester.id} className="border-2 border-border/60 rounded-xl overflow-hidden">
                {/* Semester Header */}
                <div
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-950/40 dark:hover:to-indigo-950/40 transition-colors"
                  onClick={() => toggleSemester(semester.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{semester.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {semester.start_date && new Date(semester.start_date).toLocaleDateString()} -{" "}
                          {semester.end_date && new Date(semester.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {semesterAvg !== null && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getGradeQualityColor(semesterAvg, system)}`}>
                            {semesterAvg.toFixed(2)}
                          </div>
                          {displayMode === "pluspoints" && system === "switzerland" && semesterPluspoints !== null && (
                            <div className={`text-sm font-medium ${getPluspointsColor(semesterPluspoints)}`}>
                              {semesterPluspoints >= 0 ? "+" : ""}
                              {semesterPluspoints.toFixed(1)} pts
                            </div>
                          )}
                        </div>
                      )}
                      <Badge variant="secondary">{semesterSubjects.length} subjects</Badge>
                    </div>
                  </div>
                </div>

                {/* Semester Content */}
                {isExpanded && (
                  <div className="p-4 bg-background space-y-3">
                    {/* Add Subject Button */}
                    {showNewSubject !== semester.id ? (
                      <Button
                        onClick={() => setShowNewSubject(semester.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Subject
                      </Button>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                        <div className="flex gap-2">
                          <Input
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="Subject name (e.g., Mathematics)"
                            className="h-9"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addSubject(semester.id)
                            }}
                          />
                          <Button onClick={() => addSubject(semester.id)} size="sm" disabled={!newSubjectName.trim()}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button onClick={() => setShowNewSubject(null)} size="sm" variant="outline">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Subjects List */}
                    {semesterSubjects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>No subjects yet. Add your first subject!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {semesterSubjects.map((subject) => {
                          const isSubjectExpanded = expandedSubjects.has(subject.id)
                          const subjectGrades = getSubjectGrades(subject.id)
                          const subjectAvg = calculateSubjectAverage(subject.id)
                          const subjectPluspoints = calculateSubjectPluspoints(subject.id)

                          return (
                            <div key={subject.id} className="border border-border/40 rounded-lg overflow-hidden">
                              {/* Subject Header */}
                              <div
                                className="p-3 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => toggleSubject(subject.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isSubjectExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <span className="font-medium">{subject.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {subjectGrades.length} grades
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {subjectAvg !== null && (
                                      <div className="text-right">
                                        <div
                                          className={`text-lg font-bold ${getGradeQualityColor(subjectAvg, system)}`}
                                        >
                                          {subjectAvg.toFixed(2)}
                                        </div>
                                        {displayMode === "pluspoints" &&
                                          system === "switzerland" &&
                                          subjectPluspoints !== null && (
                                            <div
                                              className={`text-xs font-medium ${getPluspointsColor(subjectPluspoints)}`}
                                            >
                                              {subjectPluspoints >= 0 ? "+" : ""}
                                              {subjectPluspoints.toFixed(1)} pts
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Subject Content (Grades) */}
                              {isSubjectExpanded && (
                                <div className="p-3 bg-background space-y-2">
                                  {/* Add/Edit Grade Form */}
                                  {showNewGrade !== subject.id ? (
                                    <Button
                                      onClick={() => setShowNewGrade(subject.id)}
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                    >
                                      <Plus className="h-3 w-3 mr-2" />
                                      Add Grade
                                    </Button>
                                  ) : (
                                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs mb-1 block">Assignment (optional)</Label>
                                            <Input
                                              value={gradeForm.assignment}
                                              onChange={(e) =>
                                                setGradeForm({ ...gradeForm, assignment: e.target.value })
                                              }
                                              placeholder="e.g., Midterm"
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs mb-1 block">Grade *</Label>
                                            <Input
                                              type="number"
                                              min={selectedSystem.min}
                                              max={selectedSystem.max}
                                              step="0.01"
                                              value={gradeForm.grade}
                                              onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                              placeholder={`${selectedSystem.min}-${selectedSystem.max}`}
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs mb-1 block">Weight</Label>
                                            <Input
                                              type="number"
                                              min="0.1"
                                              step="0.1"
                                              value={gradeForm.weight}
                                              onChange={(e) => setGradeForm({ ...gradeForm, weight: e.target.value })}
                                              className="h-9 text-sm"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs mb-1 block">Category</Label>
                                            <Select
                                              value={gradeForm.category}
                                              onValueChange={(value) => setGradeForm({ ...gradeForm, category: value })}
                                            >
                                              <SelectTrigger className="w-full h-9">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {GRADE_CATEGORIES.map((cat) => (
                                                  <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() =>
                                              editingGrade
                                                ? updateGrade(editingGrade, subject.id)
                                                : addGrade(subject.id)
                                            }
                                            size="sm"
                                            className="flex-1"
                                            disabled={!gradeForm.grade.trim()}
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            {editingGrade ? "Update" : "Add"}
                                          </Button>
                                          <Button
                                            onClick={() => (editingGrade ? cancelEdit() : setShowNewGrade(null))}
                                            size="sm"
                                            variant="outline"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Grades List */}
                                  {subjectGrades.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                      <Award className="h-6 w-6 mx-auto mb-2 opacity-40" />
                                      <p>No grades yet</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {subjectGrades.map((grade) => (
                                        <div
                                          key={grade.id}
                                          className="flex items-center justify-between p-2 bg-muted/20 rounded hover:bg-muted/40 transition-colors group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {grade.assignment && (
                                                <span className="text-sm font-medium">{grade.assignment}</span>
                                              )}
                                              {grade.category && (
                                                <Badge variant="outline" className="text-xs">
                                                  {grade.category}
                                                </Badge>
                                              )}
                                              {grade.weight !== 1 && (
                                                <span className="text-xs text-muted-foreground">
                                                  Weight: {grade.weight}x
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                              <CalendarIcon className="h-3 w-3" />
                                              {new Date(grade.date).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`text-lg font-bold px-2 py-1 rounded ${getGradeQualityBadgeColor(grade.grade, system)}`}
                                            >
                                              {grade.grade.toFixed(1)}
                                            </div>
                                            {displayMode === "pluspoints" && system === "switzerland" && (
                                              <div
                                                className={`text-xs font-medium px-2 py-1 rounded ${getPluspointsBadgeColor(calculatePluspoints(grade.grade))}`}
                                              >
                                                {calculatePluspoints(grade.grade) >= 0 ? "+" : ""}
                                                {calculatePluspoints(grade.grade).toFixed(1)}
                                              </div>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => startEditGrade(grade)}
                                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                            >
                                              <Pencil className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => deleteGrade(grade.id)}
                                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
