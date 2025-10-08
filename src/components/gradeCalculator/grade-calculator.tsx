"use client"

import { useState } from "react"
import {
  Calculator,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  roundingMethods,
  calculateStepwiseGrade,
  defaultFormula,
  type Step,
  type CustomGradeSettings,
} from "@/components/gradeCalculator/gradeUtils"
import { getGradeQualityColor } from "@/lib/grade-colors"

const gradingMethods = {
  linear: {
    name: "Linear",
    description: "Grade changes proportionally with points",
  },
  stepwise: {
    name: "Stepwise",
    description: "Grade changes in defined steps",
  },
  custom: {
    name: "Custom Formula",
    description: "Use your own formula",
  },
}

const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    formula: defaultFormula,
    description: "Grades from 1-6 (6 is best, 4 to pass)",
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    formula: defaultFormula,
    description: "Grades from 1-6 (1 is best, 4 to pass)",
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    formula: defaultFormula,
    description: "Percentage from 0-100 (60% to pass)",
  },
  custom: {
    name: "Custom",
    min: 0,
    max: 10,
    pass: 5,
    formula: (achieved: number, maximum: number, method: string, customSettings: CustomGradeSettings) => {
      if (method === "stepwise" && customSettings?.steps?.length > 0) {
        return calculateStepwiseGrade(achieved, maximum, customSettings.steps, customSettings.min, customSettings.max)
      } else if (method === "custom" && customSettings?.formula) {
        try {
          return defaultFormula(achieved, maximum, method, customSettings)
        } catch (e) {
          console.error("Error evaluating custom formula:", e)
          return customSettings.min || 0
        }
      }
      const min = customSettings?.min ?? 0
      const max = customSettings?.max ?? 10
      return min + (achieved / maximum) * (max - min)
    },
    description: "Define your own grading system",
  },
}

type GradeEntry = {
  id: string
  grade: string
  weight: string
}

