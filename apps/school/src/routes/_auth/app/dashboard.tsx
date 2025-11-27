import { createFileRoute } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { useRole } from '@/hooks/use-role';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CoordinatorDashboard } from '@/components/dashboard/coordinator-dashboard';
import { DisciplineDashboard } from '@/components/dashboard/discipline-dashboard';
import { AccountantDashboard } from '@/components/dashboard/accountant-dashboard';
import { CashierDashboard } from '@/components/dashboard/cashier-dashboard';
import { RegistrarDashboard } from '@/components/dashboard/registrar-dashboard';

export const Route = createFileRoute('/_auth/app/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Tableau de bord' }]} />

      {role === 'school_administrator' && <AdminDashboard />}
      {role === 'academic_coordinator' && <CoordinatorDashboard />}
      {role === 'discipline_officer' && <DisciplineDashboard />}
      {role === 'accountant' && <AccountantDashboard />}
      {role === 'cashier' && <CashierDashboard />}
      {role === 'registrar' && <RegistrarDashboard />}

      {!role && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Aucun rôle attribué</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Contactez l'administrateur pour obtenir un accès
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
