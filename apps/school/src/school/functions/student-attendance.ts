import {
  bulkUpsertClassAttendance,
  countStudentAbsences,
  deleteStudentAttendance,
  excuseStudentAbsence,
  getAttendanceSettings,
  getAttendanceStatistics,
  getClassAttendance,
  getStudentAttendanceHistory,
  markParentNotified,
  upsertStudentAttendance,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { bulkStudentAttendanceSchema, excuseAbsenceSchema, studentAttendanceSchema } from '@/schemas/student-attendance'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Get class attendance for a date
 */
export const getClassAttendanceForDate = createServerFn()
  .inputValidator(z.object({
    classId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    classSessionId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getClassAttendance(data)
  })

/**
 * Get student attendance history
 */
export const getStudentHistory = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    classId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getStudentAttendanceHistory(data)
  })

/**
 * Record single student attendance
 */
export const recordStudentAttendance = createServerFn()
  .inputValidator(studentAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    // Get school settings
    const settings = await getAttendanceSettings(context.schoolId)

    const result = await upsertStudentAttendance({
      ...data,
      schoolId: context.schoolId,
      recordedBy: context.userId,
      lateThresholdMinutes: settings.studentLateThresholdMinutes ?? 10,
    })

    return result
  })

/**
 * Bulk record class attendance
 */
export const bulkRecordClassAttendance = createServerFn()
  .inputValidator(bulkStudentAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const results = await bulkUpsertClassAttendance({
      classId: data.classId,
      schoolId: context.schoolId,
      date: data.date,
      classSessionId: data.classSessionId ?? undefined,
      entries: data.entries,
      recordedBy: context.userId,
    })

    return {
      success: true,
      count: results.length,
      data: results,
    }
  })

/**
 * Excuse student absence
 */
export const excuseAbsence = createServerFn()
  .inputValidator(excuseAbsenceSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const result = await excuseStudentAbsence({
      ...data,
      excusedBy: context.userId,
    })

    return result
  })

/**
 * Notify parent of absence
 */
export const notifyParent = createServerFn()
  .inputValidator(z.object({
    attendanceId: z.string(),
    method: z.enum(['email', 'sms', 'in_app']),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    // TODO: Implement actual notification sending
    const result = await markParentNotified(data)

    return result
  })

/**
 * Get attendance statistics
 */
export const getStatistics = createServerFn()
  .inputValidator(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    classId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return getAttendanceStatistics({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Check chronic absence for a student
 */
export const checkChronicAbsence = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const settings = await getAttendanceSettings(context.schoolId)
    const threshold = Number(settings.chronicAbsenceThresholdPercent ?? 10)

    const absenceCount = await countStudentAbsences({
      ...data,
      excludeExcused: true,
    })

    // Calculate total school days (simplified)
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const schoolDays = Math.floor(diffDays * 5 / 7)

    const absenceRate = schoolDays > 0 ? (absenceCount / schoolDays) * 100 : 0

    return {
      absenceCount,
      schoolDays,
      absenceRate: Math.round(absenceRate * 100) / 100,
      isChronicAbsent: absenceRate >= threshold,
      threshold,
    }
  })

/**
 * Delete student attendance record
 */
export const removeStudentAttendance = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteStudentAttendance(data.id)
    return { success: true }
  })
