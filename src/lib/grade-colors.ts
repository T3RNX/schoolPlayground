// Utility function to get color classes based on grade quality
export function getGradeQualityColor(grade: number, system = "switzerland"): string {
  if (system === "switzerland") {
    // Swiss system: 1-6, higher is better
    if (grade >= 6.0) return "text-emerald-700 dark:text-emerald-400" // Excellent
    if (grade >= 5.0) return "text-green-600 dark:text-green-400" // Very good
    if (grade >= 4.0) return "text-green-500 dark:text-green-300" // Good/Passing
    if (grade >= 3.0) return "text-amber-500 dark:text-amber-400" // Below passing
    return "text-red-600 dark:text-red-400" // Poor
  } else if (system === "germany") {
    // German system: 1-6, lower is better
    if (grade <= 1.5) return "text-emerald-700 dark:text-emerald-400" // Excellent
    if (grade <= 2.5) return "text-green-600 dark:text-green-400" // Very good
    if (grade <= 3.5) return "text-green-500 dark:text-green-300" // Good
    if (grade <= 4.0) return "text-amber-500 dark:text-amber-400" // Passing
    if (grade <= 4.5) return "text-orange-500 dark:text-orange-400" // Below passing
    return "text-red-600 dark:text-red-400" // Poor
  } else if (system === "usa") {
    // USA system: 0-100, higher is better
    if (grade >= 90) return "text-emerald-700 dark:text-emerald-400" // Excellent (A)
    if (grade >= 80) return "text-green-600 dark:text-green-400" // Very good (B)
    if (grade >= 70) return "text-green-500 dark:text-green-300" // Good (C)
    if (grade >= 60) return "text-amber-500 dark:text-amber-400" // Passing (D)
    if (grade >= 50) return "text-orange-500 dark:text-orange-400" // Below passing
    return "text-red-600 dark:text-red-400" // Poor (F)
  }

  return "text-foreground"
}

export function getGradeQualityBadgeColor(grade: number, system = "switzerland"): string {
  if (system === "switzerland") {
    if (grade >= 6.0) return "bg-emerald-600 text-white dark:bg-emerald-500"
    if (grade >= 5.0) return "bg-green-600 text-white dark:bg-green-500"
    if (grade >= 4.0) return "bg-green-500 text-white dark:bg-green-400"
    if (grade >= 3.0) return "bg-amber-500 text-white dark:bg-amber-400"
    return "bg-red-600 text-white dark:bg-red-500"
  } else if (system === "germany") {
    if (grade <= 1.5) return "bg-emerald-600 text-white dark:bg-emerald-500"
    if (grade <= 2.5) return "bg-green-600 text-white dark:bg-green-500"
    if (grade <= 3.5) return "bg-green-500 text-white dark:bg-green-400"
    if (grade <= 4.0) return "bg-amber-500 text-white dark:bg-amber-400"
    if (grade <= 4.5) return "bg-orange-500 text-white dark:bg-orange-400"
    return "bg-red-600 text-white dark:bg-red-500"
  } else if (system === "usa") {
    if (grade >= 90) return "bg-emerald-600 text-white dark:bg-emerald-500"
    if (grade >= 80) return "bg-green-600 text-white dark:bg-green-500"
    if (grade >= 70) return "bg-green-500 text-white dark:bg-green-400"
    if (grade >= 60) return "bg-amber-500 text-white dark:bg-amber-400"
    if (grade >= 50) return "bg-orange-500 text-white dark:bg-orange-400"
    return "bg-red-600 text-white dark:bg-red-500"
  }

  return "bg-secondary text-secondary-foreground"
}
