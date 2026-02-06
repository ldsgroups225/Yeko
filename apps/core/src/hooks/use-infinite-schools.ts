import { useInfiniteQuery } from '@tanstack/react-query'
import { getSchools } from '@/core/functions/schools'

interface UseInfiniteSchoolsOptions {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export function useInfiniteSchools(options: UseInfiniteSchoolsOptions = {}) {
  const { search, status, sortBy = 'createdAt', sortOrder = 'desc', limit = 20 } = options

  return useInfiniteQuery({
    queryKey: ['schools', 'infinite', { search, status, sortBy, sortOrder, limit }],
    queryFn: async ({ pageParam }) => {
      const result = await getSchools({
        data: {
          page: pageParam,
          limit,
          search: search || undefined,
          status,
          sortBy,
          sortOrder,
        },
      })
      return result
    },
    getNextPageParam: (lastPage) => {
      // Check if there are more pages
      const hasNext = lastPage.meta.page < lastPage.meta.totalPages
      if (hasNext) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}
