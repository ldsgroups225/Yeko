import { getUserSchoolsByAuthUserId, syncUserAuthOnLogin } from '@repo/data-ops/queries/school-admin/users'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { getAuthContext } from './auth'

export const SCHOOL_CONTEXT_COOKIE = 'yeko_school_id'
export const SCHOOL_YEAR_CONTEXT_COOKIE = 'yeko_school_year_id'

/**
 * Parse cookies from request headers
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
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
 * Get the current school context from cookie (logic only)
 */
export async function retrieveSchoolContext() {
  try {
    const authContext = await getAuthContext()
    if (!authContext) {
      return null
    }

    // Sync user auth data and update last login (non-blocking via waitUntil)
    // This also returns the internal user ID
    const internalUserId = await syncUserAuthOnLogin(authContext.userId, authContext.email)

    if (!internalUserId) {
      console.error('IconUser not found in database for email:', authContext.email)
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
        const firstSchool = schools[0]!
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
}
