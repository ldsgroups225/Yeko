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
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { bulkTeacherAttendanceSchema, teacherAttendanceSchema } from '@/schemas/teacher-attendance'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Get daily teacher attendance for a school
 */
export const getDailyAttendance = createServerFn()
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getDailyTeacherAttendance(context.schoolId, data.date)
  })

/**
 * Get teacher attendance for a date range
 */
export const getAttendanceRange = createServerFn()
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
    status: z.enum(['present', 'late', 'absent', 'excused', 'on_leave']).optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getTeacherAttendanceRange({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Record single teacher attendance
 */
export const recordAttendance = createServerFn()
  .inputValidator(teacherAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    // Get school settings for expected arrival time
    const settings = await getAttendanceSettings(context.schoolId)

    const result = await upsertTeacherAttendance({
      ...data,
      schoolId: context.schoolId,
      recordedBy: context.userId,
      expectedArrival: settings.teacherExpectedArrival ?? '07:30',
    })

    // IconCheck for repeated lateness alert
    if (data.status === 'late') {
      const now = new Date()
      const lateCount = await countTeacherLatenessInMonth(
        data.teacherId,
        now.getFullYear(),
        now.getMonth() + 1,
      )

      if (lateCount >= (settings.teacherLatenessAlertCount ?? 3)) {
        return { ...result, alertTriggered: true, lateCount }
      }
    }

    return { ...result, alertTriggered: false }
  })

/**
 * Bulk record teacher attendance
 */
export const bulkRecordAttendance = createServerFn()
  .inputValidator(bulkTeacherAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    // Get school settings
    const settings = await getAttendanceSettings(context.schoolId)

    const results = await bulkUpsertTeacherAttendance({
      schoolId: context.schoolId,
      date: data.date,
      entries: data.entries,
      recordedBy: context.userId,
      expectedArrival: settings.teacherExpectedArrival ?? '07:30',
    })

    return {
      success: true,
      count: results.length,
      data: results,
    }
  })

/**
 * Get teacher punctuality report
 */
export const getPunctualityReport = createServerFn()
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teacherId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getTeacherPunctualityReport({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Delete teacher attendance record
 */
export const removeAttendance = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteTeacherAttendance(data.id)
    return { success: true }
  })
