import { Result as R } from '@praha/byethrow'
import {
  acknowledgeAlert as acknowledgeAlertQuery,
  dismissAlert as dismissAlertQuery,
  getActiveAlerts as getActiveAlertsQuery,
  getAlerts as getAlertsQuery,
  resolveAlert as resolveAlertQuery,
} from '@repo/data-ops/queries/attendance-alerts'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

/**
 * Get active alerts for the school
 */
export const getActiveAlerts = authServerFn
  .inputValidator(z.object({
    alertType: z.string().optional(),
  }))
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('attendance', 'view')

    const _result1 = await getActiveAlertsQuery(schoolId)
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des alertes actives' }
    return {
      success: true as const,
      data: _result1.value.map(a => ({
        ...a,
        alert: { ...a.alert, data: a.alert.data as Record<string, any> | null },
      })),
    }
  })

/**
 * Get all alerts with filters
 */
export const getAlerts = authServerFn
  .inputValidator(z.object({
    status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']).optional(),
    alertType: z.enum(['teacher_repeated_lateness', 'teacher_absence_streak', 'student_chronic_absence', 'student_attendance_drop', 'class_low_attendance']).optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('attendance', 'view')

    const _result2 = await getAlertsQuery({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération des alertes' }
    return {
      success: true as const,
      data: {
        ..._result2.value,
        data: _result2.value.data.map(alert => ({
          ...alert,
          data: alert.data as Record<string, any> | null,
        })),
      },
    }
  })

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { auth, school } = context
    await requirePermission('attendance', 'edit')

    const _result3 = await acknowledgeAlertQuery(data.id, auth.userId, school.schoolId)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de l\'acquittement de l\'alerte' }
    if (_result3.value) {
      await createAuditLog({
        schoolId: school.schoolId,
        userId: school.userId,
        action: 'update',
        tableName: 'attendance_alerts',
        recordId: data.id,
        newValues: { status: 'acknowledged' },
      })
    }
    return {
      success: true as const,
      data: _result3.value ? { ..._result3.value, data: _result3.value.data as Record<string, any> | null } : undefined,
    }
  })

/**
 * Dismiss an alert
 */
export const dismissAlert = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { auth, school } = context
    await requirePermission('attendance', 'edit')

    const _result4 = await dismissAlertQuery(data.id, auth.userId, school.schoolId)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors du rejet de l\'alerte' }
    if (_result4.value) {
      await createAuditLog({
        schoolId: school.schoolId,
        userId: school.userId,
        action: 'update',
        tableName: 'attendance_alerts',
        recordId: data.id,
        newValues: { status: 'dismissed' },
      })
    }
    return {
      success: true as const,
      data: _result4.value ? { ..._result4.value, data: _result4.value.data as Record<string, any> | null } : undefined,
    }
  })

/**
 * Resolve an alert
 */
export const resolveAlert = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('attendance', 'edit')

    const _result5 = await resolveAlertQuery(data.id, schoolId)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la résolution de l\'alerte' }
    if (_result5.value) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'attendance_alerts',
        recordId: data.id,
        newValues: { status: 'resolved' },
      })
    }
    return {
      success: true as const,
      data: _result5.value ? { ..._result5.value, data: _result5.value.data as Record<string, any> | null } : undefined,
    }
  })
