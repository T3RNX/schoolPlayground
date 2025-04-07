import { describe, it, expect } from "vitest";
import {
  calculateStepwiseGrade,
  defaultFormula,
  roundingMethods,
} from "./gradeUtils";

describe("calculateStepwiseGrade", () => {
  it("returns correct grade based on threshold", () => {
    const steps = [
      { id: "1", threshold: 50, grade: 4 },
      { id: "2", threshold: 60, grade: 4.5 },
      { id: "3", threshold: 70, grade: 5 },
    ];
    const grade = calculateStepwiseGrade(45, 100, steps, 1, 6);
    expect(grade).toBe(4);
  });

  it("returns max if no step matches", () => {
    const steps = [{ id: "1", threshold: 50, grade: 4 }];
    const grade = calculateStepwiseGrade(90, 100, steps, 1, 6);
    expect(grade).toBe(6);
  });
});

describe("calculateCustomFormula", () => {
  it("evaluates valid custom formula correctly", () => {
    const formula = "min + (achieved / maximum) * (max - min)";
    const grade = defaultFormula(80, 100, "custom", {
      min: 1,
      max: 6,
      pass: 4,
      steps: [],
      formula,
    });
    expect(grade).toBe(5);
  });

  it("returns min on invalid custom formula", () => {
    const formula = "someInvalidCode";
    const grade = defaultFormula(80, 100, "custom", {
      min: 1,
      max: 6,
      pass: 4,
      steps: [],
      formula,
    });
    expect(grade).toBe(1);
  });
});

describe("calculateCustomFormula", () => {
  it("falls back to linear if method is unknown", () => {
    const grade = defaultFormula(50, 100, "unknown", {
      min: 1,
      max: 6,
      pass: 4,
      steps: [],
      formula: "",
    });
    expect(grade).toBe(3.5);
  });
});

describe("roundingMethods", () => {
  it("rounds to nearest correctly", () => {
    const result = roundingMethods.nearest.function(4.456, 1);
    expect(result).toBe(4.5);
  });

  it("applies step rounding", () => {
    const result = roundingMethods.stepRounding.function(4.27, 2, 0.25);
    expect(result).toBe(4.25);
  });

  it("rounds down with floor correctly", () => {
    const result = roundingMethods.floor.function(4.987, 2);
    expect(result).toBe(4.98);
  });

  it("rounds up with ceiling correctly", () => {
    const result = roundingMethods.ceiling.function(4.111, 1);
    expect(result).toBe(4.2);
  });

  it("truncates correctly", () => {
    const result = roundingMethods.truncate.function(3.456, 2);
    expect(result).toBe(3.45);
  });
});
