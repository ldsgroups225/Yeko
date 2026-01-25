import { getAuth } from '@repo/data-ops/auth/server'
import { syncUserAuthOnLogin } from '@repo/data-ops/queries/school-admin/users'
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

async function getAuthContext() {
  const auth = getAuth()
  const req = getRequest()

  const session = await auth.api.getSession(req)
  if (!session) {
    throw new Error('Unauthorized')
  }

  // Sync user data and auto-create user account if they don't exist (registration flow)
  await syncUserAuthOnLogin(session.user.id, session.user.email, session.user.name)

  return {
    auth,
    userId: session.user.id,
    email: session.user.email,
  }
}

export const protectedFunctionMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})

export const protectedRequestMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})
