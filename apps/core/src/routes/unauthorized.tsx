import { createFileRoute, redirect } from '@tanstack/react-router'
import { UnauthorizedPage } from '@/components/unauthorized'

export const Route = createFileRoute('/unauthorized')({
  beforeLoad: ({ context }) => {
    // If not authenticated, go home (to login)
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }

    // If the user has any system-scoped role, they shouldn't be here
    if (context.auth.hasSystemAccess) {
      throw redirect({
        to: '/app',
      })
    }
  },
  component: UnauthorizedPage,
})
