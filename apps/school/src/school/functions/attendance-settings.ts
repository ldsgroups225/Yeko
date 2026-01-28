import type { ServerContext } from '../lib/server-fn'
import {
  deleteAttendanceSettings,
  getAttendanceSettings,
  upsertAttendanceSettings,
} from '@repo/data-ops'

import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'

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
export const getSettings = createAuthenticatedServerFn()
  .handler(async ({ context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getAttendanceSettings(context.school.schoolId).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update attendance settings
 */
export const updateSettings = createAuthenticatedServerFn()
  .inputValidator(attendanceSettingsSchema)
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return upsertAttendanceSettings({
      schoolId: context.school.schoolId,
      ...data,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Reset attendance settings to defaults
 */
export const resetSettings = createAuthenticatedServerFn()
  .handler(async ({ context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return deleteAttendanceSettings(context.school.schoolId).match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })
