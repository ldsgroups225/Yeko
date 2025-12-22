import { getSchoolYearsBySchool } from '@repo/data-ops/queries/school-admin/school-years'
import { getUserSchoolsByAuthUserId } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { getAuthContext } from './auth'

import {
  parseCookies,
  retrieveSchoolContext,
  SCHOOL_CONTEXT_COOKIE,
  SCHOOL_YEAR_CONTEXT_COOKIE,
} from './school-context-logic'

/**
 * Get the current school context from cookie
 * Returns null if no school is selected or user doesn't have access
 */
export const getSchoolContext = createServerFn().handler(async () => {
  return await retrieveSchoolContext()
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
        const activeYear = schoolYears[0]!
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
          `${SCHOOL_YEAR_CONTEXT_COOKIE}=${activeYears[0]!.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        )
        return { schoolYearId: activeYears[0]!.id, schoolId: schoolContext.schoolId }
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
