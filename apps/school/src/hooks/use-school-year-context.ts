import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getSchoolYearContext, setSchoolYearContext } from '@/school/middleware/school-context'

/**
 * Hook to get and manage school year context
 */
export function useSchoolYearContext() {
  const queryClient = useQueryClient()

  const { data: context, isPending } = useQuery({
    queryKey: ['school-year-context'],
    queryFn: async () => await getSchoolYearContext(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchoolYear = useMutation({
    mutationKey: schoolMutationKeys.context.selectSchoolYear,
    mutationFn: async (schoolYearId: string) => await setSchoolYearContext({ data: schoolYearId }),
    onSuccess: () => {
      // Invalidate queries that depend on school year
      queryClient.invalidateQueries({ queryKey: ['school-year-context'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['report-cards'] })
      queryClient.invalidateQueries({ queryKey: ['class-averages'] })
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      queryClient.invalidateQueries({ queryKey: ['coefficients'] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['curriculum-progress'] })
    },
  })

  return {
    schoolYearId: context?.schoolYearId ?? null,
    isPending,
    switchSchoolYear: switchSchoolYear.mutate,
    isSwitching: switchSchoolYear.isPending,
  }
}
