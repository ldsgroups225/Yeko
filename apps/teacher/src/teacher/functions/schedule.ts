import {
  getTeacherCancelledSessions,
  getTeacherClassSessions,
  getTeacherDetailedSchedule,
  getTeacherSubstitutionHistory,
  getTeacherSubstitutions,
} from '@repo/data-ops/queries/teacher-schedule'
import { createServerFn } from '@tanstack/react-start'
import { addDays, format, parseISO } from 'date-fns'
import { z } from 'zod'

// ============================================
// DETAILED SCHEDULE
// ============================================

/**
 * Get detailed schedule with substitutions and cancellations
 */
export const getDetailedSchedule = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string(), // ISO date
      endDate: z.string(), // ISO date
    }),
  )
  .handler(async () => {
    const detailedData = await getTeacherDetailedSchedule({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    // Compute actual dates for the week and enrich sessions with status
    const weekStart = parseISO(data.startDate)
    const sessionsWithDates = detailedData.timetableSessions.map(session => {
      const sessionDate = addDays(weekStart, session.dayOfWeek - 1)
      const dateStr = format(sessionDate, 'yyyy-MM-dd')

      const substitution = detailedData.substitutionMap[session.id]
      const cancellation = detailedData.cancellationMap[session.id]

      let sessionStatus: 'scheduled' | 'substituted' | 'cancelled' = 'scheduled'
      let statusDetails: Record<string, unknown> | null = null

      if (cancellation) {
        sessionStatus = 'cancelled'
        statusDetails = {
          reason: cancellation.notes,
          date: cancellation.date,
        }
      }
      else if (substitution) {
        sessionStatus = 'substituted'
        statusDetails = {
          date: substitution.date,
          originalTeacherId: substitution.originalTeacherId,
        }
      }

      return {
        ...session,
        date: dateStr,
        hasSession: true,
        sessionStatus,
        statusDetails,
      }
    })

    return {
      sessions: sessionsWithDates,
      substitutions: detailedData.classSessions.filter(
        s => s.teacherId !== detailedData.timetableSessions.find(t => t.id === s.timetableSessionId)?.teacherId,
      ),
      cancellations: Object.values(detailedData.cancellationMap),
    }
  })

// ============================================
// SUBSTITUTIONS
// ============================================

/**
 * Get current and upcoming substitutions for a teacher
 */
export const getTeacherSubstitutionsFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async () => {
    const substitutions = await getTeacherSubstitutions({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    return {
      substitutions: substitutions.map(sub => ({
        id: sub.id,
        classSessionId: sub.classSessionId,
        date: sub.date,
        startTime: sub.startTime,
        endTime: sub.endTime,
        status: sub.status,
        originalTeacherId: sub.originalTeacherId,
        class: sub.class,
        subject: sub.subject,
        reason: sub.reason,
      })),
    }
  })

/**
 * Get teacher's substitution history
 */
export const getSubstitutionHistory = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
  )
  .handler(async () => {
    const history = await getTeacherSubstitutionHistory({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
      page: data.page,
      pageSize: data.pageSize,
    })

    return history
  })

// ============================================
// CANCELLATIONS
// ============================================

/**
 * Get cancelled sessions for a teacher
 */
export const getCancelledSessions = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async () => {
    const cancellations = await getTeacherCancelledSessions({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    return {
      cancellations: cancellations.map(c => ({
        id: c.id,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        reason: c.reason,
        class: c.class,
        subject: c.subject,
      })),
    }
  })

// ============================================
// CLASS SESSIONS
// ============================================

/**
 * Get all class sessions for a teacher
 */
export const getTeacherClassSessionsFn = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async () => {
    const sessions = await getTeacherClassSessions({
      teacherId: data.teacherId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    return {
      sessions: sessions.map(s => ({
        id: s.id,
        classId: s.classId,
        subjectId: s.subjectId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        className: s.className,
        subjectName: s.subjectName,
      })),
    }
  })

// ============================================
// SCHEDULE CHANGE REQUESTS (Placeholder)
// ============================================

/**
 * Request a schedule change
 * Note: This is a placeholder - requires schedule_change_requests table
 */
export const requestScheduleChange = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      requestType: z.enum(['swap', 'absence', 'room_change', 'time_change', 'cancel']),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      reason: z.string(),
      classId: z.string().optional(),
      subjectId: z.string().optional(),
    }),
  )
  .handler(async () => {
    // Placeholder - would create a schedule_change_requests record
    // For now, return a mock response
    return {
      success: true,
      message: 'Schedule change request submitted (placeholder)',
      requestId: `req_${Date.now()}`,
      status: 'pending',
    }
  })

/**
 * Get schedule change requests for a teacher
 * Note: This is a placeholder - requires schedule_change_requests table
 */
export const getScheduleChangeRequests = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    // Placeholder - would query schedule_change_requests table
    return {
      requests: [],
      total: 0,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 20,
    }
  })

/**
 * Cancel a schedule change request
 * Note: This is a placeholder - requires schedule_change_requests table
 */
export const cancelScheduleChangeRequest = createServerFn()
  .inputValidator(
    z.object({
      requestId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async () => {
    // Placeholder - would update schedule_change_requests record
    return {
      success: true,
      message: 'Schedule change request cancelled (placeholder)',
    }
  })
