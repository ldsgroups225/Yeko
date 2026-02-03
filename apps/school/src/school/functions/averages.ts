import * as averageQueries from '@repo/data-ops/queries/averages'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'

// Calculate subject average for a student
export const calculateSubjectAverage = authServerFn
  .inputValidator(z.object({
    studentId: z.string().min(1),
    subjectId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await averageQueries.calculateSubjectAverage(data)
    return { success: true as const, data: result }
  })

// Calculate term average for a student
export const calculateTermAverage = authServerFn
  .inputValidator(z.object({
    studentId: z.string().min(1),
    termId: z.string().min(1),
    classId: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await averageQueries.calculateTermAverage(data)
    return { success: true as const, data: result }
  })

// Calculate class rankings
export const calculateClassRankings = authServerFn
  .inputValidator(z.object({
    classId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await averageQueries.calculateClassRankings(data)
    return { success: true as const, data: { success: true } }
  })

// Recalculate all averages for a class/term
export const recalculateAverages = authServerFn
  .inputValidator(z.object({
    classId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await averageQueries.calculateClassRankings(data)
    return { success: true as const, data: { success: true } }
  })
