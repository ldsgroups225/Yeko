import { getUserSchoolsByAuthUserId } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { getAuthContext } from '../middleware/auth'
import { retrieveSchoolContext } from '../middleware/school-context-logic'

/**
 * Get all schools accessible by the current user
 */
export const getUserSchools = createServerFn().handler(async () => {
  const authContext = await getAuthContext()
  if (!authContext) {
    return []
  }

  try {
    const schools = await getUserSchoolsByAuthUserId(authContext.userId)
    return schools
  }
  catch (error) {
    console.error('Error fetching user schools:', error)
    return []
  }
})

/**
 * Get current school context
 */
export const getCurrentSchoolContext = createServerFn().handler(async () => {
  return await retrieveSchoolContext()
})

/**
 * Validate user has access to a specific school
 */
export const validateSchoolAccess = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolId }) => {
    const authContext = await getAuthContext()
    if (!authContext) {
      return false
    }

    try {
      const schools = await getUserSchoolsByAuthUserId(authContext.userId)
      return schools.some((school: { id: string }) => school.id === schoolId)
    }
    catch (error) {
      console.error('Error validating school access:', error)
      return false
    }
  })
