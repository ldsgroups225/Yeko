import { getAuth } from '@repo/data-ops/auth/server'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { UnauthorizedScreen } from '@/components/auth/unauthorized-screen'
import { getTeacherContext } from '@/teacher/middleware/teacher-context'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = getAuth()
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
})

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }

    // Get teacher context to verify school association
    const teacherContext = await getTeacherContext()

    return { session, teacherContext }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { teacherContext } = Route.useRouteContext()

  // Verify that the authenticated user is a teacher and attached to a school
  if (!teacherContext || !teacherContext.schoolId) {
    return <UnauthorizedScreen />
  }

  return <Outlet />
}
