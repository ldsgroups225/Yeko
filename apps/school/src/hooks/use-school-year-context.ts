import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getSchoolYearContext, setSchoolYearContext } from '@/school/middleware/school-context'

/**
 * Query keys that depend on the active school year.
 * On year switch these are removed from cache (not invalidated) to avoid
 * burst refetches.  Components re-render with the new schoolYearId and
 * create fresh queries that fetch on demand.
 */
const SCHOOL_YEAR_DEPENDENT_QUERY_KEYS: readonly string[] = [
  'students',
  'classes',
  'enrollments',
  'report-cards',
  'class-averages',
  'grades',
  'terms',
  'timetables',
  'coefficients',
  'subjects',
  'curriculum-progress',
  'dashboard',
  'conduct-records',
]

/**
 * Hook to get and manage school year context
 */
export function useSchoolYearContext() {
  const queryClient = useQueryClient()

  const { data: context, isPending } = useQuery({
    queryKey: ['school-year-context'],
    queryFn: getSchoolYearContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchoolYear = useMutation({
    mutationKey: schoolMutationKeys.context.selectSchoolYear,
    mutationFn: (schoolYearId: string) => setSchoolYearContext({ data: schoolYearId }),
    onSuccess: () => {
      // 1. Invalidate context — triggers re-render cascade so components
      //    pick up the new schoolYearId and create new queries.
      void queryClient.invalidateQueries({ queryKey: ['school-year-context'] })

      // 2. Remove (not invalidate) year-dependent queries.
      //    • Queries that include schoolYearId in their key auto-resolve:
      //      components re-render → new key → fresh fetch.
      //    • Queries without schoolYearId in key are cleared so they
      //      refetch lazily when the user navigates to the relevant view.
      //    Using removeQueries avoids the burst of simultaneous refetches
      //    that invalidateQueries would cause for all active observers.
      for (const key of SCHOOL_YEAR_DEPENDENT_QUERY_KEYS) {
        queryClient.removeQueries({ queryKey: [key] })
      }

      // 3. Prefetching for the new year is handled by the _auth layout's
      //    useEffect (classes, terms, catalogs) which re-fires when
      //    schoolYearId changes.
    },
  })

  return {
    schoolYearId: context?.schoolYearId ?? null,
    isPending,
    switchSchoolYear: switchSchoolYear.mutate,
    isSwitching: switchSchoolYear.isPending,
  }
}
