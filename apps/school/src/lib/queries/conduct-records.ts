import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  addFollowUp,
  changeStatus,
  createRecord,
  getConductRecordById,
  getStudentSummary,
  listConductRecords,
  markFollowUpComplete,
  markParentAcknowledged,
  notifyParentOfConduct,
  removeFollowUp,
  removeRecord,
  updateRecord,
} from '@/school/functions/conduct-records'
import { schoolMutationKeys } from './keys'

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
  schoolYearId: string | null | undefined
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
    queryKey: conductRecordsKeys.list(params.schoolYearId ?? 'all', params),
    queryFn: async () => {
      const res = await listConductRecords({ data: { ...params, schoolYearId: params.schoolYearId! } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!params.schoolYearId,
  })
}

export function conductRecordOptions(id: string) {
  return queryOptions({
    queryKey: conductRecordsKeys.detail(id),
    queryFn: async () => {
      const res = await getConductRecordById({ data: { id } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function studentConductSummaryOptions(studentId: string, schoolYearId: string) {
  return queryOptions({
    queryKey: conductRecordsKeys.summary(studentId, schoolYearId),
    queryFn: async () => {
      const res = await getStudentSummary({ data: { studentId, schoolYearId } })
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId && !!schoolYearId,
  })
}

// Conduct records mutations
export const conductRecordsMutations = {
  create: {
    mutationKey: schoolMutationKeys.conductRecords.create,
    mutationFn: (data: Parameters<typeof createRecord>[0]['data']) => createRecord({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof updateRecord>[0]['data']) => updateRecord({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.conductRecords.delete,
    mutationFn: (data: Parameters<typeof removeRecord>[0]['data']) => removeRecord({ data }),
  },
  changeStatus: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof changeStatus>[0]['data']) => changeStatus({ data }),
  },
  addFollowUp: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof addFollowUp>[0]['data']) => addFollowUp({ data }),
  },
  completeFollowUp: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof markFollowUpComplete>[0]['data']) => markFollowUpComplete({ data }),
  },
  removeFollowUp: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof removeFollowUp>[0]['data']) => removeFollowUp({ data }),
  },
  notifyParent: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof notifyParentOfConduct>[0]['data']) => notifyParentOfConduct({ data }),
  },
  markAcknowledged: {
    mutationKey: schoolMutationKeys.conductRecords.update,
    mutationFn: (data: Parameters<typeof markParentAcknowledged>[0]['data']) => markParentAcknowledged({ data }),
  },
}
