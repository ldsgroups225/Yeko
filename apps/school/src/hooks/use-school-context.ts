import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getCurrentSchoolContext } from '@/school/functions/school-context'
import { setSchoolContext } from '@/school/middleware/school-context'

/**
 * Hook to get and manage school context
 */
export function useSchoolContext() {
  const queryClient = useQueryClient()

  const { data: context, isPending } = useQuery({
    queryKey: ['school-context'],
    queryFn: async () => await getCurrentSchoolContext(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchool = useMutation({
    mutationKey: schoolMutationKeys.context.selectSchool,
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
    isPending,
    switchSchool: switchSchool.mutate,
    isSwitching: switchSchool.isPending,
  }
}
