import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  createHomework,
  deleteHomework,
  getHomework,
  getHomeworkDetails,
  updateHomework,
} from '@/teacher/functions/homework'
import { teacherMutationKeys } from './keys'

interface HomeworkListParams {
  teacherId: string
  classId?: string
  subjectId?: string
  status?: 'draft' | 'active' | 'closed' | 'cancelled'
  page?: number
  pageSize?: number
}

export function homeworkListQueryOptions(params: HomeworkListParams) {
  return queryOptions({
    queryKey: ['teacher', 'homework', params.teacherId, params.classId, params.status, params.page],
    queryFn: () =>
      getHomework({
        data: {
          teacherId: params.teacherId,
          classId: params.classId,
          subjectId: params.subjectId,
          status: params.status,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }),
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  })
}

interface HomeworkDetailsParams {
  homeworkId: string
}

export function homeworkDetailsQueryOptions(params: HomeworkDetailsParams) {
  return queryOptions({
    queryKey: ['teacher', 'homework', 'details', params.homeworkId],
    queryFn: () => getHomeworkDetails({ data: params }),
    staleTime: 60 * 1000, // 1 minute
  })
}

// Homework mutations
export const homeworkMutations = {
  create: {
    mutationKey: teacherMutationKeys.homework.create,
    mutationFn: (data: Parameters<typeof createHomework>[0]['data']) => createHomework({ data }),
  },
  update: {
    mutationKey: teacherMutationKeys.homework.update,
    mutationFn: (data: Parameters<typeof updateHomework>[0]['data']) => updateHomework({ data }),
  },
  delete: {
    mutationKey: teacherMutationKeys.homework.delete,
    mutationFn: (data: Parameters<typeof deleteHomework>[0]['data']) => deleteHomework({ data }),
  },
}
