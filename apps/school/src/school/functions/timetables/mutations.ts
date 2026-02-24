import { Result as R } from '@praha/byethrow'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import {
  createTimetableSessionSchema,
  updateTimetableSessionSchema,
} from '@/schemas/timetable'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Create a new timetable session after conflict check
 */
export const createTimetableSession = authServerFn
  .inputValidator(createTimetableSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    // Check for conflicts before creating
    const conflictsResult = await timetableQueries.detectConflicts({
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      classId: data.classId,
    })

    if (R.isFailure(conflictsResult)) {
      return { success: false as const, error: 'Échec de la vérification des conflits' }
    }

    const conflicts = conflictsResult.value

    if (conflicts.length > 0) {
      return {
        success: false as const,
        error: 'Conflits détectés',
        data: { conflicts },
      }
    }

    const result = await timetableQueries.createTimetableSession({
      id: crypto.randomUUID(),
      ...data,
    })
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la création de la séance' }

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'timetable_sessions',
      recordId: result.value.id,
      newValues: data,
    })

    return { success: true as const, data: result.value }
  })

/**
 * Update an existing timetable session
 */
export const updateTimetableSession = authServerFn
  .inputValidator(updateTimetableSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const { id, ...updateData } = data

    // Get existing session to check conflicts
    const existingResult = await timetableQueries.getTimetableSessionById(id)
    if (R.isFailure(existingResult)) {
      return { success: false as const, error: 'Erreur lors de la récupération de la séance' }
    }
    const existing = existingResult.value

    if (!existing) {
      return { success: false as const, error: 'Séance non trouvée' }
    }

    // Check for conflicts if time/day/teacher/classroom changed
    if (
      updateData.dayOfWeek !== undefined
      || updateData.startTime !== undefined
      || updateData.endTime !== undefined
      || updateData.teacherId !== undefined
      || updateData.classroomId !== undefined
    ) {
      const conflictsResult = await timetableQueries.detectConflicts({
        schoolId: existing.schoolId,
        schoolYearId: existing.schoolYearId,
        dayOfWeek: updateData.dayOfWeek ?? existing.dayOfWeek,
        startTime: updateData.startTime ?? existing.startTime,
        endTime: updateData.endTime ?? existing.endTime,
        teacherId: updateData.teacherId ?? existing.teacherId,
        classroomId: updateData.classroomId ?? existing.classroomId ?? undefined,
        classId: existing.classId,
        excludeSessionId: id,
      })

      if (R.isFailure(conflictsResult)) {
        return { success: false as const, error: 'Échec de la vérification des conflits' }
      }

      const conflicts = conflictsResult.value

      if (conflicts.length > 0) {
        return {
          success: false as const,
          error: 'Conflits détectés',
          data: { conflicts },
        }
      }
    }

    const result = await timetableQueries.updateTimetableSession(id, updateData)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la séance' }

    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'timetable_sessions',
      recordId: id,
      newValues: updateData,
    })

    return { success: true as const, data: result.value }
  })

/**
 * Delete a timetable session
 */
export const deleteTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const result = await timetableQueries.deleteTimetableSession(data.id)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la suppression de la séance' }

    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'timetable_sessions',
      recordId: data.id,
    })

    return { success: true as const, data: { success: true } }
  })
