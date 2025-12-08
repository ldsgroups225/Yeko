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

    return getActiveAlertsQuery(context.schoolId)
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

    return getAlertsQuery({
      schoolId: context.schoolId,
      ...data,
    })
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

    return acknowledgeAlertQuery(data.id, context.userId)
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

    return dismissAlertQuery(data.id, context.userId)
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

    return resolveAlertQuery(data.id)
  })
