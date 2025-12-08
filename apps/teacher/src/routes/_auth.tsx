import { getAuth } from '@repo/data-ops/auth/server'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = getAuth()
  const session = await auth.api.getSession({
    headers: new Headers(),
  })
  return session
})

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}
