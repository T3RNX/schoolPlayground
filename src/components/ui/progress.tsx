import type React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number
  className?: string
  indicatorClassName?: string
}

export function Progress({
  value = 0,
  className,
  indicatorClassName,
  ...props
}: ProgressProps & React.HTMLAttributes<HTMLDivElement>) {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div
        className={cn("h-full bg-primary transition-all duration-300 ease-in-out", indicatorClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

