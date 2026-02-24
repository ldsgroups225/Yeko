import type { Grade } from './types'
import { useMemo } from 'react'

export function useGradeEntryStatistics(
  gradesByStudent: Map<string, Grade>,
  pendingChanges: Map<string, number>,
) {
  return useMemo(() => {
    const allValues: number[] = []
    for (const grade of gradesByStudent.values()) {
      allValues.push(Number.parseFloat(grade.value))
    }
    for (const [studentId, value] of pendingChanges.entries()) {
      if (!gradesByStudent.has(studentId)) {
        allValues.push(value)
      }
    }
    if (allValues.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, below10: 0, above15: 0 }
    }
    return {
      count: allValues.length,
      average: allValues.reduce((a, b) => a + b, 0) / allValues.length,
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      below10: allValues.filter(v => v < 10).length,
      above15: allValues.filter(v => v >= 15).length,
    }
  }, [gradesByStudent, pendingChanges])
}
