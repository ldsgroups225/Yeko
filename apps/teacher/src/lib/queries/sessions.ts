import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { getParticipationGrades, recordParticipation } from '@/teacher/functions/participation'
import {
  completeSession,
  getSessionDetails,
  getSessionHistory,
  getSessionStudents,
  updateSessionAttendance,
} from '@/teacher/functions/sessions'
import { teacherMutationKeys } from './keys'

interface SessionDetailsParams {
  sessionId: string
}

export function sessionDetailsQueryOptions(params: SessionDetailsParams) {
  return queryOptions({
    queryKey: ['teacher', 'session', params.sessionId],
    queryFn: () => getSessionDetails({ data: params }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

interface SessionHistoryParams {
  teacherId: string
  classId?: string
  subjectId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export function sessionHistoryQueryOptions(params: SessionHistoryParams) {
  return queryOptions({
    queryKey: ['teacher', 'sessions', 'history', params.teacherId, params.classId, params.page],
    queryFn: () =>
      getSessionHistory({
        data: {
          teacherId: params.teacherId,
          classId: params.classId,
          subjectId: params.subjectId,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }),
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  })
}

interface SessionStudentsParams {
  classId: string
  schoolYearId: string
}

export function sessionStudentsQueryOptions(params: SessionStudentsParams) {
  return queryOptions({
    queryKey: ['teacher', 'session', 'students', params.classId],
    queryFn: () => getSessionStudents({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

interface ParticipationParams {
  classSessionId: string
}

export function participationGradesQueryOptions(params: ParticipationParams) {
  return queryOptions({
    queryKey: ['teacher', 'participation', params.classSessionId],
    queryFn: () => getParticipationGrades({ data: params }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

interface ClassStudentsParams {
  classId: string
  schoolYearId: string
  subjectId?: string
}

export function classStudentsQueryOptions(params: ClassStudentsParams) {
  return queryOptions({
    queryKey: ['teacher', 'class', 'students', params.classId, params.subjectId],
    queryFn: () => getSessionStudents({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Sessions mutations
export const sessionsMutations = {
  saveParticipation: {
    mutationKey: teacherMutationKeys.sessions.saveParticipation,
    mutationFn: (data: Parameters<typeof recordParticipation>[0]['data']) => recordParticipation({ data }),
  },
  saveAttendance: {
    mutationKey: teacherMutationKeys.sessions.saveAttendance,
    mutationFn: (data: Parameters<typeof updateSessionAttendance>[0]['data']) => updateSessionAttendance({ data }),
  },
  complete: {
    mutationKey: teacherMutationKeys.sessions.complete,
    mutationFn: (data: Parameters<typeof completeSession>[0]['data']) => completeSession({ data }),
  },
}
