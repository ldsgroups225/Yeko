import type { TranslationFunctions } from '../../i18n/i18n-types'
import { DatabaseError } from '@repo/data-ops/errors'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getServerTranslations } from '../../lib/i18n-server'
import { getAuthContext } from '../middleware/auth'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

export { createServerFn } from '@tanstack/react-start'

export interface ServerContext {
  auth: { userId: string, email: string, name: string }
  school: { schoolId: string, userId: string } | null
  schoolYear: { schoolYearId: string, schoolId: string } | null
  t: TranslationFunctions
}

const authenticatedMiddleware = createMiddleware().server(async ({ next }) => {
  const auth = await getAuthContext()
  const t = getServerTranslations('fr')

  if (!auth) {
    throw new DatabaseError('UNAUTHORIZED', t.errors.unauthorized())
  }

  const school = await getSchoolContext().catch(() => null)
  const schoolYear = await getSchoolYearContext().catch(() => null)

  return next({
    context: {
      auth,
      school,
      schoolYear,
      t,
    },
  })
})

export const authServerFn = createServerFn().middleware([authenticatedMiddleware]) as any
