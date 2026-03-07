import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@workspace/ui/components/spinner'
import { LoginForm } from '@/components/auth/login-form'
import { AppLayout } from '@/components/layout/app-layout'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const session = authClient.useSession()

  if (session.isPending) {
    return (
      <div className="
        bg-background flex min-h-screen items-center justify-center
      "
      >
        <Spinner className="text-primary size-8" />
      </div>
    )
  }

  if (!session.data) {
    return <LoginForm />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
