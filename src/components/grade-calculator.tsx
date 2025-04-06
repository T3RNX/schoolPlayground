"use client";

import { useState } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roundingMethods = {
  nearest: {
    name: "Round to nearest",
    description: "Round to the nearest whole number",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.round(value * factor) / factor;
    },
  },
  floor: {
    name: "Round down (floor)",
    description: "Round down to the nearest whole number",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.floor(value * factor) / factor;
    },
  },
  ceiling: {
    name: "Round up (ceiling)",
    description: "Round up to the nearest whole number",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.ceil(value * factor) / factor;
    },
  },
  truncate: {
    name: "Truncate (cut off)",
    description: "Cut off decimal places without rounding",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.trunc(value * factor) / factor;
    },
  },
};

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
};

const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    formula: (
      achieved: number,
      maximum: number,
      method: string,
      customSettings: CustomGradeSettings
    ) => {
      if (method === "stepwise" && customSettings?.steps?.length > 0) {
        return calculateStepwiseGrade(
          achieved,
          maximum,
          customSettings.steps,
          customSettings.min,
          customSettings.max
        );
      } else if (method === "custom" && customSettings?.formula) {
        try {
          const safeEvaluate = new Function(
            "achieved",
            "maximum",
            `"use strict"; return (${customSettings.formula});`
          );
          return safeEvaluate(achieved, maximum);
        } catch (e) {
          console.error("Error evaluating custom formula:", e);
          return 1;
        }
      }
      return 5 * (achieved / maximum) + 1;
    },
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    formula: (
      achieved: number,
      maximum: number,
      method: string,
      customSettings: CustomGradeSettings
    ) => {
      if (method === "stepwise" && customSettings?.steps?.length > 0) {
        return calculateStepwiseGrade(
          achieved,
          maximum,
          customSettings.steps,
          customSettings.min,
          customSettings.max
        );
      } else if (method === "custom" && customSettings?.formula) {
        try {
          const safeEvaluate = new Function(
            "achieved",
            "maximum",
            `"use strict"; return (${customSettings.formula});`
          );
          return safeEvaluate(achieved, maximum);
        } catch (e) {
          console.error("Error evaluating custom formula:", e);
          return 6;
        }
      }
      return 6 - 5 * (achieved / maximum);
    },
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    formula: (
      achieved: number,
      maximum: number,
      method: string,
      customSettings: CustomGradeSettings
    ) => {
      if (method === "stepwise" && customSettings?.steps?.length > 0) {
        return calculateStepwiseGrade(
          achieved,
          maximum,
          customSettings.steps,
          customSettings.min,
          customSettings.max
        );
      } else if (method === "custom" && customSettings?.formula) {
        try {
          const safeEvaluate = new Function(
            "achieved",
            "maximum",
            `"use strict"; return (${customSettings.formula});`
          );
          return safeEvaluate(achieved, maximum);
        } catch (e) {
          console.error("Error evaluating custom formula:", e);
          return 0;
        }
      }
      return (achieved / maximum) * 100;
    },
  },
  custom: {
    name: "Custom",
    min: 0,
    max: 10,
    pass: 5,
    formula: (
      achieved: number,
      maximum: number,
      method: string,
      customSettings: CustomGradeSettings
    ) => {
      if (method === "stepwise" && customSettings?.steps?.length > 0) {
        return calculateStepwiseGrade(
          achieved,
          maximum,
          customSettings.steps,
          customSettings.min,
          customSettings.max
        );
      } else if (method === "custom" && customSettings?.formula) {
        try {
          const safeEvaluate = new Function(
            "achieved",
            "maximum",
            `"use strict"; return (${customSettings.formula});`
          );
          return safeEvaluate(achieved, maximum);
        } catch (e) {
          console.error("Error evaluating custom formula:", e);
          return customSettings.min || 0;
        }
      }
      const min = customSettings?.min || 0;
      const max = customSettings?.max || 10;
      return min + (achieved / maximum) * (max - min);
    },
  },
};

