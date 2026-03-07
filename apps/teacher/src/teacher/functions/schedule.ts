import { Result as R } from '@praha/byethrow'
import { getTeacherSessionHistory } from '@repo/data-ops/queries/teacher-app'
import { getTeacherDetailedSchedule } from '@repo/data-ops/queries/teacher-schedule'
import { createServerFn } from '@tanstack/react-start'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { z } from 'zod'
import { getTeacherContext } from '../middleware/teacher-context'

export const getDetailedSchedule = createServerFn()
  .inputValidator(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getTeacherContext()
    if (!context) {
      return { sessions: [], substitutions: [], cancellations: [] }
    }

    const detailedDataResult = await getTeacherDetailedSchedule({
      teacherId: context.teacherId,
      schoolYearId: context.schoolYearId ?? '',
      startDate: data.startDate,
      endDate: data.endDate,
    })

    if (R.isFailure(detailedDataResult)) {
      return {
        sessions: [],
        substitutions: [],
        cancellations: [],
      }
    }

    const detailedData = detailedDataResult.value

    const referenceDate = parseISO(data.startDate)
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
    const weekEnd = addDays(weekStart, 6)

    const sessionHistoryResult = await getTeacherSessionHistory({
      teacherId: context.teacherId,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      page: 1,
      pageSize: 500,
    })

    const slotSessionStatus = new Map<string, 'scheduled' | 'completed' | 'cancelled'>()

    if (R.isSuccess(sessionHistoryResult)) {
      for (const session of sessionHistoryResult.value.sessions) {
        if (!session.timetableSessionId)
          continue
        if (session.status === 'cancelled')
          continue

        const key = `${session.timetableSessionId}|${session.date}`
        const existingStatus = slotSessionStatus.get(key)

        // Prefer completed over scheduled when duplicates exist from legacy behavior.
        if (!existingStatus || session.status === 'completed') {
          slotSessionStatus.set(key, session.status)
        }
      }
    }

    const sessionsWithDates = detailedData.timetableSessions.map((session) => {
      const sessionDate = addDays(weekStart, session.dayOfWeek - 1)
      const dateStr = format(sessionDate, 'yyyy-MM-dd')
      const sessionRecordStatus = slotSessionStatus.get(`${session.id}|${dateStr}`) ?? null

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
        hasSession: sessionRecordStatus !== null,
        sessionRecordStatus,
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
