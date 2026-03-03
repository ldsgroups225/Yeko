import type { TranslationFunctions } from '../../i18n/i18n-types'
import { DatabaseError } from '@repo/data-ops/errors'
import { serverPerformanceLogger } from '@repo/logger'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
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

const latencyTelemetryMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  const startedAt = Date.now()
  const routePath = request ? new URL(request.url).pathname : 'unknown'
  const requestMethod = request?.method ?? 'POST'

  try {
    return await next()
  }
  finally {
    const durationMs = Date.now() - startedAt
    serverPerformanceLogger.performance('school.server-fn.latency', durationMs, {
      routePath,
      requestMethod,
    })
  }
})

const authServerBuilder = createServerFn({
  method: 'POST' as const,
})

type AuthServerFn = ReturnType<
  typeof authServerBuilder.middleware<[typeof latencyTelemetryMiddleware, typeof authenticatedMiddleware]>
>

export const authServerFn: AuthServerFn = authServerBuilder.middleware([
  latencyTelemetryMiddleware,
  authenticatedMiddleware,
])
