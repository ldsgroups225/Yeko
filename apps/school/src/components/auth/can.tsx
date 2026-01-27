import type { ReactNode } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'

interface CanProps {
  /**
   * Resource to check permissions for (e.g. 'schools', 'users')
   */
  I: string
  /**
   * Action to perform (e.g. 'view', 'create', 'edit', 'delete')
   * @default 'view'
   */
  a?: string
  /**
   * Content to render if permission is granted
   */
  children: ReactNode
  /**
   * Content to render if permission is denied
   */
  fallback?: ReactNode
}

/**
 * Declarative component for conditional rendering based on user permissions.
 *
 * Example:
 * <Can I="users" a="create">
 *   <button>Create User</button>
 * </Can>
 */
export function Can({ I, a = 'view', children, fallback = null }: CanProps) {
  const { can } = useAuthorization()

  if (can(I, a)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
