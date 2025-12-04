import { GradeCalculator } from "@/components/gradeCalculator/grade-calculator";
import { GradePredictor } from "@/components/gradeCalculator/grade-predictor";
import { GradeHistory } from "@/components/gradeCalculator/grade-history";

export default function GradeCalculatorPage() {
  return (
    <>
      <div className="grid gap-4">
        <GradeCalculator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradeHistory />
          <GradePredictor />
        </div>
      </div>
    </>
  );
}
