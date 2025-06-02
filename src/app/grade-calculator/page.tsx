import { GradeCalculator } from "@/components/gradeCalculator/grade-calculator";
import { GradeGoals } from "@/components/gradeCalculator/grade-goals";
import { GradeHistory } from "@/components/gradeCalculator/grade-history";

export default function GradeCalculatorPage() {
  return (
    <>
      <div className="grid gap-4">
        <GradeCalculator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradeHistory />
          <GradeGoals />
        </div>
      </div>
    </>
  );
}
