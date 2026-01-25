import { getAuth } from '@repo/data-ops/auth/server'
import { getUserSystemRolesByAuthUserId, syncUserAuthOnLogin } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

/**
 * Consolidates authentication session and system-scoped roles
 * Used to populate the global router context and enforce RBAC
 */
export const getAuthStatus = createServerFn({ method: 'GET' })
  .handler(async () => {
    const auth = getAuth()
    const req = getRequest()

    // Better Auth getSession works by passing the request's headers
    // to search for session cookies/tokens
    const session = await auth.api.getSession({
      headers: req?.headers,
    })

    if (!session) {
      return {
        isAuthenticated: false,
        user: null,
        roles: [],
        isSuperAdmin: false,
        hasSystemAccess: false,
      }
    }

    // Sync user data and auto-create user account if they don't exist (registration flow)
    await syncUserAuthOnLogin(session.user.id, session.user.email, session.user.name)

    // Fetch system-scoped roles for the user (using Better Auth user ID)
    const roles = await getUserSystemRolesByAuthUserId(session.user.id)
    const isSuperAdmin = roles.includes('super_admin')
    const hasSystemAccess = roles.length > 0

    return {
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      roles,
      isSuperAdmin,
      hasSystemAccess,
    }
  })
