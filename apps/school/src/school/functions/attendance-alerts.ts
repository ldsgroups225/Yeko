import {
  acknowledgeAlert as acknowledgeAlertQuery,
  dismissAlert as dismissAlertQuery,
  getActiveAlerts as getActiveAlertsQuery,
  getAlerts as getAlertsQuery,
  resolveAlert as resolveAlertQuery,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getSchoolContext } from '../middleware/school-context'

/**
 * Get active alerts for the school
 */
export const getActiveAlerts = createServerFn()
  .inputValidator(z.object({
    alertType: z.string().optional(),
  }))
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const alerts = await getActiveAlertsQuery(context.schoolId)
    return alerts.map(a => ({
      ...a,
      alert: { ...a.alert, data: a.alert.data as Record<string, any> | null },
    }))
  })

/**
 * Get all alerts with filters
 */
export const getAlerts = createServerFn()
  .inputValidator(z.object({
    status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']).optional(),
    alertType: z.enum(['teacher_repeated_lateness', 'teacher_absence_streak', 'student_chronic_absence', 'student_attendance_drop', 'class_low_attendance']).optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await getAlertsQuery({
      schoolId: context.schoolId,
      ...data,
    })
    return {
      ...result,
      data: result.data.map(alert => ({
        ...alert,
        data: alert.data as Record<string, any> | null,
      })),
    }
  })

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const alert = await acknowledgeAlertQuery(data.id, context.userId)
    if (!alert)
      return undefined
    return { ...alert, data: alert.data as Record<string, any> | null }
  })

/**
 * Dismiss an alert
 */
export const dismissAlert = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const alert = await dismissAlertQuery(data.id, context.userId)
    if (!alert)
      return undefined
    return { ...alert, data: alert.data as Record<string, any> | null }
  })

/**
 * Resolve an alert
 */
export const resolveAlert = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const alert = await resolveAlertQuery(data.id)
    if (!alert)
      return undefined
    return { ...alert, data: alert.data as Record<string, any> | null }
  })
