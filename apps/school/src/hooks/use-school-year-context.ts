import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getSchoolYearContext, setSchoolYearContext } from '@/school/middleware/school-context'

const SCHOOL_YEAR_DEPENDENT_QUERY_KEYS: readonly string[] = [
  'school-year-context',
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
      // Keep invalidation scope explicit while avoiding repetitive calls.
      void Promise.all(
        SCHOOL_YEAR_DEPENDENT_QUERY_KEYS.map(queryKey =>
          queryClient.invalidateQueries({ queryKey: [queryKey] }),
        ),
      )
    },
  })

  return {
    schoolYearId: context?.schoolYearId ?? null,
    isPending,
    switchSchoolYear: switchSchoolYear.mutate,
    isSwitching: switchSchoolYear.isPending,
  }
}
