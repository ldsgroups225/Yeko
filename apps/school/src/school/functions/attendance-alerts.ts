import type { ServerContext } from '../lib/server-fn'
import {
  acknowledgeAlert as acknowledgeAlertQuery,
  dismissAlert as dismissAlertQuery,
  getActiveAlerts as getActiveAlertsQuery,
  getAlerts as getAlertsQuery,
  resolveAlert as resolveAlertQuery,
} from '@repo/data-ops'

import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Get active alerts for the school
 */
export const getActiveAlerts = createAuthenticatedServerFn()
  .inputValidator(z.object({
    alertType: z.string().optional(),
  }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getActiveAlertsQuery(context.school.schoolId).match(
      alerts => ({
        success: true as const,
        data: alerts.map(a => ({
          ...a,
          alert: { ...a.alert, data: a.alert.data as Record<string, any> | null },
        })),
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get all alerts with filters
 */
export const getAlerts = createAuthenticatedServerFn()
  .inputValidator(z.object({
    status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']).optional(),
    alertType: z.enum(['teacher_repeated_lateness', 'teacher_absence_streak', 'student_chronic_absence', 'student_attendance_drop', 'class_low_attendance']).optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getAlertsQuery({
      schoolId: context.school.schoolId,
      ...data,
    }).match(
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
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return acknowledgeAlertQuery(data.id, context.auth.userId, context.school.schoolId).match(
      alert => ({
        success: true as const,
        data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Dismiss an alert
 */
export const dismissAlert = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return dismissAlertQuery(data.id, context.auth.userId, context.school.schoolId).match(
      alert => ({
        success: true as const,
        data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Resolve an alert
 */
export const resolveAlert = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return resolveAlertQuery(data.id, context.school.schoolId).match(
      alert => ({
        success: true as const,
        data: alert ? { ...alert, data: alert.data as Record<string, any> | null } : undefined,
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })
