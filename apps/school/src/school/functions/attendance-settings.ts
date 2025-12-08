import {
  deleteAttendanceSettings,
  getAttendanceSettings,
  upsertAttendanceSettings,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getSchoolContext } from '../middleware/school-context'

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
export const getSettings = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getAttendanceSettings(context.schoolId)
  })

/**
 * Update attendance settings
 */
export const updateSettings = createServerFn()
  .inputValidator(attendanceSettingsSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await upsertAttendanceSettings({
      schoolId: context.schoolId,
      ...data,
    })

    return result
  })

/**
 * Reset attendance settings to defaults
 */
export const resetSettings = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteAttendanceSettings(context.schoolId)
    return { success: true }
  })
