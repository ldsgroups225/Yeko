import type { TimetableConflict } from '@repo/data-ops/queries/timetables'
import { Result as R } from '@praha/byethrow'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import {
  importTimetableSchema,
} from '@/schemas/timetable'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Bulk import timetable sessions with conflict detection
 */
export const importTimetable = authServerFn
  .inputValidator(importTimetableSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const results = {
      total: data.sessions.length,
      success: 0,
      failed: 0,
      conflicts: [] as { index: number, conflicts: TimetableConflict[] }[],
    }

    // If replaceExisting, delete existing sessions
    if (data.replaceExisting) {
      const classIds = [...new Set(data.sessions.map(s => s.classId))]
      for (const classId of classIds) {
        await timetableQueries.deleteClassTimetable(classId, data.schoolYearId)
      }
    }

    // Create sessions
    for (let i = 0; i < data.sessions.length; i++) {
      const session = data.sessions[i]
      if (!session)
        continue

      // Check for conflicts
      const conflictsResult = await timetableQueries.detectConflicts({
        schoolId: data.schoolId,
        schoolYearId: data.schoolYearId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        classroomId: session.classroomId,
        classId: session.classId,
      })

      if (R.isFailure(conflictsResult)) {
        results.failed++
        continue
      }

      const conflicts = conflictsResult.value

      if (conflicts.length > 0) {
        results.failed++
        results.conflicts.push({ index: i, conflicts })
        continue
      }

      const createResult = await timetableQueries.createTimetableSession({
        id: crypto.randomUUID(),
        schoolId: data.schoolId,
        schoolYearId: data.schoolYearId,
        ...session,
      })

      if (R.isSuccess(createResult)) {
        results.success++
      }
      else {
        results.failed++
      }
    }

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'timetable_sessions',
      recordId: 'bulk-import',
      newValues: { total: data.sessions.length, success: results.success },
    })

    return { success: true as const, data: results }
  })

/**
 * Delete all timetable sessions for a class
 */
export const deleteClassTimetable = authServerFn
  .inputValidator(z.object({ classId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const result = await timetableQueries.deleteClassTimetable(data.classId, data.schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la suppression de l\'emploi du temps' }

    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'timetable_sessions',
      recordId: `class-${data.classId}`,
      newValues: { classId: data.classId, schoolYearId: data.schoolYearId },
    })

    return { success: true as const, data: { success: true } }
  })
