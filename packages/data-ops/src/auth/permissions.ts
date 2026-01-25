/**
 * Defined resources in the system
 */
export type SystemResource = 
  | 'schools' 
  | 'users' 
  | 'system_monitoring' 
  | 'global_settings'
  | 'academic_catalogs'

/**
 * Standard actions that can be performed on resources
 */
export type SystemAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export'

/**
 * Aggregated permissions mapped by resource
 */
export type SystemPermissions = Record<string, SystemAction[]>

/**
 * Utility to check if a permission set allows an action
 */
export function hasPermission(
  permissions: SystemPermissions, 
  resource: string, 
  action: SystemAction
): boolean {
  const resourcePermissions = permissions[resource]
  if (!resourcePermissions) return false

  // 'manage' is a wildcard for all actions
  if (resourcePermissions.includes('manage')) return true

  return resourcePermissions.includes(action)
}

/**
 * Merges multiple permission sets into one
 */
export function mergePermissions(permsList: SystemPermissions[]): SystemPermissions {
  const result: SystemPermissions = {}

  for (const perms of permsList) {
    for (const [resource, actions] of Object.entries(perms)) {
      if (!result[resource]) {
        result[resource] = []
      }
      
      // Merge unique actions
      for (const action of actions) {
        if (!result[resource].includes(action as SystemAction)) {
          result[resource].push(action as SystemAction)
        }
      }
    }
  }

  return result
}
