"use client"

import { useState } from "react"
import { Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    step: 1,
  },
}

export function GradeGoals() {
  const [system, setSystem] = useState("switzerland")
  const [currentGrade, setCurrentGrade] = useState("4.2")
  const [targetGrade, setTargetGrade] = useState("5.0")
  const [progress, setProgress] = useState(70)

  const selectedSystem = gradingSystems[system as keyof typeof gradingSystems]

  const calculateProgress = () => {
    const current = Number.parseFloat(currentGrade)
    const target = Number.parseFloat(targetGrade)

    if (isNaN(current) || isNaN(target) || current === target) return

    const { min, max } = selectedSystem

    // For Germany, we need to invert the calculation since 1 is best and 6 is worst
    if (system === "germany") {
      const range = current - max
      const position = target - max
      let newProgress
      if (range === 0) {
        newProgress = 100
      } else {
        newProgress = Math.min(100, Math.max(0, (position / range) * 100))
      }
      setProgress(Math.round(newProgress))
      return
    }

    // For Switzerland and USA (where higher is better)
    const range = target - min
    const position = current - min
    const newProgress = Math.min(100, Math.max(0, (position / range) * 100))
    setProgress(Math.round(newProgress))
  }

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full p-2 bg-green-500 text-white">
          <Target className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium">Grade Goals</h3>
      </div>

      <div className="mb-6">
        <Label htmlFor="grading-system" className="mb-2 block">
          Grading System
        </Label>
        <select
          id="grading-system"
          value={system}
          onChange={(e) => {
            setSystem(e.target.value)
            // Reset values based on selected system
            setCurrentGrade(e.target.value === "usa" ? "70" : "4.2")
            setTargetGrade(e.target.value === "usa" ? "85" : "5.0")
            setProgress(70)
          }}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="switzerland">Switzerland (1-6)</option>
          <option value="germany">Germany (1-6)</option>
          <option value="usa">USA (0-100)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="current-grade" className="mb-2 block">
            Current Grade
          </Label>
          <Input
            id="current-grade"
            type="number"
            min={selectedSystem.min}
            max={selectedSystem.max}
            step={selectedSystem.step}
            value={currentGrade}
            onChange={(e) => setCurrentGrade(e.target.value)}
            placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
          />
        </div>
        <div>
          <Label htmlFor="target-grade" className="mb-2 block">
            Target Grade
          </Label>
          <Input
            id="target-grade"
            type="number"
            min={selectedSystem.min}
            max={selectedSystem.max}
            step={selectedSystem.step}
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
          />
        </div>
      </div>

      <Button onClick={calculateProgress} className="w-full mb-6 bg-green-500 hover:bg-green-600 text-white">
        Calculate Progress
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current: {currentGrade}</span>
          <span>Target: {targetGrade}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          You&#39;re {progress}% of the way to your goal!
          {system === "germany" ? " (Note: In Germany, lower grades are better)" : ""}
        </p>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2">Tips to improve your grade:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Create a regular study schedule</li>
          <li>Form a study group with classmates</li>
          <li>Ask your teacher for additional resources</li>
          <li>Practice with past exams and quizzes</li>
        </ul>
      </div>
    </Card>
  )
}

