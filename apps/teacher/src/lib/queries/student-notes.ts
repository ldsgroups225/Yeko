/**
 * Student Notes Queries
 * TanStack Query options for student notes and behavior tracking
 */
import { queryOptions } from '@tanstack/react-query'

import {
  getStudentNotes,
  getBehaviorSummary,
  getNotesTrend,
} from '@/teacher/functions/student-notes'

// Options for getting student notes
export function studentNotesQueryOptions(params: {
  studentId: string
  classId?: string
  type?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  return queryOptions({
    queryKey: ['notes', 'student', params.studentId, params.type, params.offset],
    queryFn: () => getStudentNotes({ data: params }),
    staleTime: 2 * 60 * 1000, // 2 minutes - notes change frequently
  })
}

// Options for getting behavior summary
export function behaviorSummaryQueryOptions(params: {
  studentId: string
  schoolYearId: string
}) {
  return queryOptions({
    queryKey: ['notes', 'summary', params.studentId],
    queryFn: () => getBehaviorSummary({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Options for getting notes trend
export function notesTrendQueryOptions(params: {
  studentId: string
  months?: number
}) {
  return queryOptions({
    queryKey: ['notes', 'trend', params.studentId, params.months],
    queryFn: () => getNotesTrend({ data: params }),
    staleTime: 30 * 60 * 1000, // 30 minutes - trend changes slowly
  })
}
