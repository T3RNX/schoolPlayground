// Grade quality thresholds and colors configuration
const GRADE_SYSTEMS = {
  switzerland: {
    thresholds: [
      { min: 6, colors: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-600 text-white dark:bg-emerald-500" } },
      { min: 5, colors: { text: "text-green-600 dark:text-green-400", bg: "bg-green-600 text-white dark:bg-green-500" } },
      { min: 4, colors: { text: "text-green-500 dark:text-green-300", bg: "bg-green-500 text-white dark:bg-green-400" } },
      { min: 3, colors: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500 text-white dark:bg-amber-400" } },
    ],
    fallback: { text: "text-red-600 dark:text-red-400", bg: "bg-red-600 text-white dark:bg-red-500" },
    isHigherBetter: true
  },
  germany: {
    thresholds: [
      { max: 1.5, colors: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-600 text-white dark:bg-emerald-500" } },
      { max: 2.5, colors: { text: "text-green-600 dark:text-green-400", bg: "bg-green-600 text-white dark:bg-green-500" } },
      { max: 3.5, colors: { text: "text-green-500 dark:text-green-300", bg: "bg-green-500 text-white dark:bg-green-400" } },
      { max: 4, colors: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500 text-white dark:bg-amber-400" } },
      { max: 4.5, colors: { text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500 text-white dark:bg-orange-400" } },
    ],
    fallback: { text: "text-red-600 dark:text-red-400", bg: "bg-red-600 text-white dark:bg-red-500" },
    isHigherBetter: false
  },
  usa: {
    thresholds: [
      { min: 90, colors: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-600 text-white dark:bg-emerald-500" } },
      { min: 80, colors: { text: "text-green-600 dark:text-green-400", bg: "bg-green-600 text-white dark:bg-green-500" } },
      { min: 70, colors: { text: "text-green-500 dark:text-green-300", bg: "bg-green-500 text-white dark:bg-green-400" } },
      { min: 60, colors: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500 text-white dark:bg-amber-400" } },
      { min: 50, colors: { text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500 text-white dark:bg-orange-400" } },
    ],
    fallback: { text: "text-red-600 dark:text-red-400", bg: "bg-red-600 text-white dark:bg-red-500" },
    isHigherBetter: true
  }
} as const

function getGradeColors(grade: number, system: keyof typeof GRADE_SYSTEMS, colorType: 'text' | 'bg') {
  const config = GRADE_SYSTEMS[system]
  if (!config) {
    return colorType === 'text' ? "text-foreground" : "bg-secondary text-secondary-foreground"
  }

  for (const threshold of config.thresholds) {
    const meetsThreshold = 'min' in threshold 
      ? grade >= threshold.min 
      : grade <= threshold.max
    
    if (meetsThreshold) {
      return threshold.colors[colorType]
    }
  }

  return config.fallback[colorType]
}

// Utility function to get color classes based on grade quality
export function getGradeQualityColor(grade: number, system = "switzerland"): string {
  return getGradeColors(grade, system as keyof typeof GRADE_SYSTEMS, 'text')
}

export function getGradeQualityBadgeColor(grade: number, system = "switzerland"): string {
  return getGradeColors(grade, system as keyof typeof GRADE_SYSTEMS, 'bg')
}
