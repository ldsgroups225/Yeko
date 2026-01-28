import { DatabaseError } from '@repo/data-ops/errors'
import { getUserPermissionsBySchool } from '@repo/data-ops/queries/school-admin/users'
import { getSchoolContext } from './school-context'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

export type PermissionResource
  = | 'users'
    | 'teachers'
    | 'staff'
    | 'roles'
    | 'students'
    | 'parents'
    | 'enrollments'
    | 'classrooms'
    | 'classes'
    | 'grades'
    | 'finance'
    | 'reports'
    | 'settings'
  // Phase 14: Academic Management
    | 'school_subjects'
    | 'coefficients'
    | 'teacher_assignments'
  // Phase 15: Grading
    | 'student_grades'

/**
 * IconCheck if the current user has a specific permission
 * Throws an error if the user doesn't have the required permission
 */
export async function requirePermission(
  resource: PermissionResource,
  action: PermissionAction,
): Promise<void> {
  const context = await getSchoolContext()

  if (!context) {
    throw new DatabaseError('UNAUTHORIZED', 'Unauthorized: No school context')
  }

  const { userId, schoolId } = context

  const permissions = await getUserPermissionsBySchool(userId, schoolId)

  // IconCheck if user has the required permission
  const resourcePermissions = permissions[resource]

  if (!resourcePermissions || !resourcePermissions.includes(action)) {
    throw new DatabaseError('PERMISSION_DENIED', `Forbidden: You don't have permission to ${action} ${resource}`)
  }
}

/**
 * IconCheck if the current user has any of the specified permissions
 * Returns true if user has at least one of the permissions
 */
export async function hasAnyPermission(
  checks: Array<{ resource: PermissionResource, action: PermissionAction }>,
): Promise<boolean> {
  const context = await getSchoolContext()

  if (!context) {
    return false
  }

  const { userId, schoolId } = context
  const permissions = await getUserPermissionsBySchool(userId, schoolId)

  return checks.some(({ resource, action }) => {
    const resourcePermissions = permissions[resource]
    return resourcePermissions?.includes(action) ?? false
  })
}

/**
 * IconCheck if the current user has all of the specified permissions
 * Returns true only if user has all permissions
 */
export async function hasAllPermissions(
  checks: Array<{ resource: PermissionResource, action: PermissionAction }>,
): Promise<boolean> {
  const context = await getSchoolContext()

  if (!context) {
    return false
  }

  const { userId, schoolId } = context
  const permissions = await getUserPermissionsBySchool(userId, schoolId)

  return checks.every(({ resource, action }) => {
    const resourcePermissions = permissions[resource]
    return resourcePermissions?.includes(action) ?? false
  })
}

/**
 * Get all permissions for the current user in the current school
 */
export async function getCurrentUserPermissions(): Promise<Record<string, string[]>> {
  const context = await getSchoolContext()

  if (!context) {
    return {}
  }

  const { userId, schoolId } = context
  return getUserPermissionsBySchool(userId, schoolId)
}
