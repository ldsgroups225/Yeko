import { createServerFn } from '@tanstack/react-start';
import { getUserSchoolsByAuthUserId } from '@repo/data-ops/queries/school-admin/users';
import { getSchoolContext } from '../middleware/school-context';
import { getAuthContext } from '../middleware/auth';

/**
 * Get all schools accessible by the current user
 */
export const getUserSchools = createServerFn().handler(async () => {
  const authContext = await getAuthContext();
  if (!authContext) {
    return [];
  }

  try {
    const schools = await getUserSchoolsByAuthUserId(authContext.userId);
    return schools;
  } catch (error) {
    console.error('Error fetching user schools:', error);
    return [];
  }
});

/**
 * Get current school context
 */
export const getCurrentSchoolContext = createServerFn().handler(async () => {
  return await getSchoolContext();
});

/**
 * Validate user has access to a specific school
 */
export const validateSchoolAccess = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolId }) => {
    const authContext = await getAuthContext();
    if (!authContext) {
      return false;
    }

    try {
      const schools = await getUserSchoolsByAuthUserId(authContext.userId);
      return schools.some((school: { id: string }) => school.id === schoolId);
    } catch (error) {
      console.error('Error validating school access:', error);
      return false;
    }
  });
