import { useMutation, useQuery } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getCurrentSchoolContext } from '@/school/functions/school-context'
import { setSchoolContext } from '@/school/middleware/school-context'

/**
 * Hook to get and manage school context
 */
export function useSchoolContext() {
  const { data: context, isPending } = useQuery({
    queryKey: ['school-context'],
    queryFn: getCurrentSchoolContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const switchSchool = useMutation({
    mutationKey: schoolMutationKeys.context.selectSchool,
    mutationFn: (schoolId: string) => setSchoolContext({ data: schoolId }),
    onSuccess: () => {
      // Full reload resets app state and query cache under new school context.
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
