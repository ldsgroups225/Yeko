import { queryOptions } from '@tanstack/react-query'
import { getFiscalYears } from '@/school/functions/fiscal-years'

export const fiscalYearsKeys = {
  all: ['fiscal-years'] as const,
  lists: () => [...fiscalYearsKeys.all, 'list'] as const,
}

export function fiscalYearsOptions() {
  return queryOptions({
    queryKey: fiscalYearsKeys.lists(),
    queryFn: async () => {
      const result = await getFiscalYears()
      if (result.success)
        return result.data
      throw new Error(result.error)
    },
    staleTime: 60 * 60 * 1000,
  })
}
