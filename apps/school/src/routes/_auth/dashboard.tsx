import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@workspace/ui/components/page-header'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AccountantDashboard } from '@/components/dashboard/accountant-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { CashierDashboard } from '@/components/dashboard/cashier-dashboard'
import { CoordinatorDashboard } from '@/components/dashboard/coordinator-dashboard'
import { DisciplineDashboard } from '@/components/dashboard/discipline-dashboard'
import { OnboardingWidget } from '@/components/dashboard/onboarding-widget'
import { RegistrarDashboard } from '@/components/dashboard/registrar-dashboard'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useRole } from '@/hooks/use-role'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const t = useTranslations()
  const { role, isPending } = useRole()

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="
          grid gap-4
          md:grid-cols-2
          lg:grid-cols-4
        "
        >
          {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map(key => (
            <Skeleton key={key} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="
          grid gap-4
          md:grid-cols-2
          lg:grid-cols-7
        "
        >
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t.nav.dashboard() }]} />

      <PageHeader
        title={t.nav.dashboard()}
        description={t.dashboard.description()}
      />

      {role === 'school_director' && (
        <>
          <OnboardingWidget />
          <AdminDashboard />
        </>
      )}
      {role === 'academic_coordinator' && <CoordinatorDashboard />}
      {role === 'discipline_officer' && <DisciplineDashboard />}
      {role === 'accountant' && <AccountantDashboard />}
      {role === 'cashier' && <CashierDashboard />}
      {role === 'registrar' && <RegistrarDashboard />}

      {!role && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">
              {t.dashboard.noRoleAssigned()}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t.dashboard.contactAdmin()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
