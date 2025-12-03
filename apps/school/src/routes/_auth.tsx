import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { LoginForm } from '@/components/auth/login-form'
import { AppLayout } from '@/components/layout/app-layout'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

function AuthLayout() {
  const session = authClient.useSession()

  return (
    <>
      {session.isPending
        ? (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <Spinner className="size-8 text-primary" />
            </div>
          )
        : session.data
          ? (
              <AppLayout>
                <AnimatedOutlet />
              </AppLayout>
            )
          : (
              <LoginForm />
            )}
    </>
  )
}
