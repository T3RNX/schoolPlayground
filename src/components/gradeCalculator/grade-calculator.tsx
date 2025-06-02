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
  HelpCircle,
  Check,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  roundingMethods,
  calculateStepwiseGrade,
  defaultFormula,
  type Step,
  type CustomGradeSettings,
} from "@/components/gradeCalculator/gradeUtils"

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
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    formula: defaultFormula,
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    formula: defaultFormula,
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

  const [showExtendedMode, setShowExtendedMode] = useState(false)
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

    const passGrade = system === "custom" ? Number(customPass) : selectedSystem.pass

    if (system === "germany") {
      return grade <= passGrade ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
    } else {
      return grade >= passGrade ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
    }
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
          <div className="bg-pink-200 dark:bg-pink-900/40 p-4 rounded-lg border-2 border-pink-300 dark:border-pink-600 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-pink-500 text-white self-center">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-pink-950 dark:text-white">Grade Calculator</h2>
                <p className="text-sm text-pink-900 dark:text-pink-100">
                  Calculate grades from points or compute weighted averages with advanced grading options.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <Label htmlFor="grading-system" className="text-sm flex items-center gap-1">
              Grading System
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Select the grading system that matches your school or institution.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <select
              id="grading-system"
              value={system}
              onChange={(e) => handleSystemChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-muted/70 dark:bg-muted/80 px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="switzerland">Switzerland</option>
              <option value="germany">Germany</option>
              <option value="usa">USA</option>
              <option value="custom">Custom</option>
            </select>

            <div className="text-sm text-muted-foreground mt-1 p-2 bg-muted/30 rounded-md w-full">
              {system === "switzerland" && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>In Switzerland, grades range from 1 to 6, with 6 being the best. 4 is the passing grade.</span>
                </div>
              )}
              {system === "germany" && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>In Germany, grades range from 1 to 6, with 1 being the best. 4 is the passing grade.</span>
                </div>
              )}
              {system === "usa" && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>
                    In the USA, grades typically range from 0 to 100, with 60% or higher being a passing grade.
                  </span>
                </div>
              )}
              {system === "custom" && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Custom grading system. Define your own grade range and passing threshold in Advanced Settings.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center hover:bg-muted/50 transition-colors"
            onClick={() => setShowExtendedMode(!showExtendedMode)}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Advanced Settings</span>
            </div>
            {showExtendedMode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showExtendedMode && (
          <div className="mb-6 p-4 bg-muted/30 border-2 border-muted-foreground/20 dark:border-muted-foreground/30 rounded-lg space-y-4">
            <h3 className="font-medium text-sm mb-2">Advanced Grading Options</h3>

            {system === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom-min" className="mb-2 block items-center gap-1">
                    Minimum Grade
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The lowest possible grade in your system</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="custom-min"
                    type="number"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    placeholder="Minimum grade"
                    className="bg-muted/70 dark:bg-muted/80"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-max" className="mb-2 block items-center gap-1">
                    Maximum Grade
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The highest possible grade in your system</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="custom-max"
                    type="number"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    placeholder="Maximum grade"
                    className="bg-muted/70 dark:bg-muted/80"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-pass" className="mb-2 block items-center gap-1">
                    Passing Grade
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The minimum grade required to pass</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="custom-pass"
                    type="number"
                    value={customPass}
                    onChange={(e) => setCustomPass(e.target.value)}
                    placeholder="Passing grade"
                    className="bg-muted/70 dark:bg-muted/80"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rounding-method" className="mb-2 block items-center gap-1">
                  Rounding Method
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How the final grade should be rounded</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <select
                  id="rounding-method"
                  value={roundingMethod}
                  onChange={(e) => setRoundingMethod(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-muted/70 dark:bg-muted/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {Object.entries(roundingMethods).map(([key, method]) => (
                    <option key={key} value={key}>
                      {method.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {roundingMethods[roundingMethod as keyof typeof roundingMethods].description}
                </p>
              </div>

              {roundingMethod === "stepRounding" ? (
                <div>
                  <Label htmlFor="rounding-step" className="mb-2 block items-center gap-1">
                    Rounding Step
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Round to the nearest increment (e.g., 0.5, 0.25)</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <select
                    id="rounding-step"
                    value={roundingStep.toString()}
                    onChange={(e) => setRoundingStep(Number(e.target.value))}
                    className="w-full h-10 rounded-md border border-input bg-muted/70 dark:bg-muted/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="1">1.0</option>
                    <option value="0.5">0.5</option>
                    <option value="0.25">0.25</option>
                    <option value="0.2">0.2</option>
                    <option value="0.1">0.1</option>
                    <option value="0.05">0.05</option>
                    <option value="0.01">0.01</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Round to the nearest {roundingStep} increment</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="rounding-precision" className="mb-2 block items-center gap-1">
                    Decimal Places
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of decimal places to show in the result</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="rounding-precision"
                    type="number"
                    min="0"
                    max="5"
                    value={roundingPrecision}
                    onChange={(e) => setRoundingPrecision(Number(e.target.value))}
                    placeholder="Decimal places"
                    className="bg-muted/70 dark:bg-muted/80"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="grading-method" className="mb-2 flex items-center gap-1">
                Grading Method
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How points are converted to grades</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <select
                id="grading-method"
                value={gradingMethod}
                onChange={(e) => setGradingMethod(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-muted/70 dark:bg-muted/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(gradingMethods).map(([key, method]) => (
                  <option key={key} value={key}>
                    {method.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {gradingMethods[gradingMethod as keyof typeof gradingMethods].description}
              </p>
            </div>

            {gradingMethod === "custom" && (
              <div>
                <Label htmlFor="custom-formula" className="mb-2 flex items-center gap-1">
                  Custom Formula
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create your own formula to calculate grades</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="custom-formula"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="e.g., 5 * (achieved / maximum) + 1"
                  className="bg-muted/70 dark:bg-muted/80"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Available variables: &apos;achieved&apos;, &apos;maximum&apos;, &apos;min&apos;, and &apos;max&apos;
                </p>
              </div>
            )}

            {gradingMethod === "stepwise" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium flex items-center gap-1">
                    Grade Steps
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Define grade thresholds based on percentage of points achieved</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Button variant="outline" size="sm" onClick={addStep} className="h-7 px-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add Step
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                    <div className="col-span-5">Percentage ≤</div>
                    <div className="col-span-5">Grade</div>
                    <div className="col-span-2"></div>
                  </div>

                  {steps.map((step) => (
                    <div key={step.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={step.threshold}
                          onChange={(e) => updateStep(step.id, "threshold", Number(e.target.value))}
                          className="h-8 text-sm bg-muted/70 dark:bg-muted/80"
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
                          className="h-8 text-sm bg-muted/70 dark:bg-muted/80"
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

                <p className="text-xs text-muted-foreground mt-1">
                  Define grade thresholds based on percentage of points achieved
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "points"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              }`}
              onClick={() => {
                setActiveTab("points")
                setError(null)
              }}
            >
              Calculate from Points
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "average"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              }`}
              onClick={() => {
                setActiveTab("average")
                setError(null)
              }}
            >
              Calculate Average Grade
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {activeTab === "points" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maximum-points" className="mb-2 block items-center gap-1">
                  Maximum Points
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The total number of points possible</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="maximum-points"
                  type="number"
                  min="0"
                  step="0.5"
                  value={maximumPoints}
                  onChange={(e) => setMaximumPoints(e.target.value)}
                  placeholder="Enter maximum points"
                  className="bg-muted/70 dark:bg-muted/80"
                />
              </div>
              <div>
                <Label htmlFor="achieved-points" className="mb-2 block items-center gap-1">
                  Achieved Points
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The number of points you earned</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="achieved-points"
                  type="number"
                  min="0"
                  step="0.5"
                  value={achievedPoints}
                  onChange={(e) => setAchievedPoints(e.target.value)}
                  placeholder="Enter achieved points"
                  className="bg-muted/70 dark:bg-muted/80"
                />
              </div>
            </div>

            <Button
              onClick={calculateGrade}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
              disabled={!maximumPoints || !achievedPoints}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Grade
            </Button>

            {calculatedGrade !== null && (
              <div className="mt-6 p-4 bg-muted/50 border-2 border-muted-foreground/20 dark:border-muted-foreground/30 rounded-lg text-center">
                <p className="text-sm font-medium mb-2">Your grade is:</p>
                <p className={`text-3xl font-bold ${getGradeColor(calculatedGrade)}`}>
                  {typeof calculatedGrade === "number" ? calculatedGrade.toFixed(roundingPrecision) : calculatedGrade}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {calculatedGrade >= selectedSystem.pass ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <p className="text-sm text-muted-foreground">{getPassingMessage(calculatedGrade)}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {gradeEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-end gap-2 p-3 bg-muted/20 rounded-md">
                  <div className="flex-1">
                    <Label htmlFor={`grade-${entry.id}`} className="mb-2 block items-center gap-1">
                      Grade {index + 1}
                      {index === 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter your grade for this course/assignment</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Label>
                    <Input
                      id={`grade-${entry.id}`}
                      type="number"
                      min={selectedSystem.min}
                      max={selectedSystem.max}
                      step="0.1"
                      value={entry.grade}
                      onChange={(e) => updateGradeEntry(entry.id, "grade", e.target.value)}
                      placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
                      className="bg-muted/70 dark:bg-muted/80"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`weight-${entry.id}`} className="mb-2 block items-center gap-1">
                      Weight
                      {index === 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>How important this grade is in the average (e.g., 2 = counts twice)</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Label>
                    <Input
                      id={`weight-${entry.id}`}
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={entry.weight}
                      onChange={(e) => updateGradeEntry(entry.id, "weight", e.target.value)}
                      placeholder="Weight"
                      className="bg-muted/70 dark:bg-muted/80"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGradeEntry(entry.id)}
                    disabled={gradeEntries.length <= 1}
                    className="mb-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Remove this grade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={addGradeEntry}
                className="flex items-center gap-1 hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Grade
              </Button>
              <Button
                onClick={calculateAverage}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white transition-colors"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Average
              </Button>
            </div>

            {averageGrade !== null && (
              <div className="mt-6 p-4 bg-muted/50 border-2 border-muted-foreground/20 dark:border-muted-foreground/30 rounded-lg text-center">
                <p className="text-sm font-medium mb-2">Your average grade is:</p>
                <p className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}>
                  {typeof averageGrade === "number" ? averageGrade.toFixed(roundingPrecision) : averageGrade}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {averageGrade >= selectedSystem.pass ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <p className="text-sm text-muted-foreground">{getPassingMessage(averageGrade)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
