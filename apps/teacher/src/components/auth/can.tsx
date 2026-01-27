import type { ReactNode } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'

interface CanProps {
  /**
   * Resource to check permissions for
   */
  I: string
  /**
   * Action to perform
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
 */
export function Can({ I, a = 'view', children, fallback = null }: CanProps) {
  const { can } = useAuthorization()

  if (can(I, a)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
