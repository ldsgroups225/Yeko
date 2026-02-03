import { getUserPermissionsBySchool } from '@repo/data-ops/queries/school-admin/users'
import { authServerFn } from '../lib/server-fn'

export type Permissions = Record<string, string[]>

/**
 * Get user permissions for the current school context
 * Returns a map of resource -> actions[]
 */
export const getUserPermissions = authServerFn.handler(async ({ context }) => {
  try {
    if (!context?.school) {
      return { success: true as const, data: {} as Permissions }
    }

    const { userId, schoolId } = context.school

    // Get user permissions from data-ops query
    const permissions = await getUserPermissionsBySchool(userId, schoolId)

    return { success: true as const, data: permissions as Permissions }
  }
  catch (error) {
    console.error('Error fetching user permissions:', error)
    return { success: true as const, data: {} as Permissions }
  }
})

/**
 * Check if user has a specific permission
 */
export const checkUserPermission = authServerFn
  .inputValidator((data: { action: string, resource: string }) => data)
  .handler(async ({ data, context }) => {
    if (!context?.school) {
      return { success: true as const, data: false }
    }

    const { userId, schoolId } = context.school
    const permissions = await getUserPermissionsBySchool(userId, schoolId)

    const hasPermission = permissions[data.resource]?.includes(data.action) ?? false
    return { success: true as const, data: hasPermission }
  })
