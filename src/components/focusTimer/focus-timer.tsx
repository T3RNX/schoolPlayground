"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Coffee,
  Brain,
  Zap,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  FolderPlus,
  Folder,
  Edit2,
  Check,
  X,
  Bell,
  Target,
  TrendingUp,
  SkipForward,
  ChevronUp,
  ChevronDown,
  Info,
  GripVertical,
  ExternalLink,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type TimerMode = "focus" | "short-break" | "long-break"
type TimerStatus = "idle" | "running" | "paused"

interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  alarmVolume: number
  alarmRepeat: number
  tickingVolume: number
  tickingEnabled: boolean
  darkModeWhenRunning: boolean
  notificationEnabled: boolean
}

interface Task {
  id: string
  title: string
  completed: boolean
  projectId: string
  estimatedSessions: number
  sessionsSpent: number
}

interface Project {
  id: string
  name: string
}

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [totalTime, setTotalTime] = useState(25 * 60)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [currentCycleSession, setCurrentCycleSession] = useState(0) // Added session cycle tracking
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null) // Added drag and drop state
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    alarmVolume: 50,
    alarmRepeat: 1,
    tickingVolume: 50,
    tickingEnabled: false,
    darkModeWhenRunning: false,
    notificationEnabled: true,
  })
  const [tempSettings, setTempSettings] = useState(settings)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const tickingAudioRef = useRef<HTMLAudioElement | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([{ id: "default", name: "General" }])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [selectedProject, setSelectedProject] = useState("default")
  const [newProjectName, setNewProjectName] = useState("")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [filterProject, setFilterProject] = useState<string>("all")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState("")
  const [editingEstimatedSessions, setEditingEstimatedSessions] = useState(1)
  const [newTaskEstimatedSessions, setNewTaskEstimatedSessions] = useState(1)
  const [infoOpen, setInfoOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isPopupMode, setIsPopupMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const isPopup = urlParams.get("popup") === "true"
      setIsPopupMode(isPopup)

      // Restore state from URL if in popup mode
      if (isPopup) {
        const savedMode = urlParams.get("mode") as TimerMode
        const savedTimeLeft = urlParams.get("timeLeft")
        const savedTotalTime = urlParams.get("totalTime")
        const savedStatus = urlParams.get("status") as TimerStatus
        const savedActiveTaskId = urlParams.get("activeTaskId")
        const savedSessionsCompleted = urlParams.get("sessionsCompleted")
        const savedCurrentCycleSession = urlParams.get("currentCycleSession")

        if (savedMode) setMode(savedMode)
        if (savedTimeLeft) setTimeLeft(Number(savedTimeLeft))
        if (savedTotalTime) setTotalTime(Number(savedTotalTime))
        if (savedStatus && savedStatus !== "running") setStatus(savedStatus) // Don't auto-start
        if (savedActiveTaskId && savedActiveTaskId !== "") setActiveTaskId(savedActiveTaskId)
        if (savedSessionsCompleted) setSessionsCompleted(Number(savedSessionsCompleted))
        if (savedCurrentCycleSession) setCurrentCycleSession(Number(savedCurrentCycleSession))
      }
    }
  }, [])

  useEffect(() => {
    if (settings.notificationEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [settings.notificationEnabled])

  useEffect(() => {
    if (status === "running" && settings.tickingEnabled) {
      if (!tickingAudioRef.current) {
        tickingAudioRef.current = new Audio("/placeholder.mp3")
        tickingAudioRef.current.loop = true
      }
      tickingAudioRef.current.volume = settings.tickingVolume / 100
      tickingAudioRef.current.play().catch(() => {})
    } else {
      if (tickingAudioRef.current) {
        tickingAudioRef.current.pause()
        tickingAudioRef.current.currentTime = 0
      }
    }
  }, [status, settings.tickingEnabled, settings.tickingVolume])

  useEffect(() => {
    if (settings.darkModeWhenRunning && status === "running") {
      document.documentElement.classList.add("dark")
    } else if (settings.darkModeWhenRunning && status !== "running") {
      document.documentElement.classList.remove("dark")
    }
  }, [status, settings.darkModeWhenRunning])

  useEffect(() => {
    if (status === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status, timeLeft])

  const handleTimerComplete = () => {
    setStatus("idle")

    if (mode === "focus" && activeTaskId) {
      setTasks(
        tasks.map((task) => (task.id === activeTaskId ? { ...task, sessionsSpent: task.sessionsSpent + 1 } : task)),
      )
    }

    // Play alarm sound with repeat
    if (alarmAudioRef.current) {
      alarmAudioRef.current.volume = settings.alarmVolume / 100
      let repeatCount = 0
      const playAlarm = () => {
        if (repeatCount < settings.alarmRepeat) {
          alarmAudioRef.current?.play().catch(() => {})
          repeatCount++
          setTimeout(playAlarm, 1000)
        }
      }
      playAlarm()
    } else {
      alarmAudioRef.current = new Audio("/placeholder.mp3")
      alarmAudioRef.current.volume = settings.alarmVolume / 100
      alarmAudioRef.current.play().catch(() => {})
    }

    // Show browser notification
    if (settings.notificationEnabled && "Notification" in window && Notification.permission === "granted") {
      const modeText = mode === "focus" ? "Focus session" : "Break"
      new Notification("Focus Timer", {
        body: `${modeText} completed! Time for a ${mode === "focus" ? "break" : "focus session"}.`,
        icon: "/classic-kitchen-timer.png",
        tag: "focus-timer",
      })
    }

    if (mode === "focus") {
      const newSessionsCompleted = sessionsCompleted + 1
      setSessionsCompleted(newSessionsCompleted)
      const newCycleSession = (currentCycleSession + 1) % settings.sessionsUntilLongBreak // Update cycle session tracking
      setCurrentCycleSession(newCycleSession)

      if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        switchMode("long-break", settings.autoStartBreaks)
      } else {
        switchMode("short-break", settings.autoStartBreaks)
      }
    } else {
      switchMode("focus", settings.autoStartPomodoros)
    }
  }

  const skipToNextPhase = () => {
    setStatus("idle")

    if (mode === "focus") {
      const newSessionsCompleted = sessionsCompleted + 1
      setSessionsCompleted(newSessionsCompleted)
      const newCycleSession = (currentCycleSession + 1) % settings.sessionsUntilLongBreak // Update cycle session tracking when skipping
      setCurrentCycleSession(newCycleSession)

      if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
        switchMode("long-break", false)
      } else {
        switchMode("short-break", false)
      }
    } else {
      switchMode("focus", false)
    }
  }

  const switchMode = (newMode: TimerMode, autoStart = false) => {
    setMode(newMode)
    let duration: number
    switch (newMode) {
      case "focus":
        duration = settings.focusDuration * 60
        break
      case "short-break":
        duration = settings.shortBreakDuration * 60
        break
      case "long-break":
        duration = settings.longBreakDuration * 60
        break
    }
    setTimeLeft(duration)
    setTotalTime(duration)
    setStatus(autoStart ? "running" : "idle")
  }

  const toggleTimer = () => {
    if (status === "running") {
      setStatus("paused")
    } else {
      setStatus("running")
    }
  }

  const resetTimer = () => {
    setStatus("idle")
    const duration =
      mode === "focus"
        ? settings.focusDuration * 60
        : mode === "short-break"
          ? settings.shortBreakDuration * 60
          : settings.longBreakDuration * 60
    setTimeLeft(duration)
    setTotalTime(duration)
    setCurrentCycleSession(0)
  }

  const applySettings = () => {
    setSettings(tempSettings)
    const duration =
      mode === "focus"
        ? tempSettings.focusDuration * 60
        : mode === "short-break"
          ? tempSettings.shortBreakDuration * 60
          : tempSettings.longBreakDuration * 60
    setTimeLeft(duration)
    setTotalTime(duration)
    setStatus("idle")
    setSettingsOpen(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getModeConfig = (m: TimerMode) => {
    switch (m) {
      case "focus":
        return {
          label: "Focus Time",
          icon: Brain,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        }
      case "short-break":
        return {
          label: "Short Break",
          icon: Coffee,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        }
      case "long-break":
        return {
          label: "Long Break",
          icon: Zap,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        }
    }
  }

  const addTask = () => {
    if (newTaskTitle.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      projectId: selectedProject,
      estimatedSessions: newTaskEstimatedSessions,
      sessionsSpent: 0,
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
    setNewTaskEstimatedSessions(1)
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
    if (activeTaskId === taskId && tasks.find((task) => task.id === taskId)?.completed) {
      setActiveTaskId(null)
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    if (activeTaskId === taskId) {
      setActiveTaskId(null)
    }
  }

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTaskTitle(task.title)
    setEditingEstimatedSessions(task.estimatedSessions)
  }

  const saveEditingTask = () => {
    if (editingTaskTitle.trim() === "") return
    setTasks(
      tasks.map((task) =>
        task.id === editingTaskId
          ? { ...task, title: editingTaskTitle, estimatedSessions: editingEstimatedSessions }
          : task,
      ),
    )
    setEditingTaskId(null)
    setEditingTaskTitle("")
    setEditingEstimatedSessions(1)
  }

  const cancelEditingTask = () => {
    setEditingTaskId(null)
    setEditingTaskTitle("")
    setEditingEstimatedSessions(1)
  }

  const clearCompletedTasks = () => {
    setTasks(tasks.filter((task) => !task.completed))
  }

  const clearAllTasks = () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
      setTasks([])
      setActiveTaskId(null) // Also clear active task when all are deleted
    }
  }

  const setActiveTask = (taskId: string) => {
    if (activeTaskId === taskId) {
      // If clicking the same task, unset it and pause timer
      setActiveTaskId(null)
      setStatus("idle")
    } else {
      setActiveTaskId(taskId)
      // Switch to focus mode if not already
      if (mode !== "focus") {
        switchMode("focus", true) // Auto-start
      } else {
        // If already in focus mode, just start the timer
        setStatus("running")
      }
    }
  }

  const moveTaskUp = (taskId: string) => {
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index > 0) {
      const newTasks = [...tasks]
      ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
      setTasks(newTasks)
    }
  }

  const moveTaskDown = (taskId: string) => {
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index < tasks.length - 1 && index !== -1) {
      const newTasks = [...tasks]
      ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
      setTasks(newTasks)
    }
  }

  // Added drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    if (draggedTaskId === null || draggedTaskId === taskId) return

    const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId)
    const targetIndex = tasks.findIndex((t) => t.id === taskId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newTasks = [...tasks]
    const [draggedTask] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(targetIndex, 0, draggedTask)
    setTasks(newTasks)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const taskElement = element?.closest("[data-task-id]")
    if (taskElement) {
      const taskId = taskElement.getAttribute("data-task-id")
      if (taskId && draggedTaskId && taskId !== draggedTaskId) {
        const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId)
        const targetIndex = tasks.findIndex((t) => t.id === taskId)

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const newTasks = [...tasks]
          const [draggedTask] = newTasks.splice(draggedIndex, 1)
          newTasks.splice(targetIndex, 0, draggedTask)
          setTasks(newTasks)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    setDraggedTaskId(null)
  }

  const addProject = () => {
    if (newProjectName.trim() === "") return

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
    }

    setProjects([...projects, newProject])
    setSelectedProject(newProject.id)
    setNewProjectName("")
    setShowNewProjectDialog(false)
  }

  const deleteProject = (projectId: string) => {
    if (projectId === "default") return // Prevent deleting the default project
    setProjects(projects.filter((project) => project.id !== projectId))
    setTasks(tasks.filter((task) => task.projectId !== projectId)) // Remove tasks associated with the deleted project
    if (selectedProject === projectId) {
      setSelectedProject("default") // Reset selected project if it was the deleted one
    }
    if (filterProject === projectId) {
      setFilterProject("all") // Reset filter if it was the deleted project
    }
  }

  const getFilteredTasks = () => {
    if (filterProject === "all") return tasks
    return tasks.filter((task) => task.projectId === filterProject)
  }

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || "General"
  }

  const getTaskStats = () => {
    const filteredTasks = getFilteredTasks()
    const completed = filteredTasks.filter((t) => t.completed).length
    const total = filteredTasks.length
    return { completed, total }
  }

  const getActiveTask = () => {
    return tasks.find((task) => task.id === activeTaskId)
  }

  const openInPopup = () => {
    if (!isClient) return // Prevent SSR issues

    // Encode current state in URL parameters
    const params = new URLSearchParams({
      popup: "true",
      mode,
      timeLeft: timeLeft.toString(),
      totalTime: totalTime.toString(),
      status,
      activeTaskId: activeTaskId || "",
      sessionsCompleted: sessionsCompleted.toString(),
      currentCycleSession: currentCycleSession.toString(),
    })

    const width = 400
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    window.open(
      `${window.location.pathname}?${params.toString()}`,
      "FocusTimer",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    )
  }

  const currentModeConfig = getModeConfig(mode)
  const ModeIcon = currentModeConfig.icon
  const taskStats = getTaskStats()
  const activeTask = getActiveTask()

  if (isPopupMode) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg">
          <div className="flex flex-col gap-6">
            <Tabs value={mode} onValueChange={(v) => switchMode(v as TimerMode)}>
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-12">
                <TabsTrigger value="focus" className="data-[state=active]:bg-blue-500/20 text-xs sm:text-sm">
                  <Brain className="h-4 w-4 mr-1 sm:mr-2" />
                  Focus
                </TabsTrigger>
                <TabsTrigger value="short-break" className="data-[state=active]:bg-green-500/20 text-xs sm:text-sm">
                  <Coffee className="h-4 w-4 mr-1 sm:mr-2" />
                  Short
                </TabsTrigger>
                <TabsTrigger value="long-break" className="data-[state=active]:bg-purple-500/20 text-xs sm:text-sm">
                  <Zap className="h-4 w-4 mr-1 sm:mr-2" />
                  Long
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTask && mode === "focus" && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Working On</p>
                <p className="text-sm font-semibold text-foreground truncate">{activeTask.title}</p>
              </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-6">
              <div className={`rounded-full p-4 ${currentModeConfig.bgColor}`}>
                <ModeIcon className={`h-8 w-8 ${currentModeConfig.color}`} />
              </div>

              <div className="text-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">{currentModeConfig.label}</h2>
                <div className="text-6xl font-bold tracking-tight font-mono tabular-nums">{formatTime(timeLeft)}</div>
              </div>

              <div className="w-full space-y-2">
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className="h-16 w-16 rounded-full"
                  variant={status === "running" ? "secondary" : "default"}
                >
                  {status === "running" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetTimer}
                  className="h-16 w-16 rounded-full bg-transparent"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={skipToNextPhase}
                  className="h-16 w-16 rounded-full bg-transparent"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                <p className="text-2xl font-bold">{sessionsCompleted}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Cycle</p>
                <p className="text-2xl font-bold">
                  {currentCycleSession + 1}/{settings.sessionsUntilLongBreak}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <Card className="p-4 sm:p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl w-full overflow-hidden">
      <div className="mb-6">
        <div className="bg-blue-200 dark:bg-blue-900/40 p-3 sm:p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 flex items-center justify-between">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <div className="rounded-full p-2 bg-blue-500 text-white flex-shrink-0">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-blue-950 dark:text-white">
                Focus Timer
              </h2>
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                Stay focused with customizable intervals and track your tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-muted/30 h-12">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="font-medium text-sm sm:text-base">What is the Focus Timer Technique?</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${infoOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/30 rounded-lg p-4 border border-border/40 space-y-3 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold mb-1 text-foreground">The Pomodoro Technique</h3>
                <p className="text-muted-foreground">
                  This timer uses the Pomodoro Technique, a time management method developed by Francesco Cirillo in the
                  late 1980s. It breaks work into focused intervals separated by short breaks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">How It Works</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">25 minutes of focus:</strong> Long enough to make progress,
                    short enough to maintain concentration without mental fatigue
                  </li>
                  <li>
                    <strong className="text-foreground">5 minute short break:</strong> Brief rest to recharge while
                    keeping you in the flow state
                  </li>
                  <li>
                    <strong className="text-foreground">15 minute long break:</strong> After 4 focus sessions, take a
                    longer break to fully recover and prevent burnout
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Why These Intervals?</h3>
                <p className="text-muted-foreground">
                  Research shows that 25 minutes is optimal for maintaining peak concentration. The brain can sustain
                  intense focus for about 20-30 minutes before needing rest. Short breaks prevent mental fatigue, while
                  longer breaks after multiple sessions help consolidate learning and restore energy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Improves focus and concentration</li>
                  <li>Reduces mental fatigue and burnout</li>
                  <li>Increases productivity and task completion</li>
                  <li>Helps estimate effort for tasks</li>
                  <li>Creates a sustainable work rhythm</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs value={mode} onValueChange={(v) => switchMode(v as TimerMode)}>
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-12 sm:h-10">
            <TabsTrigger value="focus" className="data-[state=active]:bg-blue-500/20 text-xs sm:text-sm">
              <Brain className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Focus</span>
              <span className="sm:hidden">Focus</span>
            </TabsTrigger>
            <TabsTrigger value="short-break" className="data-[state=active]:bg-green-500/20 text-xs sm:text-sm">
              <Coffee className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Short Break</span>
              <span className="sm:hidden">Short</span>
            </TabsTrigger>
            <TabsTrigger value="long-break" className="data-[state=active]:bg-purple-500/20 text-xs sm:text-sm">
              <Zap className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Long Break</span>
              <span className="sm:hidden">Long</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTask && mode === "focus" && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-blue-500 text-white">
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Currently Working On</p>
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">{activeTask.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {activeTask.sessionsSpent}/{activeTask.estimatedSessions} sessions
                    </span>
                  </div>
                  <Progress
                    value={(activeTask.sessionsSpent / activeTask.estimatedSessions) * 100}
                    className="h-1.5 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          <div className={`rounded-full p-4 sm:p-6 ${currentModeConfig.bgColor} transition-all duration-300`}>
            <ModeIcon className={`h-10 w-10 sm:h-12 sm:w-12 ${currentModeConfig.color}`} />
          </div>

          <div className="text-center">
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground mb-2">
              {currentModeConfig.label}
            </h2>
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-mono tabular-nums">
              {formatTime(timeLeft)}
            </div>
            {mode === "focus" && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Session {currentCycleSession + 1}/{settings.sessionsUntilLongBreak}
              </p>
            )}
          </div>

          <div className="w-full max-w-md space-y-2 px-2 sm:px-0">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>{formatTime(totalTime - timeLeft)} elapsed</span>
              <span>{formatTime(timeLeft)} remaining</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center px-2 sm:px-0">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="h-16 w-16 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              variant={status === "running" ? "secondary" : "default"}
            >
              {status === "running" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              className="h-16 w-16 rounded-full bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={skipToNextPhase}
              className="h-16 w-16 rounded-full bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={openInPopup}
              className="h-16 w-16 rounded-full bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
              title="Open in popup window"
            >
              <ExternalLink className="h-6 w-6" />
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full bg-transparent transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={() => setTempSettings(settings)}
                >
                  <Settings2 className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                  <DialogDescription>Customize your focus timer experience.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Timer (minutes)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="focus">Focus Session</Label>
                        <Input
                          id="focus"
                          type="number"
                          min="1"
                          max="120"
                          value={tempSettings.focusDuration}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              focusDuration: Number.parseInt(e.target.value) || 25,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="short-break">Short Break</Label>
                        <Input
                          id="short-break"
                          type="number"
                          min="1"
                          max="60"
                          value={tempSettings.shortBreakDuration}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              shortBreakDuration: Number.parseInt(e.target.value) || 5,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="long-break">Long Break</Label>
                        <Input
                          id="long-break"
                          type="number"
                          min="1"
                          max="60"
                          value={tempSettings.longBreakDuration}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              longBreakDuration: Number.parseInt(e.target.value) || 15,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Auto Start</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-breaks">Auto Start Breaks</Label>
                        <Switch
                          id="auto-breaks"
                          checked={tempSettings.autoStartBreaks}
                          onCheckedChange={(checked) => setTempSettings({ ...tempSettings, autoStartBreaks: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-pomodoros">Auto Start Focus Sessions</Label>
                        <Switch
                          id="auto-pomodoros"
                          checked={tempSettings.autoStartPomodoros}
                          onCheckedChange={(checked) =>
                            setTempSettings({ ...tempSettings, autoStartPomodoros: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sessions">Long Break interval</Label>
                        <Input
                          id="sessions"
                          type="number"
                          min="1"
                          max="10"
                          value={tempSettings.sessionsUntilLongBreak}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              sessionsUntilLongBreak: Number.parseInt(e.target.value) || 4,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Sound</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Alarm Sound</Label>
                          <span className="text-sm text-muted-foreground">{tempSettings.alarmVolume}</span>
                        </div>
                        <Slider
                          value={[tempSettings.alarmVolume]}
                          onValueChange={([value]) => setTempSettings({ ...tempSettings, alarmVolume: value })}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="alarm-repeat">Repeat</Label>
                        <Input
                          id="alarm-repeat"
                          type="number"
                          min="1"
                          max="5"
                          value={tempSettings.alarmRepeat}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              alarmRepeat: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Ticking Sound</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{tempSettings.tickingVolume}</span>
                            <Switch
                              checked={tempSettings.tickingEnabled}
                              onCheckedChange={(checked) =>
                                setTempSettings({ ...tempSettings, tickingEnabled: checked })
                              }
                            />
                          </div>
                        </div>
                        <Slider
                          value={[tempSettings.tickingVolume]}
                          onValueChange={([value]) => setTempSettings({ ...tempSettings, tickingVolume: value })}
                          max={100}
                          step={1}
                          className="w-full"
                          disabled={!tempSettings.tickingEnabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Theme</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode-running">Dark Mode when running</Label>
                      <Switch
                        id="dark-mode-running"
                        checked={tempSettings.darkModeWhenRunning}
                        onCheckedChange={(checked) =>
                          setTempSettings({ ...tempSettings, darkModeWhenRunning: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Notification</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="notifications">Browser Notifications</Label>
                      </div>
                      <Switch
                        id="notifications"
                        checked={tempSettings.notificationEnabled}
                        onCheckedChange={(checked) =>
                          setTempSettings({ ...tempSettings, notificationEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={applySettings} className="w-full">
                    Apply Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex border-b">
            <div className="px-3 sm:px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Session Statistics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full p-2 bg-blue-500/10">
                  <Timer className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Sessions Today</h3>
              </div>
              <p className="text-3xl font-bold">{sessionsCompleted}</p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full p-2 bg-green-500/10">
                  <Brain className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Focus Time</h3>
              </div>
              <p className="text-3xl font-bold">
                {Math.floor((sessionsCompleted * settings.focusDuration) / 60)}h{" "}
                {(sessionsCompleted * settings.focusDuration) % 60}m
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full p-2 bg-purple-500/10">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Tasks Completed</h3>
              </div>
              <p className="text-3xl font-bold">
                {taskStats.completed}/{taskStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex border-b">
            <div className="px-3 sm:px-4 py-2 font-medium text-sm border-b-2 border-primary text-primary flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Tasks</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={filterProject === "all" ? "default" : "outline"}
              className="cursor-pointer h-8 px-2 sm:px-3 text-xs"
              onClick={() => setFilterProject("all")}
            >
              All Projects
            </Badge>
            {projects.map((project) => (
              <Badge
                key={project.id}
                variant={filterProject === project.id ? "default" : "outline"}
                className="cursor-pointer h-8 px-2 sm:px-3 text-xs"
                onClick={() => setFilterProject(project.id)}
              >
                {project.name}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask()
                }}
                className="w-full h-12 sm:h-10"
              />
              <div className="flex gap-2">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="flex-1 h-12 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addTask} size="icon" className="h-12 w-12 sm:h-10 sm:w-10 flex-shrink-0">
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
                <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 sm:h-10 sm:w-10 bg-transparent flex-shrink-0"
                    >
                      <FolderPlus className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>Add a new project to organize your tasks.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          placeholder="Enter project name..."
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addProject()
                          }}
                        />
                      </div>
                      <Button onClick={addProject} className="w-full">
                        Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <Label htmlFor="new-task-sessions" className="text-xs text-muted-foreground whitespace-nowrap">
                Estimated Sessions:
              </Label>
              <Input
                id="new-task-sessions"
                type="number"
                min="1"
                max="20"
                value={newTaskEstimatedSessions}
                onChange={(e) => setNewTaskEstimatedSessions(Number.parseInt(e.target.value) || 1)}
                className="w-16 sm:w-20 h-10 sm:h-8"
              />
            </div>
          </div>

          {tasks.length > 0 && (
            <div className="flex flex-col gap-2">
              {/* CHANGE> Made buttons larger with better text sizing and removed size="sm" */}
              <Button
                variant="outline"
                onClick={clearCompletedTasks}
                className="w-full bg-transparent h-14 sm:h-12 text-base font-medium"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Clear Completed
              </Button>
              <Button
                variant="outline"
                onClick={clearAllTasks}
                className="w-full bg-transparent h-14 sm:h-12 text-base font-medium"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Clear All Tasks
              </Button>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto overflow-x-hidden">
            {getFilteredTasks().length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs mt-1">Add a task to start focusing</p>
              </div>
            ) : (
              <>
                {/* Active/Incomplete tasks */}
                {getFilteredTasks()
                  .filter((task) => !task.completed)
                  .map((task, index, arr) => (
                    <div
                      key={task.id}
                      data-task-id={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, task.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`group relative rounded-lg border-2 transition-all duration-200 cursor-move touch-none overflow-hidden ${
                        /* Added overflow-hidden to prevent content overflow */
                        task.id === activeTaskId
                          ? "border-blue-500 bg-blue-500/5 shadow-md"
                          : "border-border/40 bg-background hover:border-border/60 hover:shadow-sm"
                      } ${draggedTaskId === task.id ? "opacity-50" : ""}`}
                    >
                      {editingTaskId === task.id ? (
                        <div className="p-4 space-y-3">
                          <Input
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditingTask()
                              if (e.key === "Escape") cancelEditingTask()
                            }}
                            placeholder="Task title..."
                            autoFocus
                            className="h-12 sm:h-10"
                          />
                          <div className="flex items-center gap-2">
                            <Label htmlFor="edit-sessions" className="text-xs">
                              Estimated Sessions:
                            </Label>
                            <Input
                              id="edit-sessions"
                              type="number"
                              min="1"
                              max="20"
                              value={editingEstimatedSessions}
                              onChange={(e) => setEditingEstimatedSessions(Number.parseInt(e.target.value) || 1)}
                              className="w-20 h-10 sm:h-8"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={saveEditingTask}
                              className="flex-1 h-10 sm:h-9"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingTask}
                              className="flex-1 bg-transparent h-10 sm:h-9"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-4">
                          {/* Mobile layout - stacked vertically */}
                          <div className="flex sm:hidden flex-col gap-3">
                            {/* Top row: drag handle, checkbox, and task info */}
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95 p-1"
                              >
                                <Circle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground mb-1 leading-tight text-sm break-words">
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Folder className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate max-w-[100px]">{getProjectName(task.projectId)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                                    <span>
                                      {task.sessionsSpent}/{task.estimatedSessions}
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={(task.sessionsSpent / task.estimatedSessions) * 100}
                                  className="h-1.5"
                                />
                              </div>
                            </div>
                            {/* Bottom row: action buttons */}
                            <div className="flex items-center gap-2 pl-8">
                              {task.id === activeTaskId ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setActiveTask(task.id)}
                                  className="flex-1 h-11 text-sm"
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Stop
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setActiveTask(task.id)}
                                  className="flex-1 h-11 text-sm"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingTask(task)}
                                className="h-11 w-11 flex-shrink-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task.id)}
                                className="h-11 w-11 flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Desktop layout - horizontal */}
                          <div className="hidden sm:flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95 p-1"
                            >
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground mb-1 leading-tight text-base break-words">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Folder className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate max-w-[100px]">{getProjectName(task.projectId)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 flex-shrink-0" />
                                  <span>
                                    {task.sessionsSpent}/{task.estimatedSessions}
                                  </span>
                                </div>
                              </div>
                              <Progress value={(task.sessionsSpent / task.estimatedSessions) * 100} className="h-1.5" />
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveTaskUp(task.id)}
                                  disabled={index === 0}
                                  className="h-5 w-5 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveTaskDown(task.id)}
                                  disabled={index === arr.length - 1}
                                  className="h-5 w-5 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              {task.id === activeTaskId ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setActiveTask(task.id)}
                                  className="h-8 text-xs px-3 whitespace-nowrap"
                                >
                                  <Pause className="h-3 w-3 mr-1" />
                                  Stop
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setActiveTask(task.id)}
                                  className="h-8 text-xs px-3 whitespace-nowrap"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingTask(task)}
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task.id)}
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Completed tasks - shown with reduced opacity */}
                {getFilteredTasks().filter((task) => task.completed).length > 0 && (
                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground px-2">Completed</p>
                    {getFilteredTasks()
                      .filter((task) => task.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="group flex items-center gap-2 sm:gap-3 p-3 rounded-lg border border-border/30 bg-muted/20 opacity-60 hover:opacity-100 transition-all overflow-hidden"
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95 p-1"
                          >
                            <CheckCircle className="h-6 w-6 sm:h-5 sm:w-5 text-green-500" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-through text-muted-foreground break-words">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              <Folder className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{getProjectName(task.projectId)}</span>
                              <span className="text-xs">•</span>
                              <span>{task.sessionsSpent} sessions</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="h-10 w-10 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {projects.length > 1 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Manage Projects</p>
              <div className="space-y-2">
                {projects
                  .filter((p) => p.id !== "default")
                  .map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md border border-border/40 gap-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{project.name}</span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {tasks.filter((t) => t.projectId === project.id).length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProject(project.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
