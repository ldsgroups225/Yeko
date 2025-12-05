import { getSchoolYearsBySchool } from '@repo/data-ops/queries/school-admin/school-years'
import { getUserSchoolsByAuthUserId, syncUserAuthOnLogin } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { getAuthContext } from './auth'

const SCHOOL_CONTEXT_COOKIE = 'yeko_school_id'
const SCHOOL_YEAR_CONTEXT_COOKIE = 'yeko_school_year_id'

/**
 * Parse cookies from request headers
 */
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader)
    return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, ...value] = cookie.trim().split('=')
      return [key, value.join('=')]
    }),
  )
}

/**
 * Get the current school context from cookie
 * Returns null if no school is selected or user doesn't have access
 */
export const getSchoolContext = createServerFn().handler(async () => {
  try {
    const authContext = await getAuthContext()
    if (!authContext) {
      return null
    }

    // Sync user auth data and update last login (non-blocking via waitUntil)
    // This also returns the internal user ID
    const internalUserId = await syncUserAuthOnLogin(authContext.userId, authContext.email)

    if (!internalUserId) {
      console.error('User not found in database for email:', authContext.email)
      return null
    }

    const req = getRequest()
    const cookies = parseCookies(req.headers.get('cookie'))
    const schoolId = cookies[SCHOOL_CONTEXT_COOKIE]

    if (!schoolId) {
      // Try to auto-select the first school the user has access to
      const schools = await getUserSchoolsByAuthUserId(authContext.userId)
      if (schools.length > 0) {
        // Auto-select first school and set cookie
        const firstSchool = schools[0]
        setResponseHeader(
          'Set-Cookie',
          `${SCHOOL_CONTEXT_COOKIE}=${firstSchool.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        )
        return { schoolId: firstSchool.id, userId: internalUserId }
      }
      return null
    }

    // Validate user has access to this school
    const schools = await getUserSchoolsByAuthUserId(authContext.userId)
    const hasAccess = schools.some((school: { id: string }) => school.id === schoolId)

    if (!hasAccess) {
      // Clear invalid cookie
      setResponseHeader(
        'Set-Cookie',
        `${SCHOOL_CONTEXT_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      )
      return null
    }

    return { schoolId, userId: internalUserId }
  }
  catch (error) {
    console.error('Error getting school context:', error)
    return null
  }
})

/**
 * Set the current school context (switch schools)
 */
export const setSchoolContext = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolId }) => {
    const authContext = await getAuthContext()
    if (!authContext) {
      throw new Error('Unauthorized')
    }

    // Validate user has access to this school
    const schools = await getUserSchoolsByAuthUserId(authContext.userId)
    const hasAccess = schools.some((school: { id: string }) => school.id === schoolId)

    if (!hasAccess) {
      throw new Error('Access denied to this school')
    }

    // Set cookie
    setResponseHeader(
      'Set-Cookie',
      `${SCHOOL_CONTEXT_COOKIE}=${schoolId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    )

    return { success: true, schoolId }
  })

/**
 * Get the current school year context from cookie
 */
export const getSchoolYearContext = createServerFn().handler(async () => {
  try {
    const schoolContext = await getSchoolContext()
    if (!schoolContext) {
      return null
    }

    const req = getRequest()
    const cookies = parseCookies(req.headers.get('cookie'))
    const schoolYearId = cookies[SCHOOL_YEAR_CONTEXT_COOKIE]

    if (!schoolYearId) {
      // Try to auto-select the active school year
      const schoolYears = await getSchoolYearsBySchool(schoolContext.schoolId, { isActive: true, limit: 1 })
      if (schoolYears.length > 0) {
        const activeYear = schoolYears[0]
        setResponseHeader(
          'Set-Cookie',
          `${SCHOOL_YEAR_CONTEXT_COOKIE}=${activeYear.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        )
        return { schoolYearId: activeYear.id, schoolId: schoolContext.schoolId }
      }
      return null
    }

    // Validate school year belongs to current school
    const schoolYears = await getSchoolYearsBySchool(schoolContext.schoolId, {})
    const validYear = schoolYears.find((sy: { id: string }) => sy.id === schoolYearId)

    if (!validYear) {
      // Clear invalid cookie and try to get active year
      const activeYears = await getSchoolYearsBySchool(schoolContext.schoolId, { isActive: true, limit: 1 })
      if (activeYears.length > 0) {
        setResponseHeader(
          'Set-Cookie',
          `${SCHOOL_YEAR_CONTEXT_COOKIE}=${activeYears[0].id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        )
        return { schoolYearId: activeYears[0].id, schoolId: schoolContext.schoolId }
      }
      setResponseHeader(
        'Set-Cookie',
        `${SCHOOL_YEAR_CONTEXT_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      )
      return null
    }

    return { schoolYearId, schoolId: schoolContext.schoolId }
  }
  catch (error) {
    console.error('Error getting school year context:', error)
    return null
  }
})

/**
 * Set the current school year context (switch school years)
 */
export const setSchoolYearContext = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolYearId }) => {
    const schoolContext = await getSchoolContext()
    if (!schoolContext) {
      throw new Error('No school context')
    }

    // Validate school year belongs to current school
    const schoolYears = await getSchoolYearsBySchool(schoolContext.schoolId, {})
    const validYear = schoolYears.find((sy: { id: string }) => sy.id === schoolYearId)

    if (!validYear) {
      throw new Error('Invalid school year for this school')
    }

    // Set cookie
    setResponseHeader(
      'Set-Cookie',
      `${SCHOOL_YEAR_CONTEXT_COOKIE}=${schoolYearId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    )

    return { success: true, schoolYearId }
  })
