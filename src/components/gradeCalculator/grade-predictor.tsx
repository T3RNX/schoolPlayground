"use client"

import { useState } from "react"
import { Target, Calculator, TrendingUp, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getGradeQualityBadgeColor } from "@/lib/grade-colors"

const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
    description: "Higher is better (6 is best)",
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
    description: "Lower is better (1 is best)",
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    step: 1,
    description: "Higher is better (100 is best)",
  },
}

export function GradePredictor() {
  const [system, setSystem] = useState("switzerland")
  const [currentAverage, setCurrentAverage] = useState("4.5")
  const [targetAverage, setTargetAverage] = useState("5.0")
  const [completedTests, setCompletedTests] = useState("3")
  const [remainingTests, setRemainingTests] = useState("2")
  const [result, setResult] = useState<{
    requiredGrade: number
    isAchievable: boolean
    message: string
  } | null>(null)

  const selectedSystem = gradingSystems[system as keyof typeof gradingSystems]

  const validateInputs = (current: number, target: number, completed: number, remaining: number) => {
    if (Number.isNaN(current) || Number.isNaN(target) || Number.isNaN(completed) || Number.isNaN(remaining)) {
      return "Please enter valid numbers in all fields"
    }
    
    if (remaining <= 0) {
      return "You need at least 1 remaining test to calculate"
    }
    
    return null
  }

  const checkIfAchievable = (requiredGrade: number) => {
    return requiredGrade >= selectedSystem.min && requiredGrade <= selectedSystem.max
  }

  const getUnachievableMessage = (requiredGrade: number, target: number) => {
    const isGermany = system === "germany"
    const alreadyExceeded = isGermany 
      ? requiredGrade < selectedSystem.min 
      : requiredGrade > selectedSystem.max
    
    return alreadyExceeded
      ? `Great news! You've already exceeded your target average of ${target}!`
      : `Unfortunately, reaching an average of ${target} is not possible even with perfect scores.`
  }

  const getAchievableMessage = (requiredGrade: number, remaining: number) => {
    const isGermany = system === "germany"
    const isWithinPassThreshold = isGermany 
      ? requiredGrade <= selectedSystem.pass 
      : requiredGrade >= selectedSystem.pass
    
    const gradeText = `You need an average of ${requiredGrade.toFixed(2)} on your remaining ${remaining} test(s).`
    
    if (isWithinPassThreshold) {
      return `${gradeText} This is achievable!`
    }
    
    return isGermany 
      ? `${gradeText} This will be challenging.`
      : `${gradeText} This should be manageable!`
  }

  const calculateRequiredGrade = () => {
    const current = Number.parseFloat(currentAverage)
    const target = Number.parseFloat(targetAverage)
    const completed = Number.parseInt(completedTests)
    const remaining = Number.parseInt(remainingTests)

    const validationError = validateInputs(current, target, completed, remaining)
    if (validationError) {
      setResult({
        requiredGrade: 0,
        isAchievable: false,
        message: validationError,
      })
      return
    }

    const totalTests = completed + remaining
    const totalPointsNeeded = target * totalTests
    const currentTotalPoints = current * completed
    const pointsNeeded = totalPointsNeeded - currentTotalPoints
    const requiredGrade = pointsNeeded / remaining

    const isAchievable = checkIfAchievable(requiredGrade)
    
    const message = isAchievable
      ? getAchievableMessage(requiredGrade, remaining)
      : getUnachievableMessage(requiredGrade, target)

    setResult({
      requiredGrade: Number.parseFloat(requiredGrade.toFixed(2)),
      isAchievable,
      message,
    })
  }

  const handleSystemChange = (newSystem: string) => {
    setSystem(newSystem)
    setResult(null)

    if (newSystem === "germany") {
      setCurrentAverage("3.0")
      setTargetAverage("2.0")
    } else if (newSystem === "usa") {
      setCurrentAverage("75")
      setTargetAverage("85")
    } else {
      setCurrentAverage("4.5")
      setTargetAverage("5.0")
    }
  }

  return (
    <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
      <div className="bg-emerald-200 dark:bg-emerald-900/40 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full p-2 bg-emerald-500 text-white self-center">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-emerald-950 dark:text-white">Grade Predictor</h2>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Calculate what grade you need on upcoming tests to reach your target average
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Grading System</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(gradingSystems).map(([key, sys]) => (
            <Button
              key={key}
              variant={system === key ? "default" : "outline"}
              onClick={() => handleSystemChange(key)}
              className="h-auto py-3 flex flex-col items-start"
            >
              <span className="font-semibold">{sys.name}</span>
              <span className="text-xs opacity-70">
                {sys.min}-{sys.max}
              </span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{selectedSystem.description}</p>
      </div>

      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-average" className="mb-2 block">
              Current Average Grade
            </Label>
            <Input
              id="current-average"
              type="number"
              min={selectedSystem.min}
              max={selectedSystem.max}
              step={selectedSystem.step}
              value={currentAverage}
              onChange={(e) => {
                setCurrentAverage(e.target.value)
                setResult(null)
              }}
              placeholder={`e.g., ${selectedSystem.pass}`}
              className="text-lg font-medium"
            />
          </div>
          <div>
            <Label htmlFor="target-average" className="mb-2 block">
              Target Average Grade
            </Label>
            <Input
              id="target-average"
              type="number"
              min={selectedSystem.min}
              max={selectedSystem.max}
              step={selectedSystem.step}
              value={targetAverage}
              onChange={(e) => {
                setTargetAverage(e.target.value)
                setResult(null)
              }}
              placeholder={`e.g., ${selectedSystem.max}`}
              className="text-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="completed-tests" className="mb-2 block">
              Tests Completed
            </Label>
            <Input
              id="completed-tests"
              type="number"
              min="1"
              step="1"
              value={completedTests}
              onChange={(e) => {
                setCompletedTests(e.target.value)
                setResult(null)
              }}
              placeholder="e.g., 3"
              className="text-lg font-medium"
            />
          </div>
          <div>
            <Label htmlFor="remaining-tests" className="mb-2 block">
              Tests Remaining
            </Label>
            <Input
              id="remaining-tests"
              type="number"
              min="1"
              step="1"
              value={remainingTests}
              onChange={(e) => {
                setRemainingTests(e.target.value)
                setResult(null)
              }}
              placeholder="e.g., 2"
              className="text-lg font-medium"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={calculateRequiredGrade}
        className="w-full mb-6 h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      >
        <Calculator className="h-5 w-5 mr-2" />
        Calculate Required Grade
      </Button>

      {result && (
        <div
          className={`p-6 rounded-lg border-2 ${
            result.isAchievable
              ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            {result.isAchievable ? (
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">
                {result.isAchievable ? "Goal is Achievable!" : "Goal Status"}
              </h3>
              <p className="text-sm mb-4 text-green-800 dark:text-green-200">{result.message}</p>
            </div>
          </div>

          {result.isAchievable && (
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Required Average Grade:</span>
                <div
                  className={`text-2xl font-bold px-4 py-2 rounded-md border ${getGradeQualityBadgeColor(result.requiredGrade, system)}`}
                >
                  {result.requiredGrade}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
