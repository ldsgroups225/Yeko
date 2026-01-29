import { DatabaseError } from '@repo/data-ops/errors'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getAuthContext } from '../middleware/auth'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

export interface ServerContext {
  auth: { userId: string, email: string, name: string }
  school: { schoolId: string, userId: string } | null
  schoolYear: { schoolYearId: string, schoolId: string } | null
}

const authenticatedMiddleware = createMiddleware().server(async ({ next }) => {
  const auth = await getAuthContext()
  if (!auth) {
    throw new DatabaseError('UNAUTHORIZED', 'Unauthorized: No valid session')
  }

  const school = await getSchoolContext().catch(() => null)
  const schoolYear = await getSchoolYearContext().catch(() => null)

  return next({
    context: {
      auth,
      school,
      schoolYear,
    },
  })
})

export const authServerFn = createServerFn().middleware([authenticatedMiddleware])
