/**
 * Attendance Server Functions
 * Handles student attendance tracking during class sessions
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
    const { getClassRosterForAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const roster = await getClassRosterForAttendance({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
      date: data.date,
    })

    return {
      success: true,
      roster,
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
    const { getOrCreateAttendanceSession }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await getOrCreateAttendanceSession({
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    })

    return {
      success: true,
      session: result.session,
      isNew: result.isNew,
    }
  })

// Save individual student attendance
export const saveAttendance = createServerFn()
  .inputValidator(saveAttendanceSchema)
  .handler(async ({ data }) => {
    const { saveStudentAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await saveStudentAttendance({
      enrollmentId: data.enrollmentId,
      sessionId: data.sessionId,
      sessionDate: data.sessionDate,
      status: data.status,
      notes: data.notes,
      teacherId: data.teacherId,
    })

    return {
      success: true,
      attendance: result.attendance,
      isNew: result.isNew,
    }
  })

// Bulk save attendance for multiple students
export const saveBulkAttendance = createServerFn()
  .inputValidator(bulkAttendanceSchema)
  .handler(async ({ data }) => {
    const { bulkSaveAttendance }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const result = await bulkSaveAttendance({
      classId: data.classId,
      sessionId: data.sessionId,
      sessionDate: data.sessionDate,
      teacherId: data.teacherId,
      attendanceRecords: data.attendanceRecords,
    })

    return {
      ...result,
    }
  })

// Get attendance statistics for a class
export const getAttendanceStats = createServerFn()
  .inputValidator(getAttendanceStatsSchema)
  .handler(async ({ data }) => {
    const { getClassAttendanceStats }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const stats = await getClassAttendanceStats({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    return {
      success: true,
      stats,
    }
  })

// Get attendance history for a student
export const getStudentAttendanceHistory = createServerFn()
  .inputValidator(getStudentHistorySchema)
  .handler(async ({ data }) => {
    const { getStudentAttendanceHistory: fetchHistory }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const history = await fetchHistory({
      studentId: data.studentId,
      classId: data.classId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
      limit: data.limit,
      offset: data.offset,
    })

    return {
      success: true,
      history,
    }
  })

// Get attendance trend for a student
export const getStudentAttendanceTrend = createServerFn()
  .inputValidator(
    z.object({
      studentId: z.string(),
      schoolYearId: z.string(),
      months: z.number().default(6),
    }),
  )
  .handler(async ({ data }) => {
    const { getStudentAttendanceTrend: fetchTrend }
      = await import('@repo/data-ops/queries/teacher-student-attendance')
    const trend = await fetchTrend({
      studentId: data.studentId,
      schoolYearId: data.schoolYearId,
      months: data.months,
    })

    return {
      success: true,
      trend,
    }
  })
