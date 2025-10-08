/**
 * Swiss Pluspoints Calculation System
 *
 * Rules:
 * 1. Grades are rounded to the nearest 0.5
 * 2. For grades >= 4.0: pluspoints = rounded_grade - 4.0
 * 3. For grades < 4.0: pluspoints = (rounded_grade - 4.0) * 2 (doubled penalty)
 *
 * Examples:
 * - 5.4 → rounds to 5.5 → 5.5 - 4.0 = 1.5 pluspoints
 * - 5.2 → rounds to 5.0 → 5.0 - 4.0 = 1.0 pluspoint
 * - 4.5 → rounds to 4.5 → 4.5 - 4.0 = 0.5 pluspoints
 * - 4.0 → rounds to 4.0 → 4.0 - 4.0 = 0.0 pluspoints
 * - 3.5 → rounds to 3.5 → (3.5 - 4.0) * 2 = -1.0 pluspoint
 * - 3.0 → rounds to 3.0 → (3.0 - 4.0) * 2 = -2.0 pluspoints
 * - 2.0 → rounds to 2.0 → (2.0 - 4.0) * 2 = -4.0 pluspoints
 */

const PASSING_GRADE = 4.0

/**
 * Round a grade to the nearest 0.5
 */
function roundToNearestHalf(grade: number): number {
  return Math.round(grade * 2) / 2
}

/**
 * Calculate pluspoints for a single grade
 */
export function calculatePluspoints(grade: number): number {
  const rounded = roundToNearestHalf(grade)
  const difference = rounded - PASSING_GRADE

  if (rounded >= PASSING_GRADE) {
    return difference
  } else {
    return difference * 2
  }
}

/**
 * Calculate total pluspoints from an array of grades
 */
export function calculateTotalPluspoints(grades: number[]): number {
  return grades.reduce((total, grade) => total + calculatePluspoints(grade), 0)
}

/**
 * Get color class for pluspoints display (text color)
 */
export function getPluspointsColor(pluspoints: number): string {
  if (pluspoints >= 2) return "text-green-600 dark:text-green-400"
  if (pluspoints >= 1) return "text-emerald-600 dark:text-emerald-400"
  if (pluspoints >= 0) return "text-blue-600 dark:text-blue-400"
  if (pluspoints >= -2) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

/**
 * Get badge color class for pluspoints display (background + text)
 */
export function getPluspointsBadgeColor(pluspoints: number): string {
  if (pluspoints >= 2) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
  if (pluspoints >= 1) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
  if (pluspoints >= 0) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
  if (pluspoints >= -2) return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
  return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
}
