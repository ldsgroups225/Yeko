import { Result as R } from '@praha/byethrow'
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
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
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
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
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

    const result = await averageQueries.calculateClassRankings(data)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
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

    const result = await averageQueries.calculateAndStoreClassAverages({
      ...data,
      schoolId: context.school.schoolId,
    })
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: { success: true } }
  })

export const getClassAverages = authServerFn
  .inputValidator(z.object({
    classId: z.string().min(1),
    termId: z.string().min(1),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await averageQueries.getClassAveragesList(data.classId, data.termId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })
