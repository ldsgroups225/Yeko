import {
  acknowledgeAlert as acknowledgeAlertQuery,
  dismissAlert as dismissAlertQuery,
  getActiveAlerts as getActiveAlertsQuery,
  getAlerts as getAlertsQuery,
  resolveAlert as resolveAlertQuery,
} from '@repo/data-ops'
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
    await requirePermission('student_attendance', 'view')

    return (await getActiveAlertsQuery(schoolId)).match(
      alerts => ({
        success: true as const,
        data: alerts.map(a => ({
          ...a,
          alert: { ...a.alert, data: a.alert.data as Record<string, any> | null },
        })),
      }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des alertes actives' }),
    )
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
    await requirePermission('student_attendance', 'view')

    return (await getAlertsQuery({
      schoolId,
      ...data,
    })).match(
      result => ({
        success: true as const,
        data: {
          ...result,
          data: result.data.map(alert => ({
            ...alert,
            data: alert.data as Record<string, any> | null,
          })),
        },
      }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des alertes' }),
    )
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
    await requirePermission('student_attendance', 'edit')

    return (await acknowledgeAlertQuery(data.id, auth.userId, school.schoolId)).match(
      async (alert) => {
        if (alert) {
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
          data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'acquittement de l\'alerte' }),
    )
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
    await requirePermission('student_attendance', 'edit')

    return (await dismissAlertQuery(data.id, auth.userId, school.schoolId)).match(
      async (alert) => {
        if (alert) {
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
          data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors du rejet de l\'alerte' }),
    )
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
    await requirePermission('student_attendance', 'edit')

    return (await resolveAlertQuery(data.id, schoolId)).match(
      async (alert) => {
        if (alert) {
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
          data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
        }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la résolution de l\'alerte' }),
    )
  })
