import { Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";

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
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full p-2 bg-pink-500 text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Calculate Your Grade</h2>
          </div>

          <div className="space-y-4">
            {/* Tool content would go here */}
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              Grade Calculator tool content will be implemented here
            </div>
          </div>
        </Card>

        {/* Additional cards for related features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Grade History</h3>
            <p className="text-muted-foreground text-sm mb-4">
              View and track your grade progress over time.
            </p>
            <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              Grade history chart
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Grade Goals</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Set targets and see what scores you need to achieve them.
            </p>
            <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              Grade goals interface
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
