/**
 * Attendance Server Functions
 * Handles student attendance tracking during class sessions
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getTeacherContext } from '../middleware/teacher-context'

// Schema for saving individual student attendance
export const saveAttendanceSchema = z.object({
  enrollmentId: z.string(),
  sessionId: z.string(),
  sessionDate: z.string(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional(),
  teacherId: z.string(),
})

// Schema for bulk attendance save
export const bulkAttendanceSchema = z.object({
  classId: z.string(),
  sessionId: z.string(),
  sessionDate: z.string(),
  teacherId: z.string(),
  attendanceRecords: z.array(
    z.object({
      enrollmentId: z.string(),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      notes: z.string().optional(),
    }),
  ),
})

// Schema for getting class roster
export const getClassRosterSchema = z.object({
  classId: z.string(),
  schoolYearId: z.string(),
  date: z.string(),
})

// Schema for getting attendance stats
export const getAttendanceStatsSchema = z.object({
  classId: z.string(),
  schoolYearId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Schema for getting student history
export const getStudentHistorySchema = z.object({
  studentId: z.string(),
  classId: z.string().optional(),
  schoolYearId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

// Get class roster for attendance taking
export const getClassRoster = createServerFn()
  .inputValidator(getClassRosterSchema)
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { getClassRosterForAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const rosterResult = await getClassRosterForAttendance({
      schoolId: context.schoolId,
      classId: data.classId,
      schoolYearId: data.schoolYearId,
      date: data.date,
    })

    if (rosterResult.isErr()) {
      return {
        success: false,
        error: rosterResult.error.message,
        code: rosterResult.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      roster: rosterResult.value,
    }
  })

// Get or create attendance session
export const getOrCreateSession = createServerFn()
  .inputValidator(
    z.object({
      classId: z.string(),
      subjectId: z.string(),
      teacherId: z.string(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { getOrCreateAttendanceSession }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await getOrCreateAttendanceSession({
      schoolId: context.schoolId,
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      session: result.value.session,
      isNew: result.value.isNew,
    }
  })

// Save individual student attendance
export const saveAttendance = createServerFn()
  .inputValidator(saveAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { saveStudentAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await saveStudentAttendance({
      schoolId: context.schoolId,
      enrollmentId: data.enrollmentId,
      sessionId: data.sessionId,
      sessionDate: data.sessionDate,
      status: data.status,
      notes: data.notes,
      teacherId: data.teacherId,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      attendance: result.value.attendance,
      isNew: result.value.isNew,
    }
  })

// Bulk save attendance for multiple students
export const saveBulkAttendance = createServerFn()
  .inputValidator(bulkAttendanceSchema)
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { bulkSaveAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await bulkSaveAttendance({
      schoolId: context.schoolId,
      classId: data.classId,
      sessionId: data.sessionId,
      sessionDate: data.sessionDate,
      teacherId: data.teacherId,
      attendanceRecords: data.attendanceRecords,
    })

    if (result.isErr()) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      count: result.value.count,
    }
  })

// Get attendance statistics for a class
export const getAttendanceStats = createServerFn()
  .inputValidator(getAttendanceStatsSchema)
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { getClassAttendanceStats }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const statsResult = await getClassAttendanceStats({
      schoolId: context.schoolId,
      classId: data.classId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    if (statsResult.isErr()) {
      return {
        success: false,
        error: statsResult.error.message,
        code: statsResult.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      stats: statsResult.value,
    }
  })

// Get attendance history for a student
export const getStudentAttendanceHistory = createServerFn()
  .inputValidator(getStudentHistorySchema)
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { getStudentAttendanceHistory: fetchHistory }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const historyResult = await fetchHistory({
      schoolId: context.schoolId,
      studentId: data.studentId,
      classId: data.classId,
      startDate: data.startDate,
      endDate: data.endDate,
      limit: data.limit,
      offset: data.offset,
    })

    if (historyResult.isErr()) {
      return {
        success: false,
        error: historyResult.error.message,
        code: historyResult.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      history: historyResult.value,
    }
  })

// Get attendance trend for a student
export const getStudentAttendanceTrend = createServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      months: z.number().default(6),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return {
        success: false,
        error: 'Teacher context not found',
      }
    }

    const { getStudentAttendanceTrend: fetchTrend }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const trendResult = await fetchTrend({
      schoolId: context.schoolId,
      studentId: data.studentId,
      months: data.months,
    })

    if (trendResult.isErr()) {
      return {
        success: false,
        error: trendResult.error.message,
        code: trendResult.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      trend: trendResult.value,
    }
  })
