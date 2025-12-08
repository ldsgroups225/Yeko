import { queryOptions } from '@tanstack/react-query'

import { getHomework, getHomeworkDetails } from '@/teacher/functions/homework'

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