export function GradeCalculator() {
  const [roundingStep, setRoundingStep] = useState<number>(0.1)
  const [activeTab, setActiveTab] = useState("points")
  const [system, setSystem] = useState("switzerland")
  const [maximumPoints, setMaximumPoints] = useState("")
  const [achievedPoints, setAchievedPoints] = useState("")
  const [calculatedGrade, setCalculatedGrade] = useState<number | null>(null)
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([
    { id: "1", grade: "", weight: "1" },
    { id: "2", grade: "", weight: "1" },
  ])
  const [averageGrade, setAverageGrade] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [roundingMethod, setRoundingMethod] = useState("nearest")
  const [roundingPrecision, setRoundingPrecision] = useState(2)
  const [gradingMethod, setGradingMethod] = useState("linear")
  const [customFormula, setCustomFormula] = useState("5 * (achieved / maximum) + 1")
  const [customMin, setCustomMin] = useState("0")
  const [customMax, setCustomMax] = useState("10")
  const [customPass, setCustomPass] = useState("5")
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", threshold: 50, grade: 4 },
    { id: "2", threshold: 60, grade: 4.5 },
    { id: "3", threshold: 70, grade: 5 },
    { id: "4", threshold: 80, grade: 5.5 },
    { id: "5", threshold: 90, grade: 6 },
  ])

  const calculateAverage = () => {
    setError(null)
    const validEntries = gradeEntries.filter((entry) => entry.grade.trim() !== "" && !isNaN(Number(entry.grade)))

    if (validEntries.length === 0) {
      setError("Please enter at least one valid grade")
      return
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const entry of validEntries) {
      const grade = Number(entry.grade)
      const weight = Number(entry.weight) || 1

      if (isNaN(grade) || grade < selectedSystem.min || grade > selectedSystem.max) {
        continue
      }

      weightedSum += grade * weight
      totalWeight += weight
    }

    if (totalWeight === 0) {
      setError("Total weight cannot be zero")
      return
    }

    const rawAverage = weightedSum / totalWeight

    let roundedAverage
    if (roundingMethod === "stepRounding") {
      roundedAverage = roundingMethods.stepRounding.function(rawAverage, roundingPrecision, roundingStep)
    } else {
      const roundingFunction = roundingMethods[roundingMethod as keyof typeof roundingMethods].function
      roundedAverage = roundingFunction(rawAverage, roundingPrecision)
    }

    setAverageGrade(roundedAverage)
  }

  const getSelectedSystem = () => {
    const baseSystem = gradingSystems[system as keyof typeof gradingSystems]

    if (system === "custom") {
      return {
        ...baseSystem,
        min: Number(customMin),
        max: Number(customMax),
        pass: Number(customPass),
      }
    }

    return baseSystem
  }

  const selectedSystem = getSelectedSystem()

  const calculateGrade = () => {
    setError(null)
    if (!maximumPoints || !achievedPoints) {
      setError("Please enter both maximum and achieved points")
      return
    }

    const max = Number.parseFloat(maximumPoints)
    const achieved = Number.parseFloat(achievedPoints)

    if (isNaN(max) || isNaN(achieved)) {
      setError("Please enter valid numbers")
      return
    }

    if (max <= 0) {
      setError("Maximum points must be greater than zero")
      return
    }

    if (achieved < 0) {
      setError("Achieved points cannot be negative")
      return
    }

    if (achieved > max) {
      setError("Achieved points cannot exceed maximum points")
      return
    }

    const customSettings = {
      min: selectedSystem.min,
      max: selectedSystem.max,
      pass: selectedSystem.pass,
      steps: steps,
      formula: customFormula,
    }

    if (system === "custom") {
      customSettings.min = Number(customMin)
      customSettings.max = Number(customMax)
      customSettings.pass = Number(customPass)
    }

    let rawGrade = selectedSystem.formula(achieved, max, gradingMethod, customSettings)
    rawGrade = Math.max(customSettings.min, Math.min(customSettings.max, rawGrade))

    let roundedGrade
    if (roundingMethod === "stepRounding") {
      roundedGrade = roundingMethods.stepRounding.function(rawGrade, roundingPrecision, roundingStep)
    } else {
      const roundingFunction = roundingMethods[roundingMethod as keyof typeof roundingMethods].function
      roundedGrade = roundingFunction(rawGrade, roundingPrecision)
    }

    setCalculatedGrade(roundedGrade)
  }

  const addGradeEntry = () => {
    setGradeEntries([...gradeEntries, { id: Date.now().toString(), grade: "", weight: "1" }])
  }

  const removeGradeEntry = (id: string) => {
    if (gradeEntries.length <= 1) return
    setGradeEntries(gradeEntries.filter((entry) => entry.id !== id))
  }

  const updateGradeEntry = (id: string, field: "grade" | "weight", value: string) => {
    setGradeEntries(gradeEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const addStep = () => {
    const lastStep = steps[steps.length - 1]
    const newThreshold = lastStep ? Math.min(lastStep.threshold + 10, 100) : 50
    const newGrade = lastStep ? Math.min(lastStep.grade + 0.5, Number(customMax) || 10) : 4

    setSteps([...steps, { id: Date.now().toString(), threshold: newThreshold, grade: newGrade }])
  }

  const removeStep = (id: string) => {
    if (steps.length <= 1) return
    setSteps(steps.filter((step) => step.id !== id))
  }

  const updateStep = (id: string, field: "threshold" | "grade", value: number) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)))
  }

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground"

    return getGradeQualityColor(grade, system)
  }

  const handleSystemChange = (newSystem: string) => {
    setSystem(newSystem)
    setCalculatedGrade(null)
    setAverageGrade(null)
    setError(null)

    if (newSystem !== "custom") {
      const system = gradingSystems[newSystem as keyof typeof gradingSystems]
      setCustomMin(system.min.toString())
      setCustomMax(system.max.toString())
      setCustomPass(system.pass.toString())

      const newSteps: Step[] = []
      const range = system.max - system.min
      const stepCount = 5

      for (let i = 0; i < stepCount; i++) {
        const percentage = 50 + i * 10
        const grade = system.min + range * (percentage / 100)
        newSteps.push({
          id: (i + 1).toString(),
          threshold: percentage,
          grade: Math.round(grade * 10) / 10,
        })
      }

      setSteps(newSteps)

      if (newSystem === "switzerland") {
        setCustomFormula("min + (achieved / maximum) * (max - min)")
        setGradingMethod("linear")
      } else if (newSystem === "germany") {
        setCustomFormula("max - (achieved / maximum) * (max - min)")
        setGradingMethod("linear")
      } else if (newSystem === "usa") {
        setCustomFormula("(achieved / maximum) * 100")
        setGradingMethod("linear")
      }
    }
  }

  const getPassingMessage = (grade: number | null) => {
    if (grade === null) return ""

    const passGrade = system === "custom" ? Number(customPass) : selectedSystem.pass
    const isPassing = system === "germany" ? grade <= passGrade : grade >= passGrade

    if (isPassing) {
      return "Congratulations! You passed."
    } else {
      const neededToPass =
        system === "germany" ? `You need ${passGrade} or lower to pass.` : `You need ${passGrade} or higher to pass.`
      return `You didn't pass. ${neededToPass} Keep studying!`
    }
  }

  return (
    <TooltipProvider>
      <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
        <div className="mb-6">
          <div className="bg-purple-200 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-purple-500 text-white self-center">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grade Calculator</h2>
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  Calculate grades from points or find your average grade
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/40">
          <Label htmlFor="grading-system" className="text-sm font-medium mb-2 block">
            Select Your Grading System
          </Label>
          <Select value={system} onValueChange={handleSystemChange}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select a grading system" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(gradingSystems).map(([key, sys]) => (
                <SelectItem key={key} value={key}>
                  {sys.name} - {sys.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg">
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "points"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveTab("points")
                setError(null)
              }}
            >
              Points → Grade
            </button>
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "average"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveTab("average")
                setError(null)
              }}
            >
              Average Grades
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {activeTab === "points" ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </div>
                <span>Enter your points</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                <div>
                  <Label htmlFor="maximum-points" className="mb-2 block">
                    Maximum Points
                  </Label>
                  <Input
                    id="maximum-points"
                    type="number"
                    min="0"
                    step="0.5"
                    value={maximumPoints}
                    onChange={(e) => setMaximumPoints(e.target.value)}
                    placeholder="e.g., 30"
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="achieved-points" className="mb-2 block">
                    Your Points
                  </Label>
                  <Input
                    id="achieved-points"
                    type="number"
                    min="0"
                    step="0.5"
                    value={achievedPoints}
                    onChange={(e) => setAchievedPoints(e.target.value)}
                    placeholder="e.g., 24"
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </div>
                <span>Calculate your grade</span>
              </div>

              <div className="pl-8">
                <Button
                  onClick={calculateGrade}
                  className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all shadow-md hover:shadow-lg"
                  disabled={!maximumPoints || !achievedPoints}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Grade
                </Button>
              </div>
            </div>

            {calculatedGrade !== null && (
              <div className="mt-6 p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/60 rounded-xl text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Your Result</span>
                </div>
                <div className={`text-5xl font-bold ${getGradeColor(calculatedGrade)}`}>
                  {typeof calculatedGrade === "number" ? calculatedGrade.toFixed(roundingPrecision) : calculatedGrade}
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {calculatedGrade >= selectedSystem.pass ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {getPassingMessage(calculatedGrade)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {getPassingMessage(calculatedGrade)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  {achievedPoints}/{maximumPoints} points (
                  {Math.round((Number(achievedPoints) / Number(maximumPoints)) * 100)}%)
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </div>
                <span>Enter your grades</span>
              </div>

              <div className="space-y-3 pl-8">
                {gradeEntries.map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min={selectedSystem.min}
                        max={selectedSystem.max}
                        step="0.1"
                        value={entry.grade}
                        onChange={(e) => updateGradeEntry(entry.id, "grade", e.target.value)}
                        placeholder={`Grade ${index + 1} (${selectedSystem.min}-${selectedSystem.max})`}
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={entry.weight}
                        onChange={(e) => updateGradeEntry(entry.id, "weight", e.target.value)}
                        placeholder="Weight"
                        className="h-11 text-base"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGradeEntry(entry.id)}
                      disabled={gradeEntries.length <= 1}
                      className="h-11 w-11 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pl-8">
                <Button variant="outline" onClick={addGradeEntry} className="w-full h-10 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" /> Add Another Grade
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </div>
                <span>Calculate average</span>
              </div>

              <div className="pl-8">
                <Button
                  onClick={calculateAverage}
                  className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all shadow-md hover:shadow-lg"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Average
                </Button>
              </div>
            </div>

            {averageGrade !== null && (
              <div className="mt-6 p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/60 rounded-xl text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Your Average</span>
                </div>
                <div className={`text-5xl font-bold ${getGradeColor(averageGrade)}`}>
                  {typeof averageGrade === "number" ? averageGrade.toFixed(roundingPrecision) : averageGrade}
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {averageGrade >= selectedSystem.pass ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {getPassingMessage(averageGrade)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {getPassingMessage(averageGrade)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border/40">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center text-muted-foreground hover:text-foreground"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Advanced Settings</span>
            </div>
            {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showAdvancedSettings && (
          <div className="mt-4 p-4 bg-muted/30 border border-border/40 rounded-lg space-y-4">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              These settings are for advanced users who need custom grading configurations
            </p>

            {system === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom-min" className="mb-2 block text-xs">
                    Minimum Grade
                  </Label>
                  <Input
                    id="custom-min"
                    type="number"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    placeholder="Minimum grade"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-max" className="mb-2 block text-xs">
                    Maximum Grade
                  </Label>
                  <Input
                    id="custom-max"
                    type="number"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    placeholder="Maximum grade"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-pass" className="mb-2 block text-xs">
                    Passing Grade
                  </Label>
                  <Input
                    id="custom-pass"
                    type="number"
                    value={customPass}
                    onChange={(e) => setCustomPass(e.target.value)}
                    placeholder="Passing grade"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rounding-method" className="mb-2 block text-xs">
                  Rounding Method
                </Label>
                <Select value={roundingMethod} onValueChange={setRoundingMethod}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roundingMethods).map(([key, method]) => (
                      <SelectItem key={key} value={key}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {roundingMethod === "stepRounding" ? (
                <div>
                  <Label htmlFor="rounding-step" className="mb-2 block text-xs">
                    Rounding Step
                  </Label>
                  <Select value={roundingStep.toString()} onValueChange={(value) => setRoundingStep(Number(value))}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1.0</SelectItem>
                      <SelectItem value="0.5">0.5</SelectItem>
                      <SelectItem value="0.25">0.25</SelectItem>
                      <SelectItem value="0.2">0.2</SelectItem>
                      <SelectItem value="0.1">0.1</SelectItem>
                      <SelectItem value="0.05">0.05</SelectItem>
                      <SelectItem value="0.01">0.01</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="rounding-precision" className="mb-2 block text-xs">
                    Decimal Places
                  </Label>
                  <Input
                    id="rounding-precision"
                    type="number"
                    min="0"
                    max="5"
                    value={roundingPrecision}
                    onChange={(e) => setRoundingPrecision(Number(e.target.value))}
                    placeholder="Decimal places"
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="grading-method" className="mb-2 block text-xs">
                Grading Method
              </Label>
              <Select value={gradingMethod} onValueChange={setGradingMethod}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(gradingMethods).map(([key, method]) => (
                    <SelectItem key={key} value={key}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {gradingMethod === "custom" && (
              <div>
                <Label htmlFor="custom-formula" className="mb-2 block text-xs">
                  Custom Formula
                </Label>
                <Input
                  id="custom-formula"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="e.g., 5 * (achieved / maximum) + 1"
                  className="h-9 text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Variables: achieved, maximum, min, max</p>
              </div>
            )}

            {gradingMethod === "stepwise" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Grade Steps</Label>
                  <Button variant="outline" size="sm" onClick={addStep} className="h-7 px-2 text-xs bg-transparent">
                    <Plus className="h-3 w-3 mr-1" /> Add Step
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {steps.map((step) => (
                    <div key={step.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={step.threshold}
                          onChange={(e) => updateStep(step.id, "threshold", Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="number"
                          min={system === "custom" ? Number(customMin) : selectedSystem.min}
                          max={system === "custom" ? Number(customMax) : selectedSystem.max}
                          step="0.1"
                          value={step.grade}
                          onChange={(e) => updateStep(step.id, "grade", Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          disabled={steps.length <= 1}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
