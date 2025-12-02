import {
  AlertCircle,
  BookOpen,
  DollarSign,
  GraduationCap,
  Users,
} from 'lucide-react'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble complète de l'établissement scolaire
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Élèves"
          value="1,234"
          change="+12%"
          trend="up"
          icon={GraduationCap}
        />
        <MetricCard title="Enseignants" value="89" change="+3" trend="up" icon={Users} />
        <MetricCard title="Classes Actives" value="42" change="0" trend="neutral" icon={BookOpen} />
        <MetricCard
          title="Revenus ce mois"
          value="245,000 FCFA"
          change="+8%"
          trend="up"
          icon={DollarSign}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Actions Rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton icon={Users} label="Ajouter Utilisateur" />
          <QuickActionButton icon={GraduationCap} label="Inscrire Élève" />
          <QuickActionButton icon={BookOpen} label="Créer Classe" />
          <QuickActionButton icon={DollarSign} label="Enregistrer Paiement" />
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Activité Récente</h2>
          <div className="space-y-3">
            <ActivityItem
              title="Nouvel enseignant ajouté"
              description="Marie Kouassi - Mathématiques"
              time="Il y a 2 heures"
            />
            <ActivityItem
              title="15 élèves inscrits"
              description="Classe de 6ème A"
              time="Il y a 5 heures"
            />
            <ActivityItem
              title="Paiement reçu"
              description="45,000 FCFA - Jean Kouadio"
              time="Il y a 1 jour"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Alertes</h2>
          <div className="space-y-3">
            <AlertItem
              type="warning"
              title="Paiements en retard"
              description="23 élèves ont des frais impayés"
            />
            <AlertItem
              type="info"
              title="Fin du trimestre"
              description="Dans 15 jours - Préparer les bulletins"
            />
            <AlertItem
              type="warning"
              title="Capacité des classes"
              description="3 classes dépassent la capacité recommandée"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${trend === 'up'
            ? 'text-green-600 dark:text-green-400'
            : trend === 'down'
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground'
          }`}
        >
          {change}
        </p>
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

function QuickActionButton({ icon: Icon, label }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-md border border-border/40 bg-background p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

interface AlertItemProps {
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
}

function AlertItem({ type, title, description }: AlertItemProps) {
  const colors = {
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="flex gap-3">
      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${colors[type]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
