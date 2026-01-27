import { usePermissions } from '@/hooks/use-permissions'
import { useSchoolContext } from '@/hooks/use-school-context'

/**
 * Hook to access authorization state and helpers
 * Adapter for school app to match core's signature
 */
export function useAuthorization() {
  const { can: canOriginal, isLoading, permissions } = usePermissions()
  const { schoolId } = useSchoolContext()

  /**
   * Check if user has a specific permission
   * Standardized signature: (resource, action)
   */
  const can = (resource: string, action: string = 'view') => {
    return canOriginal(action, resource)
  }

  return {
    can,
    isLoading,
    permissions,
    // exposing auth object structure similar to core
    auth: {
      isAuthenticated: !!schoolId,
      permissions,
    },
  }
}
