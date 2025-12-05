import { createFileRoute, Outlet } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { AppLayout } from '@/components/layout/app-layout'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const session = authClient.useSession()

  if (session.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
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
