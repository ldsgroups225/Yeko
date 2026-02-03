import {
  bulkUpsertClassAttendance,
  countStudentAbsences,
  deleteStudentAttendance,
  excuseStudentAbsence,
  getAttendanceSettings,
  getAttendanceStatistics,
  getClassAttendance,
  getStudentAttendanceHistory,
  markParentNotified,
  upsertStudentAttendance,
} from '@repo/data-ops'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import {
  bulkStudentAttendanceSchema,
  excuseAbsenceSchema,
  studentAttendanceSchema,
} from '@/schemas/student-attendance'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

/**
 * Get class attendance for a date
 */
export const getClassAttendanceForDate = authServerFn
  .inputValidator(
    z.object({
      classId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classSessionId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('student_attendance', 'view')

    return (await getClassAttendance(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des présences de la classe' }),
    )
  })

/**
 * Get student attendance history
 */
export const getStudentHistory = authServerFn
  .inputValidator(
    z.object({
      studentId: z.string(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('student_attendance', 'view')

    return (await getStudentAttendanceHistory(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'historique de présence de l\'étudiant' }),
    )
  })

/**
 * Record single student attendance
 */
export const recordStudentAttendance = authServerFn
  .inputValidator(studentAttendanceSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('student_attendance', 'create')

    // Get school settings
    const settingsResult = await getAttendanceSettings(schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: 'Impossible de récupérer les paramètres de présence' }
    }

    const settings = settingsResult.value

    return (await upsertStudentAttendance({
      studentId: data.studentId,
      classId: data.classId,
      date: data.date,
      status: data.status,
      reason: data.reason ?? undefined,
      classSessionId: data.classSessionId ?? undefined,
      schoolId,
      recordedBy: userId,
      lateThresholdMinutes: (settings as any)?.studentLateThresholdMinutes ?? 10,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'student_attendance',
          recordId: result.id,
          newValues: data,
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'enregistrement de la présence' }),
    )
  })

/**
 * Bulk record class attendance
 */
export const bulkRecordClassAttendance = authServerFn
  .inputValidator(bulkStudentAttendanceSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('student_attendance', 'create')

    return (await bulkUpsertClassAttendance({
      classId: data.classId,
      schoolId,
      date: data.date,
      classSessionId: data.classSessionId ?? undefined,
      entries: data.entries.map(entry => ({
        studentId: entry.studentId,
        status: entry.status,
        reason: entry.reason ?? undefined,
      })),
      recordedBy: userId,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'student_attendance',
          recordId: 'bulk',
          newValues: data,
        })
        return {
          success: true as const,
          data: {
            count: result,
            entries: result,
          },
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'enregistrement groupé des présences' }),
    )
  })

/**
 * Excuse student absence
 */
export const excuseAbsence = authServerFn
  .inputValidator(excuseAbsenceSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('student_attendance', 'edit')

    return (await excuseStudentAbsence({
      ...data,
      schoolId,
      excusedBy: userId,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'student_attendance',
          recordId: data.attendanceId,
          newValues: { status: 'excused', reason: data.reason },
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la justification de l\'absence' }),
    )
  })

/**
 * Notify parent of absence
 */
export const notifyParent = authServerFn
  .inputValidator(
    z.object({
      attendanceId: z.string(),
      method: z.enum(['email', 'sms', 'in_app']),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('student_attendance', 'edit')

    // TODO: Implement actual notification sending
    return (await markParentNotified({
      ...data,
      schoolId,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'student_attendance',
          recordId: data.attendanceId,
          newValues: { parentNotified: true, method: data.method },
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la notification des parents' }),
    )
  })

/**
 * Get attendance statistics
 */
export const getStatistics = authServerFn
  .inputValidator(
    z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('student_attendance', 'view')

    return (await getAttendanceStatistics({
      schoolId: context.school.schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des statistiques de présence' }),
    )
  })

/**
 * IconCheck chronic absence for a student
 */
export const checkChronicAbsence = authServerFn
  .inputValidator(
    z.object({
      studentId: z.string(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('student_attendance', 'view')

    const { schoolId } = context.school
    const settingsResult = await getAttendanceSettings(schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: 'Impossible de récupérer les paramètres de présence' }
    }

    const settings = settingsResult.value
    const threshold = Number((settings as any)?.chronicAbsenceThresholdPercent ?? 10)

    return (await countStudentAbsences({
      ...data,
      excludeExcused: true,
    })).match(
      (absenceCount) => {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const schoolDays = Math.floor((diffDays * 5) / 7)

        const absenceRate = schoolDays > 0 ? (absenceCount / schoolDays) * 100 : 0

        return {
          success: true as const,
          data: {
            absenceCount,
            schoolDays,
            absenceRate: Math.round(absenceRate * 100) / 100,
            isChronicAbsent: absenceRate >= threshold,
            threshold,
          },
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors du calcul de l\'absentéisme chronique' }),
    )
  })

/**
 * Delete student attendance record
 */
export const removeStudentAttendance = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('student_attendance', 'delete')

    return (await deleteStudentAttendance(data.id, schoolId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'student_attendance',
          recordId: data.id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de la présence' }),
    )
  })
