import { getUserSchoolsByAuthUserId } from '@repo/data-ops/queries/school-admin/users'
import { authServerFn } from '../lib/server-fn'
import { retrieveSchoolContext } from '../middleware/school-context-logic'

/**
 * Get all schools accessible by the current user
 */
export const getUserSchools = authServerFn.handler(async ({ context }) => {
  if (!context?.auth) {
    return { success: true as const, data: [] }
  }

  try {
    const schools = await getUserSchoolsByAuthUserId(context.auth.userId)
    return { success: true as const, data: schools }
  }
  catch (error) {
    console.error('Error fetching user schools:', error)
    return { success: true as const, data: [] }
  }
})

/**
 * Get current school context
 */
export const getCurrentSchoolContext = authServerFn.handler(async () => {
  const result = await retrieveSchoolContext()
  return { success: true as const, data: result }
})

/**
 * Validate user has access to a specific school
 */
export const validateSchoolAccess = authServerFn
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolId, context }) => {
    if (!context?.auth) {
      return { success: true as const, data: false }
    }

    try {
      const schools = await getUserSchoolsByAuthUserId(context.auth.userId)
      const hasAccess = schools.some((school: { id: string }) => school.id === schoolId)
      return { success: true as const, data: hasAccess }
    }
    catch (error) {
      console.error('Error validating school access:', error)
      return { success: true as const, data: false }
    }
  })
