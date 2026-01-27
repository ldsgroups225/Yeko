import { useTeacherContext } from '@/hooks/use-teacher-context'

/**
 * Hook to access authorization state and helpers
 * Adapter for teacher app
 */
export function useAuthorization() {
  const { data: teacher, isLoading } = useTeacherContext()

  /**
   * Check if user has a specific permission
   * Currently checks if teacher context is valid
   */
  const can = (_resource: string, _action: string = 'view') => {
    // Basic authorization: if you have a valid teacher context with a school, you are authorized
    // Granular permissions can be added here later
    return !!teacher?.schoolId
  }

  return {
    can,
    isLoading,
    auth: {
      isAuthenticated: !!teacher?.schoolId,
      user: teacher,
    },
  }
}
