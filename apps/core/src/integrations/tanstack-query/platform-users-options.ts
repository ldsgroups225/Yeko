import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getPlatformUsers } from '@/core/functions/users'

export const platformUsersKeys = {
  all: ['platform-users'] as const,
  lists: () => [...platformUsersKeys.all, 'list'] as const,
  list: (filters: { search?: string, page?: number, limit?: number }) =>
    [...platformUsersKeys.lists(), filters] as const,
}

export function platformUsersQueryOptions(filters: { search?: string, page?: number, limit?: number } = {}) {
  return queryOptions({
    queryKey: platformUsersKeys.list(filters),
    queryFn: () => getPlatformUsers({ data: filters }),
    placeholderData: keepPreviousData,
  })
}
