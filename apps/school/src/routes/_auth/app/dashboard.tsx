import { createFileRoute } from '@tanstack/react-router';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export const Route = createFileRoute('/_auth/app/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Tableau de bord' }]} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur Yeko School - Système de gestion scolaire
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Élèves</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Enseignants</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+3 ce mois</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Classes</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Actives</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Taux de présence</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
