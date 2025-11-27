import { createServerFn } from '@tanstack/react-start';
import { getUserSchoolsByUserId } from '@repo/data-ops/queries/school-admin/users';
import { getSchoolContext } from '../middleware/school-context';

/**
 * Get all schools accessible by the current user
 */
export const getUserSchools = createServerFn().handler(async () => {
  // TODO: Get current user ID from session
  const userId = 'temp-user-id'; // Replace with actual session user ID

  try {
    const schools = await getUserSchoolsByUserId(userId);
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
  .handler(async ({ data }) => {
    const schoolId = data;
    // TODO: Get current user ID from session
    const userId = 'temp-user-id'; // Replace with actual session user ID

    try {
      const schools = await getUserSchoolsByUserId(userId);
      return schools.some((school: { id: string }) => school.id === schoolId);
    } catch (error) {
      console.error('Error validating school access:', error);
      return false;
    }
  });
