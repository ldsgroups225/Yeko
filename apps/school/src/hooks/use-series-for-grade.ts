import { useQuery } from '@tanstack/react-query'
import { getSeriesByGrade } from '@/school/functions/series'

/**
 * Hook for fetching series available for a specific grade.
 * Uses the grade_series join table to return only allowed series.
 *
 * @param gradeId - The grade ID to fetch series for, or null/undefined to skip.
 * @returns { series, hasSeries, isLoading }
 */
export function useSeriesForGrade(gradeId: string | null | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['series', 'by-grade', gradeId],
    queryFn: () => getSeriesByGrade({ data: { gradeId: gradeId! } }),
    enabled: !!gradeId,
    staleTime: 5 * 60 * 1000, // 5 min — catalog data rarely changes
  })

  const series = data?.success ? data.data : []

  return {
    series,
    hasSeries: series.length > 0,
    isLoading: !!gradeId && isLoading,
  }
}
