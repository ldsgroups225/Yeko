import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getCurrentSchoolContext } from '@/school/functions/school-context'
import { setSchoolContext } from '@/school/middleware/school-context'

/**
 * Hook to get and manage school context
 */
export function useSchoolContext() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: context, isPending } = useQuery({
    queryKey: ['school-context'],
    queryFn: getCurrentSchoolContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchool = useMutation({
    mutationKey: schoolMutationKeys.context.selectSchool,
    mutationFn: (schoolId: string) => setSchoolContext({ data: schoolId }),
    onSuccess: () => {
      // Clear the entire query cache so no stale cross-school data leaks,
      // then re-run all route loaders under the new school context.
      queryClient.clear()
      void router.invalidate()
    },
  })

  return {
    schoolId: context?.success ? context.data?.schoolId ?? null : null,
    isPending,
    switchSchool: switchSchool.mutate,
    isSwitching: switchSchool.isPending,
  }
}
