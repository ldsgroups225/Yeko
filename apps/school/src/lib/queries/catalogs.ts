import { queryOptions } from '@tanstack/react-query'
import { getGrades } from '@/school/functions/grades'
import { getSeries } from '@/school/functions/series'

export const catalogsKeys = {
  all: ['catalogs'] as const,
  grades: () => [...catalogsKeys.all, 'grades'] as const,
  series: () => [...catalogsKeys.all, 'series'] as const,
}

export const catalogsOptions = {
  grades: () =>
    queryOptions({
      queryKey: catalogsKeys.grades(),
      queryFn: async () => {
        const res = await getGrades({ data: {} })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
    }),

  series: () =>
    queryOptions({
      queryKey: catalogsKeys.series(),
      queryFn: async () => {
        const res = await getSeries({ data: {} })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
    }),
}
