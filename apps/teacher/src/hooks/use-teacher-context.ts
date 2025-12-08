import { useQuery } from '@tanstack/react-query'

import { getTeacherContext } from '@/teacher/middleware/teacher-context'

/**
 * Hook to get the current teacher context
 * Returns teacher ID, school ID, and school year ID
 */
export function useTeacherContext() {
  return useQuery({
    queryKey: ['teacher', 'context'],
    queryFn: () => getTeacherContext(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  })
}

/**
 * Hook that returns teacher context or throws if not available
 * Use this in components that require teacher authentication
 */
export function useRequiredTeacherContext() {
  const { data, isLoading, error } = useTeacherContext()

  if (isLoading) {
    return { isLoading: true, context: null } as const
  }

  if (error || !data) {
    return { isLoading: false, context: null, error: error ?? new Error('Not authenticated as teacher') } as const
  }

  return { isLoading: false, context: data, error: null } as const
}
