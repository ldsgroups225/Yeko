import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

async function getAuthContext() {
  const { getAuth } = await import('@repo/data-ops/auth/server')
  const { syncUserAuthOnLogin } = await import('@repo/data-ops/queries/school-admin/users')

  const auth = getAuth()
  const req = getRequest()

  const session = await auth.api.getSession({
    headers: req?.headers,
  })
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

export const protectedFunctionMiddleware = createMiddleware().server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})

export const protectedRequestMiddleware = createMiddleware().server(async ({ next }) => {
  const context = await getAuthContext()
  return next({ context })
})
