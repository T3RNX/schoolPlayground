export type Step = {
  id: string;
  threshold: number;
  grade: number;
};

export type CustomGradeSettings = {
  min: number;
  max: number;
  pass: number;
  steps: Step[];
  formula: string;
};

export const roundingMethods = {
  nearest: {
    name: "Round to nearest",
    description: "Round to the nearest value",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.round(value * factor) / factor;
    },
  },
  floor: {
    name: "Round down (floor)",
    description: "Round down to the nearest value within precision",
    function: (value: number, precision: number) => {
      const factor = Math.pow(10, precision);
      return Math.floor(value * factor) / factor;
    },
  },
  ceiling: {
    name: "Round up (ceiling)",
    description: "Round up to the nearest value",
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
  stepRounding: {
    name: "Round to step",
    description: "Round to the nearest specified increment (e.g., 0.5, 0.25)",
    function: (value: number, precision: number, step: number = 0.1) => {
      const inverse = 1 / step;
      const rounded = Math.round(value * inverse) / inverse;

      return Number(
        rounded.toFixed(Math.max(String(step).length - 2, precision))
      );
    },
  },
};

export function calculateStepwiseGrade(
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

export function defaultFormula(
  achieved: number,
  maximum: number,
  method: string,
  customSettings: CustomGradeSettings
) {
  const min = customSettings?.min ?? 1;
  const max = customSettings?.max ?? 6;

  if (method === "linear") {
    return min + (achieved / maximum) * (max - min);
  } else if (method === "stepwise" && customSettings?.steps?.length > 0) {
    return calculateStepwiseGrade(
      achieved,
      maximum,
      customSettings.steps,
      min,
      max
    );
  } else if (method === "custom" && customSettings?.formula) {
    try {
      const safeEvaluate = new Function(
        "achieved",
        "maximum",
        "min",
        "max",
        `"use strict"; 
        // Validate inputs are numbers
        if (typeof achieved !== 'number' || typeof maximum !== 'number' ||
            typeof min !== 'number' || typeof max !== 'number') {
          throw new Error("Invalid inputs");
        }
        return (${customSettings.formula});`
      );
      return safeEvaluate(achieved, maximum, min, max);
    } catch (e) {
      console.error("Error evaluating custom formula:", e);
      return min;
    }
  }

  return min + (achieved / maximum) * (max - min);
}
