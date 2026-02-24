import { Result as R } from '@praha/byethrow'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Get total weekly teaching hours for a teacher
 */
export const getTeacherWeeklyHours = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const result = await timetableQueries.getTeacherWeeklyHours(data.teacherId, data.schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération des heures hebdomadaires' }
    return { success: true as const, data: result.value }
  })

/**
 * Get teacher availability for a specific day
 */
export const getTeacherAvailability = authServerFn
  .inputValidator(z.object({
    teacherId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const result = await timetableQueries.getTeacherAvailability(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de la disponibilité de l\'enseignant' }
    return { success: true as const, data: result.value }
  })

/**
 * Get classroom availability for a specific day
 */
export const getClassroomAvailability = authServerFn
  .inputValidator(z.object({
    classroomId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const result = await timetableQueries.getClassroomAvailability(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de la disponibilité de la salle' }
    return { success: true as const, data: result.value }
  })
