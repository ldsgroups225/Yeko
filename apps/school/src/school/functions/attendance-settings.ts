import { Result as R } from '@praha/byethrow'
import {
  deleteAttendanceSettings,
  getAttendanceSettings,
  upsertAttendanceSettings,
} from '@repo/data-ops/queries/attendance-settings'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

const attendanceSettingsSchema = z.object({
  teacherExpectedArrival: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  teacherLateThresholdMinutes: z.number().min(1).max(60).optional(),
  teacherLatenessAlertCount: z.number().min(1).max(10).optional(),
  studentLateThresholdMinutes: z.number().min(1).max(60).optional(),
  chronicAbsenceThresholdPercent: z.string().optional(),
  notifyParentOnAbsence: z.boolean().optional(),
  notifyParentOnLate: z.boolean().optional(),
  workingDays: z.array(z.number().min(1).max(7)).optional(),
  notificationMethods: z.array(z.enum(['email', 'sms', 'in_app'])).optional(),
})

/**
 * Get attendance settings for the school
 */
export const getSettings = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('settings', 'view')
    const _result1 = await getAttendanceSettings(context.school.schoolId)
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des paramètres de présence' }
    return { success: true as const, data: _result1.value }
  })

/**
 * Update attendance settings
 */
export const updateSettings = authServerFn
  .inputValidator(attendanceSettingsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    const _result2 = await upsertAttendanceSettings({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la mise à jour des paramètres de présence' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'attendance_settings',
      recordId: schoolId,
      newValues: data,
    })
    return { success: true as const, data: _result2.value }
  })

/**
 * Reset attendance settings to defaults
 */
export const resetSettings = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    const _result3 = await deleteAttendanceSettings(schoolId)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la réinitialisation des paramètres' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'attendance_settings',
      recordId: schoolId,
    })
    return { success: true as const, data: { success: true } }
  })
