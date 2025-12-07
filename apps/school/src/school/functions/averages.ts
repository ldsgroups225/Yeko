import * as averageQueries from '@repo/data-ops/queries/averages'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Calculate subject average for a student
export const calculateSubjectAverage = createServerFn()
  .inputValidator(z.object({
    studentId: z.string().min(1),
    subjectId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    const result = await averageQueries.calculateSubjectAverage(data)
    return { success: true, data: result }
  })

// Calculate term average for a student
export const calculateTermAverage = createServerFn()
  .inputValidator(z.object({
    studentId: z.string().min(1),
    termId: z.string().min(1),
    classId: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    const result = await averageQueries.calculateTermAverage(data)
    return { success: true, data: result }
  })

// Calculate class rankings
export const calculateClassRankings = createServerFn()
  .inputValidator(z.object({
    classId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    await averageQueries.calculateClassRankings(data)
    return { success: true }
  })

// Recalculate all averages for a class/term
export const recalculateAverages = createServerFn()
  .inputValidator(z.object({
    classId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    await averageQueries.calculateClassRankings(data)
    return { success: true }
  })
