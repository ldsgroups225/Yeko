import type { ServerContext } from '../lib/server-fn'
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

import { z } from 'zod'
import {
  bulkStudentAttendanceSchema,
  excuseAbsenceSchema,
  studentAttendanceSchema,
} from '@/schemas/student-attendance'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Get class attendance for a date
 */
export const getClassAttendanceForDate = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      classId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classSessionId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getClassAttendance(data).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get student attendance history
 */
export const getStudentHistory = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getStudentAttendanceHistory(data).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Record single student attendance
 */
export const recordStudentAttendance = createAuthenticatedServerFn()
  .inputValidator(studentAttendanceSchema)
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

    return upsertStudentAttendance({
      studentId: data.studentId,
      classId: data.classId,
      date: data.date,
      status: data.status,
      reason: data.reason ?? undefined,
      classSessionId: data.classSessionId ?? undefined,
      schoolId: context.school.schoolId,
      recordedBy: context.auth.userId,
      lateThresholdMinutes: (settings as any)?.studentLateThresholdMinutes ?? 10,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Bulk record class attendance
 */
export const bulkRecordClassAttendance = createAuthenticatedServerFn()
  .inputValidator(bulkStudentAttendanceSchema)
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return bulkUpsertClassAttendance({
      classId: data.classId,
      schoolId: context.school.schoolId,
      date: data.date,
      classSessionId: data.classSessionId ?? undefined,
      entries: data.entries.map(entry => ({
        studentId: entry.studentId,
        status: entry.status,
        reason: entry.reason ?? undefined,
      })),
      recordedBy: context.auth.userId,
    }).match(
      result => ({
        success: true as const,
        count: result,
        data: result,
      }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Excuse student absence
 */
export const excuseAbsence = createAuthenticatedServerFn()
  .inputValidator(excuseAbsenceSchema)
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return excuseStudentAbsence({
      ...data,
      schoolId: context.school.schoolId,
      excusedBy: context.auth.userId,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Notify parent of absence
 */
export const notifyParent = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      attendanceId: z.string(),
      method: z.enum(['email', 'sms', 'in_app']),
    }),
  )
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    // TODO: Implement actual notification sending
    return markParentNotified({
      ...data,
      schoolId: context.school.schoolId,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get attendance statistics
 */
export const getStatistics = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      classId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return getAttendanceStatistics({
      schoolId: context.school.schoolId,
      ...data,
    }).match(
      result => ({ success: true as const, data: result }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * IconCheck chronic absence for a student
 */
export const checkChronicAbsence = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    const settingsResult = await getAttendanceSettings(context.school.schoolId)
    if (settingsResult.isErr()) {
      return { success: false as const, error: settingsResult.error.message }
    }

    const settings = settingsResult.value
    const threshold = Number((settings as any)?.chronicAbsenceThresholdPercent ?? 10)

    return countStudentAbsences({
      ...data,
      excludeExcused: true,
    }).match(
      (absenceCount) => {
        // Calculate total school days (simplified)
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const schoolDays = Math.floor((diffDays * 5) / 7)

        const absenceRate = schoolDays > 0 ? (absenceCount / schoolDays) * 100 : 0

        return {
          success: true as const,
          data: {
            absenceCount,
            schoolDays,
            absenceRate: Math.round(absenceRate * 100) / 100,
            isChronicAbsent: absenceRate >= threshold,
            threshold,
          },
        }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete student attendance record
 */
export const removeStudentAttendance = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context: unknownContext }) => {
    const context = unknownContext as unknown as ServerContext
    if (!context.school)
      return { success: false as const, error: 'No school context' }

    return deleteStudentAttendance(data.id, context.school.schoolId).match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })
