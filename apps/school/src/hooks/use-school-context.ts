import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentSchoolContext } from '@/school/functions/school-context'
import { setSchoolContext } from '@/school/middleware/school-context'

/**
 * Hook to get and manage school context
 */
export function useSchoolContext() {
  const queryClient = useQueryClient()

  const { data: context, isLoading } = useQuery({
    queryKey: ['school-context'],
    queryFn: async () => await getCurrentSchoolContext(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchool = useMutation({
    mutationFn: async (schoolId: string) => await setSchoolContext({ data: schoolId }),
    onSuccess: () => {
      // Invalidate all queries to refetch with new school context
      queryClient.invalidateQueries()
      // Reload the page to ensure clean state
      window.location.reload()
    },
  })

  return {
    schoolId: context?.success ? context.data?.schoolId ?? null : null,
    isLoading,
    switchSchool: switchSchool.mutate,
    isSwitching: switchSchool.isPending,
  }
}
