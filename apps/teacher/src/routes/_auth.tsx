import type { QueryClient } from '@tanstack/react-query'
import { getAuth } from '@repo/data-ops/auth/server'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { UnauthorizedScreen } from '@/components/auth/unauthorized-screen'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = getAuth()
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
})

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    // Use queryClient.fetchQuery to cache the session check.
    // On subsequent navigations within staleTime, this returns
    // instantly from cache — no server round-trip.
    const queryClient = (context as { queryClient: QueryClient }).queryClient

    const session = await queryClient.fetchQuery({
      queryKey: ['auth', 'session'],
      queryFn: () => getSession(),
      staleTime: 5 * 60 * 1000, // 5 minutes — don't re-validate on every navigation
    })

    if (!session) {
      // Clear stale cache so next attempt re-checks
      queryClient.removeQueries({ queryKey: ['auth', 'session'] })
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { isLoading, context: teacherContext } = useRequiredTeacherContext()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    )
  }

  // Verify that the authenticated user is a teacher and attached to a school
  if (!teacherContext || !teacherContext.schoolId) {
    return <UnauthorizedScreen />
  }

  return <Outlet />
}
