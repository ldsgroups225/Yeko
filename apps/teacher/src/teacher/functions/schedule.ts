import { getTeacherDetailedSchedule } from '@repo/data-ops/queries/teacher-schedule'
import { createServerFn } from '@tanstack/react-start'
import { addDays, format, parseISO } from 'date-fns'
import { z } from 'zod'

export const getDetailedSchedule = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const detailedData = await getTeacherDetailedSchedule({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    const weekStart = parseISO(data.startDate)
    const sessionsWithDates = detailedData.timetableSessions.map((session) => {
      const sessionDate = addDays(weekStart, session.dayOfWeek - 1)
      const dateStr = format(sessionDate, 'yyyy-MM-dd')

      const substitution = detailedData.substitutionMap[session.id]
      const cancellation = detailedData.cancellationMap[session.id]

      let sessionStatus: 'scheduled' | 'substituted' | 'cancelled' = 'scheduled'

      if (cancellation) {
        sessionStatus = 'cancelled'
      }
      else if (substitution) {
        sessionStatus = 'substituted'
      }

      return {
        ...session,
        date: dateStr,
        hasSession: true,
        sessionStatus,
        statusDetails: null,
      }
    })

    return {
      sessions: sessionsWithDates,
      substitutions: [],
      cancellations: [],
    }
  })

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
    return { substitutions: [] }
  })

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
    return { cancellations: [] }
  })

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
    }),
  )
  .handler(async () => {
    return { success: true, message: 'Request submitted' }
  })
