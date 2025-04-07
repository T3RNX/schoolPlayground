import { GradeCalculator } from "@/components/grade-calculator";
import { GradeHistory } from "@/components/grade-history";
import { GradeGoals } from "@/components/grade-goals";

export default function GradeCalculatorPage() {
  return (
    <>
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight">Grade Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your grades and see what you need to pass your courses.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Main calculator card */}
        <GradeCalculator />

        {/* Additional cards for related features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradeHistory />
          <GradeGoals />
        </div>
      </div>
    </>
  );
}
