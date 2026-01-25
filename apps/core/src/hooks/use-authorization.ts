import type { SystemAction } from '@repo/data-ops/auth/permissions'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import { Route as RootRoute } from '@/routes/__root'

/**
 * Hook to access authorization state and helpers
 */
export function useAuthorization() {
  const { auth } = RootRoute.useRouteContext()

  /**
   * Check if user has a specific permission
   */
  const can = (resource: string, action: SystemAction = 'view') => {
    if (!auth || !auth.isAuthenticated || !auth.permissions)
      return false

    // Super admins have all permissions
    if (auth.isSuperAdmin)
      return true

    return hasPermission(auth.permissions as any, resource, action)
  }

  /**
   * Check if user has any system access
   */
  const isSystemUser = auth?.hasSystemAccess ?? false

  return {
    auth,
    can,
    isSystemUser,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isSuperAdmin: auth?.isSuperAdmin ?? false,
  }
}
