import { getUserPermissionsBySchool } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { getCurrentSchoolContext } from './school-context'

export type Permissions = Record<string, string[]>

/**
 * Get user permissions for the current school context
 * Returns a map of resource -> actions[]
 */
export const getUserPermissions = createServerFn().handler(async () => {
  try {
    // Get current school context (includes userId from session)
    const context = await getCurrentSchoolContext()
    if (!context?.schoolId || !context?.userId) {
      return {}
    }

    // Get user permissions from data-ops query
    const permissions = await getUserPermissionsBySchool(context.userId, context.schoolId)

    return permissions
  }
  catch (error) {
    console.error('Error fetching user permissions:', error)
    return {}
  }
})

/**
 * Check if user has a specific permission
 */
export const checkUserPermission = createServerFn()
  .inputValidator((data: { action: string, resource: string }) => data)
  .handler(async ({ data }) => {
    const permissions = await getUserPermissions()
    return permissions[data.resource]?.includes(data.action) ?? false
  })
