import { Lightbulb } from "lucide-react"; // Replace with the specific icon
import { Card } from "@/components/ui/card";

// This is a template file - rename and customize for each tool
export default function ToolNamePage() {
  return (
    <>
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight">Tool Name</h1>
        <p className="text-muted-foreground">Brief description of the tool.</p>
      </div>

      <div className="grid gap-4">
        {/* Main tool card */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full p-2 bg-blue-500 text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Main Feature Title</h2>
          </div>

          <div className="space-y-4">
            {/* Tool content would go here */}
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              Tool content will be implemented here
            </div>
          </div>
        </Card>

        {/* Additional cards for related features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Feature One</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Description of this feature.
            </p>
            <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              Feature content
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Feature Two</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Description of this feature.
            </p>
            <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              Feature content
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
