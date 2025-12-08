import { queryOptions } from '@tanstack/react-query'

import {
  getConductRecordById,
  getStudentSummary,
  listConductRecords,
} from '@/school/functions/conduct-records'

export const conductRecordsKeys = {
  all: ['conduct-records'] as const,
  list: (schoolYearId: string, filters?: Record<string, unknown>) =>
    [...conductRecordsKeys.all, 'list', schoolYearId, filters] as const,
  detail: (id: string) =>
    [...conductRecordsKeys.all, 'detail', id] as const,
  summary: (studentId: string, schoolYearId: string) =>
    [...conductRecordsKeys.all, 'summary', studentId, schoolYearId] as const,
}

export function conductRecordsOptions(params: {
  schoolYearId: string
  studentId?: string
  classId?: string
  type?: 'incident' | 'sanction' | 'reward' | 'note'
  category?: 'behavior' | 'academic' | 'attendance' | 'uniform' | 'property' | 'violence' | 'bullying' | 'cheating' | 'achievement' | 'improvement' | 'other'
  status?: 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  return queryOptions({
    queryKey: conductRecordsKeys.list(params.schoolYearId, params),
    queryFn: () => listConductRecords({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

export function conductRecordOptions(id: string) {
  return queryOptions({
    queryKey: conductRecordsKeys.detail(id),
    queryFn: () => getConductRecordById({ data: { id } }),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function studentConductSummaryOptions(studentId: string, schoolYearId: string) {
  return queryOptions({
    queryKey: conductRecordsKeys.summary(studentId, schoolYearId),
    queryFn: () => getStudentSummary({ data: { studentId, schoolYearId } }),
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId && !!schoolYearId,
  })
}
