import type { QueryClient } from '@tanstack/react-query'
import { getSchoolYearContext } from '@/school/middleware/school-context'

/**
 * Ensures the school-year-context query is in cache and returns the
 * schoolYearId.  Shared across route loaders to avoid repeating the
 * same ensureQueryData boilerplate.
 */
export async function ensureSchoolYearId(queryClient: QueryClient): Promise<string | null> {
  const ctx = await queryClient.ensureQueryData({
    queryKey: ['school-year-context'],
    queryFn: getSchoolYearContext,
    staleTime: 5 * 60 * 1000, // 5 minutes — matches useSchoolYearContext
  })
  return ctx?.schoolYearId ?? null
}
