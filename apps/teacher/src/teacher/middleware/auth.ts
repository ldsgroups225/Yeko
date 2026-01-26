import { getAuth } from '@repo/data-ops/auth/server'
import { syncUserAuthOnLogin } from '@repo/data-ops/queries/school-admin/users'
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

/**
 * Get auth context from the current request
 */
export async function getAuthContext() {
  const auth = getAuth()
  const req = getRequest()

  const session = await auth.api.getSession(req)
  if (!session) {
    return null
  }

  // Ensure user exists in local database and is synced with auth provider
  await syncUserAuthOnLogin(session.user.id, session.user.email, session.user.name)

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
    throw new Error('Unauthorized')
  }
  return next({ context })
})
