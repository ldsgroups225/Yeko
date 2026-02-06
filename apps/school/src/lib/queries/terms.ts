import { queryOptions } from '@tanstack/react-query'

import { getTerms } from '@/school/functions/terms'

export const termsKeys = {
  all: ['terms'] as const,
  lists: () => [...termsKeys.all, 'list'] as const,
  list: (schoolYearId: string) => [...termsKeys.lists(), schoolYearId] as const,
}

export const termsOptions = {
  list: (schoolYearId: string) =>
    queryOptions({
      queryKey: termsKeys.list(schoolYearId),
      queryFn: async () => {
        const res = await getTerms({ data: { schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000,
      enabled: !!schoolYearId,
    }),
}
