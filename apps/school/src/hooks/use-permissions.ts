import { useQuery } from '@tanstack/react-query'
import { getUserPermissions } from '@/school/functions/permissions'

export type Permissions = Record<string, string[]>

/**
 * Hook to access user permissions for the current school context
 *
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { can, canAny, canAll, isLoading } = usePermissions();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       {can('view', 'users') && <UsersList />}
 *       {can('create', 'users') && <Button>Add User</Button>}
 *       {canAny(['edit', 'delete'], 'users') && <Button>Manage</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => getUserPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  /**
   * Check if user has a specific permission
   * @param action - The action to check (e.g., 'view', 'create', 'edit', 'delete')
   * @param resource - The resource to check (e.g., 'users', 'students', 'classes')
   * @returns true if user has the permission, false otherwise
   */
  const can = (action: string, resource: string): boolean => {
    if (!permissions)
      return false
    return permissions[resource]?.includes(action) ?? false
  }

  /**
   * Check if user has ANY of the specified permissions
   * @param actions - Array of actions to check
   * @param resource - The resource to check
   * @returns true if user has at least one of the permissions
   */
  const canAny = (actions: string[], resource: string): boolean => {
    return actions.some(action => can(action, resource))
  }

  /**
   * Check if user has ALL of the specified permissions
   * @param actions - Array of actions to check
   * @param resource - The resource to check
   * @returns true if user has all of the permissions
   */
  const canAll = (actions: string[], resource: string): boolean => {
    return actions.every(action => can(action, resource))
  }

  return {
    permissions: permissions ?? {},
    can,
    canAny,
    canAll,
    isLoading,
    error,
  }
}
