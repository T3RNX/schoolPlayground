import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">SchoolPlayground</h2>
          <p className="text-sm text-muted-foreground">Loading your tools...</p>
        </div>
      </div>
    </div>
  )
}
