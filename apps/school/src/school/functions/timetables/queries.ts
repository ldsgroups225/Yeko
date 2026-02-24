import { Result as R } from '@praha/byethrow'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import {
  getTimetableByClassroomSchema,
  getTimetableByClassSchema,
  getTimetableByTeacherSchema,
} from '@/schemas/timetable'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Get timetable for a specific class
 */
export const getTimetableByClass = authServerFn
  .inputValidator(getTimetableByClassSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const result = await timetableQueries.getTimetableByClass(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la classe' }
    return { success: true as const, data: result.value }
  })

/**
 * Get timetable for a specific teacher
 */
export const getTimetableByTeacher = authServerFn
  .inputValidator(getTimetableByTeacherSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const result = await timetableQueries.getTimetableByTeacher(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de l\'enseignant' }
    return { success: true as const, data: result.value }
  })

/**
 * Get timetable for a specific classroom
 */
export const getTimetableByClassroom = authServerFn
  .inputValidator(getTimetableByClassroomSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const result = await timetableQueries.getTimetableByClassroom(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la salle' }
    return { success: true as const, data: result.value }
  })

/**
 * Get a single timetable session by ID
 */
export const getTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const result = await timetableQueries.getTimetableSessionById(data.id)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération de la séance' }
    return { success: true as const, data: result.value }
  })
