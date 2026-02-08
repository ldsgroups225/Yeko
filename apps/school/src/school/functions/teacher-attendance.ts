import { getAttendanceSettings } from '@repo/data-ops/queries/attendance-settings'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  bulkUpsertTeacherAttendance,
  countTeacherLatenessInMonth,
  deleteTeacherAttendance,
  getDailyTeacherAttendance,
  getTeacherAttendanceRange,
  getTeacherPunctualityReport,
  upsertTeacherAttendance,
} from '@repo/data-ops/queries/teacher-attendance'
import { z } from 'zod'
import { bulkTeacherAttendanceSchema, teacherAttendanceSchema } from '@/schemas/teacher-attendance'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

/**
 * Get daily teacher attendance for a school
 */
export const getDailyAttendance = authServerFn
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('attendance', 'view')

    return (await getDailyTeacherAttendance(context.school.schoolId, data.date)).match(
      result => ({ success: true as const, data: result }),
      _error => ({ success: false as const, error: 'Erreur lors de la récupération des présences du jour' }),
    )
  })

/**
 * Get teacher attendance for a date range
 */
export const getAttendanceRange = authServerFn
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
    status: z.enum(['present', 'late', 'absent', 'excused', 'on_leave']).optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('attendance', 'view')

    return (await getTeacherAttendanceRange({
      schoolId: context.school.schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _error => ({ success: false as const, error: 'Erreur lors de la récupération des présences sur la période' }),
    )
  })

/**
 * Record single teacher attendance
 */
export const recordAttendance = authServerFn
  .inputValidator(teacherAttendanceSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('attendance', 'create')

    // Get school settings for expected arrival time
    const settingsResult = await getAttendanceSettings(schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: 'Impossible de récupérer les paramètres de présence' }
    }
    const settings = settingsResult.value

    return (await upsertTeacherAttendance({
      ...data,
      schoolId,
      recordedBy: userId,
      expectedArrival: settings?.teacherExpectedArrival ?? '07:30',
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'teacher_attendance',
          recordId: result.id,
          newValues: data,
        })

        // Check for repeated lateness alert
        if (data.status === 'late') {
          const now = new Date()
          const lateCountResult = await countTeacherLatenessInMonth(
            data.teacherId,
            now.getFullYear(),
            now.getMonth() + 1,
          )

          if (lateCountResult.isOk() && lateCountResult.value >= (settings?.teacherLatenessAlertCount ?? 3)) {
            return { success: true as const, data: { ...result, alertTriggered: true, lateCount: lateCountResult.value } }
          }
        }
        return { success: true as const, data: { ...result, alertTriggered: false } }
      },
      _error => ({ success: false as const, error: 'Erreur lors de l\'enregistrement de la présence' }),
    )
  })

/**
 * Bulk record teacher attendance
 */
export const bulkRecordAttendance = authServerFn
  .inputValidator(bulkTeacherAttendanceSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('attendance', 'create')

    // Get school settings
    const settingsResult = await getAttendanceSettings(schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: 'Impossible de récupérer les paramètres de présence' }
    }
    const settings = settingsResult.value

    return (await bulkUpsertTeacherAttendance({
      schoolId,
      date: data.date,
      entries: data.entries,
      recordedBy: userId,
      expectedArrival: settings.teacherExpectedArrival ?? '07:30',
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'teacher_attendance',
          recordId: 'bulk',
          newValues: data,
        })

        return {
          success: true as const,
          data: {
            count: result.length,
            entries: result,
          },
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'enregistrement groupé des présences' }),
    )
  })

/**
 * Get teacher punctuality report
 */
export const getPunctualityReport = authServerFn
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('attendance', 'view')

    return (await getTeacherPunctualityReport({
      schoolId: context.school.schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _error => ({ success: false as const, error: 'Erreur lors de la génération du rapport de ponctualité' }),
    )
  })

/**
 * Delete teacher attendance record
 */
export const removeAttendance = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('attendance', 'delete')

    return (await deleteTeacherAttendance(data.id, schoolId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'teacher_attendance',
          recordId: data.id,
        })
        return { success: true as const, data: { success: true } }
      },
      _error => ({ success: false as const, error: 'Erreur lors de la suppression de la présence' }),
    )
  })
