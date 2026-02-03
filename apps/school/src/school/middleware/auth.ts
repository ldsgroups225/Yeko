import { DatabaseError } from '@repo/data-ops/errors'
import { createMiddleware } from '@tanstack/react-start'

/**
 * Get auth context from the current request
 */
export async function getAuthContext() {
  const { getRequest } = await import('@tanstack/react-start/server')
  const { getAuth } = await import('@repo/data-ops/auth/server')

  const auth = getAuth()
  const req = getRequest()

  const session = await auth.api.getSession(req)
  if (!session) {
    return null
  }

  return {
    auth,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }
}

/**
 * Middleware that requires authentication
 * Throws error if user is not authenticated
 */
export const protectedFunctionMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const context = await getAuthContext()
  if (!context) {
    throw new DatabaseError('UNAUTHORIZED', 'Unauthorized')
  }
  return next({ context })
})
