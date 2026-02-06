import type { GetSchoolUsersInput } from '@/schemas/user'
import { queryOptions } from '@tanstack/react-query'
import { getSchoolUsers } from '@/core/functions/get-school-users'

export function schoolUsersQueryOptions(params: GetSchoolUsersInput) {
  return queryOptions({
    queryKey: ['schoolUsers', params],
    queryFn: () => getSchoolUsers({ data: params }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!params.schoolId,
  })
}

export const schoolUsersQueries = {
  list: schoolUsersQueryOptions,
}
