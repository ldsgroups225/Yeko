import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@workspace/ui/components/spinner'
import { useEffect } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { AppLayout } from '@/components/layout/app-layout'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { authClient } from '@/lib/auth-client'
import { catalogsOptions } from '@/lib/queries/catalogs'
import { classesOptions } from '@/lib/queries/classes'
import { termsOptions } from '@/lib/queries/terms'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const session = authClient.useSession()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  useEffect(() => {
    if (session.data && schoolYearId) {
      // Background warm-up for class data, terms, and catalogs
      void queryClient.prefetchQuery(classesOptions.list({ schoolYearId }))
      void queryClient.prefetchQuery(termsOptions.list(schoolYearId))
      void queryClient.prefetchQuery(catalogsOptions.grades())
      void queryClient.prefetchQuery(catalogsOptions.series())
    }
  }, [session.data, schoolYearId, queryClient])

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
