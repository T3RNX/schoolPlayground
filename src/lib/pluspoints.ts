/**
 * Calculate pluspoints for a single grade in the Swiss system
 * Formula: pluspoints = grade - 4.0
 *
 * Examples:
 * - Grade 6.0 = 2.0 pluspoints
 * - Grade 5.0 = 1.0 pluspoint
 * - Grade 4.5 = 0.5 pluspoints
 * - Grade 4.0 = 0.0 pluspoints (passing)
 * - Grade 3.0 = -1.0 pluspoint
 */
export function calculatePluspoints(grade: number): number {
  return grade - 4.0
}

/**
 * Calculate total pluspoints for an array of grades
 */
export function calculateTotalPluspoints(grades: number[]): number {
  return grades.reduce((total, grade) => total + calculatePluspoints(grade), 0)
}

/**
 * Calculate average pluspoints
 */
export function calculateAveragePluspoints(grades: number[]): number {
  if (grades.length === 0) return 0
  return calculateTotalPluspoints(grades) / grades.length
}

/**
 * Get color class for pluspoints display
 */
export function getPluspointsColor(pluspoints: number): string {
  if (pluspoints >= 1.5) return "text-emerald-700 dark:text-emerald-400"
  if (pluspoints >= 0.5) return "text-green-600 dark:text-green-400"
  if (pluspoints >= 0) return "text-green-500 dark:text-green-300"
  if (pluspoints >= -0.5) return "text-amber-500 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

/**
 * Get badge color for pluspoints display
 */
export function getPluspointsBadgeColor(pluspoints: number): string {
  if (pluspoints >= 1.5) return "bg-emerald-600 text-white dark:bg-emerald-500"
  if (pluspoints >= 0.5) return "bg-green-600 text-white dark:bg-green-500"
  if (pluspoints >= 0) return "bg-green-500 text-white dark:bg-green-400"
  if (pluspoints >= -0.5) return "bg-amber-500 text-white dark:bg-amber-400"
  return "bg-red-600 text-white dark:bg-red-500"
}
