import type { ReactNode } from 'react'
import { IconShieldExclamation } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { usePermissions } from '@/hooks/use-permissions'

interface PermissionGuardProps {
  /** The action required (e.g., 'view', 'create', 'edit', 'delete') */
  action: string
  /** The resource to check (e.g., 'users', 'students', 'classes') */
  resource: string
  /** Content to render if user has permission */
  children: ReactNode
  /** Optional fallback content if user doesn't have permission */
  fallback?: ReactNode
  /** If true, shows an access denied message instead of hiding content */
  showDenied?: boolean
}

/**
 * Component to conditionally render content based on user permissions
 *
 * @example
 * ```tsx
 * <PermissionGuard action="create" resource="users">
 *   <Button>Add User</Button>
 * </PermissionGuard>
 *
 * <PermissionGuard
 *   action="view"
 *   resource="finance"
 *   showDenied
 * >
 *   <FinanceDashboard />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  action,
  resource,
  children,
  fallback,
  showDenied = false,
}: PermissionGuardProps) {
  const { can, isLoading } = usePermissions()

  // Show loading state
  if (isLoading) {
    return null
  }

  // IconCheck permission
  const hasPermission = can(action, resource)

  if (!hasPermission) {
    if (showDenied) {
      return (
        <Alert variant="destructive">
          <IconShieldExclamation className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas la permission d'accéder à cette ressource.
          </AlertDescription>
        </Alert>
      )
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

interface MultiPermissionGuardProps {
  /** Array of actions to check */
  actions: string[]
  /** The resource to check */
  resource: string
  /** If 'any', user needs at least one permission. If 'all', user needs all permissions */
  mode?: 'any' | 'all'
  /** Content to render if user has permission */
  children: ReactNode
  /** Optional fallback content if user doesn't have permission */
  fallback?: ReactNode
}

/**
 * Component to check multiple permissions at once
 *
 * @example
 * ```tsx
 * <MultiPermissionGuard
 *   actions={['edit', 'delete']}
 *   resource="users"
 *   mode="any"
 * >
 *   <Button>Manage Users</Button>
 * </MultiPermissionGuard>
 * ```
 */
export function MultiPermissionGuard({
  actions,
  resource,
  mode = 'any',
  children,
  fallback,
}: MultiPermissionGuardProps) {
  const { canAny, canAll, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const hasPermission = mode === 'any'
    ? canAny(actions, resource)
    : canAll(actions, resource)

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
