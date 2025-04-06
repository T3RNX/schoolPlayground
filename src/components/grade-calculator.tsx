"use client";

import { useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Grading systems for different countries
const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    formula: (achieved: number, maximum: number) => {
      // Swiss formula: 5 * (achieved / maximum) + 1
      return Math.round((5 * (achieved / maximum) + 1) * 100) / 100;
    },
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    formula: (achieved: number, maximum: number) => {
      // German formula: 6 - 5 * (achieved / maximum)
      return Math.round((6 - 5 * (achieved / maximum)) * 100) / 100;
    },
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    formula: (achieved: number, maximum: number) => {
      // US formula: (achieved / maximum) * 100
      return Math.round((achieved / maximum) * 100);
    },
  },
};

type GradeEntry = {
  id: string;
  grade: string;
  weight: string;
};

export function GradeCalculator() {
  const [activeTab, setActiveTab] = useState("points");
  const [system, setSystem] = useState("switzerland");
  const [maximumPoints, setMaximumPoints] = useState("");
  const [achievedPoints, setAchievedPoints] = useState("");
  const [calculatedGrade, setCalculatedGrade] = useState<number | null>(null);
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([
    { id: "1", grade: "", weight: "1" },
    { id: "2", grade: "", weight: "1" },
  ]);
  const [averageGrade, setAverageGrade] = useState<number | null>(null);

  const selectedSystem = gradingSystems[system as keyof typeof gradingSystems];

  const calculateGrade = () => {
    if (!maximumPoints || !achievedPoints) return;

    const max = Number.parseFloat(maximumPoints);
    const achieved = Number.parseFloat(achievedPoints);

    if (
      isNaN(max) ||
      isNaN(achieved) ||
      max <= 0 ||
      achieved < 0 ||
      achieved > max
    ) {
      return;
    }

    const grade = selectedSystem.formula(achieved, max);
    setCalculatedGrade(grade);
  };

  const calculateAverage = () => {
    const validEntries = gradeEntries.filter(
      (entry) => entry.grade !== "" && entry.weight !== ""
    );

    if (validEntries.length === 0) return;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const entry of validEntries) {
      const grade = Number.parseFloat(entry.grade);
      const weight = Number.parseFloat(entry.weight);

      if (isNaN(grade) || isNaN(weight) || weight <= 0) continue;

      totalWeight += weight;
      weightedSum += grade * weight;
    }

    if (totalWeight === 0) return;

    const average = weightedSum / totalWeight;
    setAverageGrade(Math.round(average * 100) / 100);
  };

  const addGradeEntry = () => {
    setGradeEntries([
      ...gradeEntries,
      { id: Date.now().toString(), grade: "", weight: "1" },
    ]);
  };

  const removeGradeEntry = (id: string) => {
    if (gradeEntries.length <= 1) return;
    setGradeEntries(gradeEntries.filter((entry) => entry.id !== id));
  };

  const updateGradeEntry = (
    id: string,
    field: "grade" | "weight",
    value: string
  ) => {
    setGradeEntries(
      gradeEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground";

    if (system === "germany") {
      // In Germany, lower is better (1 is best, 6 is worst)
      return grade <= selectedSystem.pass
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400";
    } else {
      // In other systems, higher is better
      return grade >= selectedSystem.pass
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400";
    }
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full p-2 bg-pink-500 text-white">
          <Calculator className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold">Grade Calculator</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="mb-6 flex items-center gap-4">
          <Label htmlFor="grading-system" className="whitespace-nowrap">
            Grading System
          </Label>
          <select
            id="grading-system"
            value={system}
            onChange={(e) => {
              setSystem(e.target.value);
              setCalculatedGrade(null);
              setAverageGrade(null);
            }}
            className="w-full md:w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="switzerland">Switzerland</option>
            <option value="germany">Germany</option>
            <option value="usa">USA</option>
          </select>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {system === "switzerland" &&
              "In Switzerland, grades range from 1 to 6, with 6 being the best. 4 is the passing grade."}
            {system === "germany" &&
              "In Germany, grades range from 1 to 6, with 1 being the best. 4 is the passing grade."}
            {system === "usa" &&
              "In the USA, grades typically range from 0 to 100, with 60% or higher being a passing grade."}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "points"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("points")}
          >
            Calculate from Points
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "average"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("average")}
          >
            Calculate Average Grade
          </button>
        </div>
      </div>

      {activeTab === "points" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Enter maximum points"
              />
            </div>
            <div>
              <Label htmlFor="achieved-points" className="mb-2 block">
                Achieved Points
              </Label>
              <Input
                id="achieved-points"
                type="number"
                min="0"
                step="0.5"
                value={achievedPoints}
                onChange={(e) => setAchievedPoints(e.target.value)}
                placeholder="Enter achieved points"
              />
            </div>
          </div>

          <Button
            onClick={calculateGrade}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            disabled={!maximumPoints || !achievedPoints}
          >
            Calculate Grade
          </Button>

          {calculatedGrade !== null && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm font-medium mb-2">Your grade is:</p>
              <p
                className={`text-3xl font-bold ${getGradeColor(
                  calculatedGrade
                )}`}
              >
                {calculatedGrade}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {calculatedGrade >= selectedSystem.pass
                  ? "Congratulations! You passed."
                  : "You didn't pass. Keep studying!"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {gradeEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`grade-${entry.id}`} className="mb-2 block">
                    Grade {index + 1}
                  </Label>
                  <Input
                    id={`grade-${entry.id}`}
                    type="number"
                    min={selectedSystem.min}
                    max={selectedSystem.max}
                    step="0.1"
                    value={entry.grade}
                    onChange={(e) =>
                      updateGradeEntry(entry.id, "grade", e.target.value)
                    }
                    placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`weight-${entry.id}`} className="mb-2 block">
                    Weight
                  </Label>
                  <Input
                    id={`weight-${entry.id}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={entry.weight}
                    onChange={(e) =>
                      updateGradeEntry(entry.id, "weight", e.target.value)
                    }
                    placeholder="Weight"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGradeEntry(entry.id)}
                  disabled={gradeEntries.length <= 1}
                  className="mb-0.5"
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
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Grade
            </Button>
            <Button
              onClick={calculateAverage}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
            >
              Calculate Average
            </Button>
          </div>

          {averageGrade !== null && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm font-medium mb-2">Your average grade is:</p>
              <p
                className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}
              >
                {averageGrade}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {averageGrade >= selectedSystem.pass
                  ? "Congratulations! You passed."
                  : "You didn't pass. Keep studying!"}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
