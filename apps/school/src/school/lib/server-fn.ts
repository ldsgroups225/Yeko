import { DatabaseError } from '@repo/data-ops/errors'
import { databaseLogger } from '@repo/logger'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getAuthContext } from '../middleware/auth'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

export interface ServerContext {
  auth: { userId: string, email: string, name: string }
  school: { schoolId: string, userId: string } | null
  schoolYear: { schoolYearId: string, schoolId: string } | null
}

const authenticatedMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const auth = await getAuthContext()
    if (!auth) {
      throw new DatabaseError('UNAUTHORIZED', 'Unauthorized: No valid session')
    }

    const school = await getSchoolContext().catch(() => null)
    // Note: School context might be null for non-school specific actions

    const schoolYear = await getSchoolYearContext().catch(() => null)

    const result = await next({
      context: {
        auth,
        school,
        schoolYear,
      },
    })

    return result
  }
  catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    // Log the full error with stack trace and context
    databaseLogger.error('Unhandled Server Function Error', err)

    return {
      success: false as const,
      error: err.message || 'Internal Server Error',
    } as any
  }
})

export const createAuthenticatedServerFn = () => createServerFn().middleware([authenticatedMiddleware])