function calculateStepwiseGrade(
  achieved: number,
  maximum: number,
  steps: Step[],
  min: number,
  max: number
) {
  const percentage = (achieved / maximum) * 100;

  const sortedSteps = [...steps].sort((a, b) => a.threshold - b.threshold);

  for (const step of sortedSteps) {
    if (percentage <= step.threshold) {
      return step.grade;
    }
  }

  return max;
}

type GradeEntry = {
  id: string;
  grade: string;
  weight: string;
};

type Step = {
  id: string;
  threshold: number;
  grade: number;
};

type CustomGradeSettings = {
  min: number;
  max: number;
  pass: number;
  steps: Step[];
  formula: string;
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

  const [showExtendedMode, setShowExtendedMode] = useState(false);
  const [roundingMethod, setRoundingMethod] = useState("nearest");
  const [roundingPrecision, setRoundingPrecision] = useState(2);
  const [gradingMethod, setGradingMethod] = useState("linear");
  const [customFormula, setCustomFormula] = useState(
    "5 * (achieved / maximum) + 1"
  );
  const [customMin, setCustomMin] = useState("0");
  const [customMax, setCustomMax] = useState("10");
  const [customPass, setCustomPass] = useState("5");
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", threshold: 50, grade: 4 },
    { id: "2", threshold: 60, grade: 4.5 },
    { id: "3", threshold: 70, grade: 5 },
    { id: "4", threshold: 80, grade: 5.5 },
    { id: "5", threshold: 90, grade: 6 },
  ]);

  const getSelectedSystem = () => {
    const baseSystem = gradingSystems[system as keyof typeof gradingSystems];

    if (system === "custom") {
      return {
        ...baseSystem,
        min: Number(customMin),
        max: Number(customMax),
        pass: Number(customPass),
      };
    }

    return baseSystem;
  };

  const selectedSystem = getSelectedSystem();

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

    const customSettings = {
      min: Number(customMin),
      max: Number(customMax),
      pass: Number(customPass),
      steps: steps,
      formula: customFormula,
    };

    const rawGrade = selectedSystem.formula(
      achieved,
      max,
      gradingMethod,
      customSettings
    );

    const roundingFunction =
      roundingMethods[roundingMethod as keyof typeof roundingMethods].function;
    const roundedGrade = roundingFunction(rawGrade, roundingPrecision);

    setCalculatedGrade(roundedGrade);
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

    const roundingFunction =
      roundingMethods[roundingMethod as keyof typeof roundingMethods].function;
    const roundedAverage = roundingFunction(average, roundingPrecision);

    setAverageGrade(roundedAverage);
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

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    const newThreshold = lastStep ? Math.min(lastStep.threshold + 10, 100) : 50;
    const newGrade = lastStep
      ? Math.min(lastStep.grade + 0.5, Number(customMax) || 10)
      : 4;

    setSteps([
      ...steps,
      { id: Date.now().toString(), threshold: newThreshold, grade: newGrade },
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((step) => step.id !== id));
  };

  const updateStep = (
    id: string,
    field: "threshold" | "grade",
    value: number
  ) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground";

    const passGrade =
      system === "custom" ? Number(customPass) : selectedSystem.pass;

    if (system === "germany") {
      return grade <= passGrade
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400";
    } else {
      return grade >= passGrade
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400";
    }
  };

  const handleSystemChange = (newSystem: string) => {
    setSystem(newSystem);
    setCalculatedGrade(null);
    setAverageGrade(null);

    if (newSystem !== "custom") {
      const system = gradingSystems[newSystem as keyof typeof gradingSystems];
      setCustomMin(system.min.toString());
      setCustomMax(system.max.toString());
      setCustomPass(system.pass.toString());

      const newSteps: Step[] = [];
      const range = system.max - system.min;
      const stepCount = 5;

      for (let i = 0; i < stepCount; i++) {
        const percentage = 50 + i * 10;
        const grade = system.min + range * (percentage / 100);
        newSteps.push({
          id: (i + 1).toString(),
          threshold: percentage,
          grade: Math.round(grade * 10) / 10,
        });
      }

      setSteps(newSteps);

      if (newSystem === "switzerland") {
        setCustomFormula("5 * (achieved / maximum) + 1");
      } else if (newSystem === "germany") {
        setCustomFormula("6 - 5 * (achieved / maximum)");
      } else if (newSystem === "usa") {
        setCustomFormula("(achieved / maximum) * 100");
      }
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

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Label htmlFor="grading-system" className="text-sm">
            Grading System
          </Label>
          <select
            id="grading-system"
            value={system}
            onChange={(e) => handleSystemChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="switzerland">Switzerland</option>
            <option value="germany">Germany</option>
            <option value="usa">USA</option>
            <option value="custom">Custom</option>
          </select>

          <p className="text-sm text-muted-foreground">
            {system === "switzerland" &&
              "In Switzerland, grades range from 1 to 6, with 6 being the best. 4 is the passing grade."}
            {system === "germany" &&
              "In Germany, grades range from 1 to 6, with 1 being the best. 4 is the passing grade."}
            {system === "usa" &&
              "In the USA, grades typically range from 0 to 100, with 60% or higher being a passing grade."}
            {system === "custom" &&
              "Custom grading system. Define your own grade range and passing threshold."}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Button
          variant="outline"
          className="w-full flex justify-between items-center"
          onClick={() => setShowExtendedMode(!showExtendedMode)}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Advanced Settings</span>
          </div>
          {showExtendedMode ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showExtendedMode && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg space-y-4">
          <h3 className="font-medium text-sm mb-2">Advanced Grading Options</h3>

          {system === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="custom-min" className="mb-2 block">
                  Minimum Grade
                </Label>
                <Input
                  id="custom-min"
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  placeholder="Minimum grade"
                />
              </div>
              <div>
                <Label htmlFor="custom-max" className="mb-2 block">
                  Maximum Grade
                </Label>
                <Input
                  id="custom-max"
                  type="number"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  placeholder="Maximum grade"
                />
              </div>
              <div>
                <Label htmlFor="custom-pass" className="mb-2 block">
                  Passing Grade
                </Label>
                <Input
                  id="custom-pass"
                  type="number"
                  value={customPass}
                  onChange={(e) => setCustomPass(e.target.value)}
                  placeholder="Passing grade"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rounding-method" className="mb-2 block">
                Rounding Method
              </Label>
              <select
                id="rounding-method"
                value={roundingMethod}
                onChange={(e) => setRoundingMethod(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(roundingMethods).map(([key, method]) => (
                  <option key={key} value={key}>
                    {method.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {
                  roundingMethods[
                    roundingMethod as keyof typeof roundingMethods
                  ].description
                }
              </p>
            </div>
            <div>
              <Label htmlFor="rounding-precision" className="mb-2 block">
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
              />
            </div>
          </div>

          <div>
            <Label htmlFor="grading-method" className="mb-2 block">
              Grading Method
            </Label>
            <select
              id="grading-method"
              value={gradingMethod}
              onChange={(e) => setGradingMethod(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {Object.entries(gradingMethods).map(([key, method]) => (
                <option key={key} value={key}>
                  {method.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {
                gradingMethods[gradingMethod as keyof typeof gradingMethods]
                  .description
              }
            </p>
          </div>

          {gradingMethod === "custom" && (
            <div>
              <Label htmlFor="custom-formula" className="mb-2 block">
                Custom Formula
              </Label>
              <Input
                id="custom-formula"
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
                placeholder="e.g., 5 * (achieved / maximum) + 1"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Use &apos;achieved&apos; for points earned and
                &apos;maximum&apos; for total possible points
              </p>
            </div>
          )}

          {gradingMethod === "stepwise" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Grade Steps</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="h-7 px-2 text-xs"
                >
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
                  <div
                    key={step.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={step.threshold}
                        onChange={(e) =>
                          updateStep(
                            step.id,
                            "threshold",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        type="number"
                        min={
                          system === "custom"
                            ? Number(customMin)
                            : selectedSystem.min
                        }
                        max={
                          system === "custom"
                            ? Number(customMax)
                            : selectedSystem.max
                        }
                        step="0.1"
                        value={step.grade}
                        onChange={(e) =>
                          updateStep(step.id, "grade", Number(e.target.value))
                        }
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
