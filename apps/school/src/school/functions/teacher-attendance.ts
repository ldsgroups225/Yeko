import type { ServerContext } from '../lib/server-fn'
import {
  bulkUpsertTeacherAttendance,
  countTeacherLatenessInMonth,
  deleteTeacherAttendance,
  getAttendanceSettings,
  getDailyTeacherAttendance,
  getTeacherAttendanceRange,
  getTeacherPunctualityReport,
  upsertTeacherAttendance,
} from '@repo/data-ops'

import { z } from 'zod'
import { bulkTeacherAttendanceSchema, teacherAttendanceSchema } from '@/schemas/teacher-attendance'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Get daily teacher attendance for a school
 */
export const getDailyAttendance = createAuthenticatedServerFn()
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getDailyTeacherAttendance(context.school.schoolId, data.date).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get teacher attendance for a date range
 */
export const getAttendanceRange = createAuthenticatedServerFn()
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
    status: z.enum(['present', 'late', 'absent', 'excused', 'on_leave']).optional(),
  }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getTeacherAttendanceRange({
      schoolId: context.school.schoolId,
      ...data,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Record single teacher attendance
 */
export const recordAttendance = createAuthenticatedServerFn()
  .inputValidator(teacherAttendanceSchema)
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    // Get school settings for expected arrival time
    const settingsResult = await getAttendanceSettings(context.school.schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: settingsResult.error.message }
    }
    const settings = settingsResult.value

    return upsertTeacherAttendance({
      ...data,
      schoolId: context.school.schoolId,
      recordedBy: context.auth.userId,
      expectedArrival: (settings as any)?.teacherExpectedArrival ?? '07:30',
    }).match(
      async (result) => {
        // IconCheck for repeated lateness alert
        if (data.status === 'late') {
          const now = new Date()
          const lateCountResult = await countTeacherLatenessInMonth(
            data.teacherId,
            now.getFullYear(),
            now.getMonth() + 1,
          )

          if (lateCountResult.isOk() && lateCountResult.value >= ((settings as any)?.teacherLatenessAlertCount ?? 3)) {
            return { success: true as const, data: { ...result, alertTriggered: true, lateCount: lateCountResult.value } }
          }
        }
        return { success: true as const, data: { ...result, alertTriggered: false } }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Bulk record teacher attendance
 */
export const bulkRecordAttendance = createAuthenticatedServerFn()
  .inputValidator(bulkTeacherAttendanceSchema)
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    // Get school settings
    const settingsResult = await getAttendanceSettings(context.school.schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: settingsResult.error.message }
    }
    const settings = settingsResult.value

    return bulkUpsertTeacherAttendance({
      schoolId: context.school.schoolId,
      date: data.date,
      entries: data.entries,
      recordedBy: context.auth.userId,
      expectedArrival: (settings as any)?.teacherExpectedArrival ?? '07:30',
    }).match(
      result => ({
        success: true as const,
        count: result.length,
        data: result,
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get teacher punctuality report
 */
export const getPunctualityReport = createAuthenticatedServerFn()
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
  }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getTeacherPunctualityReport({
      schoolId: context.school.schoolId,
      ...data,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete teacher attendance record
 */
export const removeAttendance = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return deleteTeacherAttendance(data.id, context.school.schoolId).match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })
