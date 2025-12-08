import { getTeacherByAuthUserId } from '@repo/data-ops/queries/school-admin/teachers'
import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'

import { getAuthContext } from './auth'

const SCHOOL_CONTEXT_COOKIE = 'yeko_teacher_school_id'
const SCHOOL_YEAR_CONTEXT_COOKIE = 'yeko_teacher_school_year_id'

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

export interface TeacherContext {
  teacherId: string
  schoolId: string
  schoolYearId: string | null
  userId: string
}

/**
 * Get the current teacher context
 * Returns null if user is not a teacher or not authenticated
 */
export const getTeacherContext = createServerFn().handler(async (): Promise<TeacherContext | null> => {
  try {
    const authContext = await getAuthContext()
    if (!authContext) {
      return null
    }

    // Get teacher record by auth user ID
    const teacher = await getTeacherByAuthUserId(authContext.userId)
    if (!teacher) {
      return null
    }

    const req = getRequest()
    const cookies = parseCookies(req.headers.get('cookie'))
    const schoolId = cookies[SCHOOL_CONTEXT_COOKIE] || teacher.schoolId
    const schoolYearId = cookies[SCHOOL_YEAR_CONTEXT_COOKIE] || null

    // Set school cookie if not set
    if (!cookies[SCHOOL_CONTEXT_COOKIE]) {
      setResponseHeader(
        'Set-Cookie',
        `${SCHOOL_CONTEXT_COOKIE}=${teacher.schoolId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
      )
    }

    return {
      teacherId: teacher.id,
      schoolId,
      schoolYearId,
      userId: authContext.userId,
    }
  }
  catch (error) {
    console.error('Error getting teacher context:', error)
    return null
  }
})

/**
 * Set the current school year context for teacher
 */
export const setTeacherSchoolYearContext = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async ({ data: schoolYearId }) => {
    const context = await getTeacherContext()
    if (!context) {
      throw new Error('Unauthorized')
    }

    setResponseHeader(
      'Set-Cookie',
      `${SCHOOL_YEAR_CONTEXT_COOKIE}=${schoolYearId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    )

    return { success: true, schoolYearId }
  })
