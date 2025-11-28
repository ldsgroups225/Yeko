import { createServerFn } from '@tanstack/react-start';
import { getUserPermissionsBySchool } from '@repo/data-ops/queries/school-admin/users';
import { getCurrentSchoolContext } from './school-context';

export type Permissions = Record<string, string[]>;

/**
 * Get user permissions for the current school context
 * Returns a map of resource -> actions[]
 */
export const getUserPermissions = createServerFn().handler(async () => {
  try {
    // Get current school context
    const context = await getCurrentSchoolContext();
    if (!context?.schoolId) {
      return {};
    }

    // TODO: Get current user ID from session
    // For now, return empty permissions
    // This will be implemented when auth is integrated
    const userId = 'temp-user-id'; // Replace with actual session user ID

    if (!userId) {
      return {};
    }

    // Get user permissions from data-ops query
    const permissions = await getUserPermissionsBySchool(userId, context.schoolId);

    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return {};
  }
});

/**
 * Check if user has a specific permission
 */
export const checkUserPermission = createServerFn()
  .inputValidator((data: { action: string; resource: string }) => data)
  .handler(async ({ data }) => {
    const permissions = await getUserPermissions();
    return permissions[data.resource]?.includes(data.action) ?? false;
  });
