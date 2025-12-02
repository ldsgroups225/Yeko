import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const session = authClient.useSession()

  return (
    <>
      {session.isPending
        ? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )
        : session.data
          ? (
            <AppLayout>
              <Outlet />
            </AppLayout>
          )
          : (
            <LoginForm />
          )}
    </>
  )
}
