import { BookOpen, ClipboardCheck, TrendingUp, Users } from 'lucide-react'

export function CoordinatorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tableau de bord Coordinateur Académique
        </h1>
        <p className="text-muted-foreground">
          Gestion du curriculum et suivi de la progression académique
        </p>
      </div>

      {/* Academic Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Matières" value="24" subtitle="8 niveaux" icon={BookOpen} />
        <MetricCard title="Notes en attente" value="156" subtitle="À valider" icon={ClipboardCheck} />
        <MetricCard title="Moyenne générale" value="12.8/20" subtitle="+0.5 pts" icon={TrendingUp} />
        <MetricCard title="Enseignants" value="89" subtitle="Actifs" icon={Users} />
      </div>

      {/* Validation Queue */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Notes à Valider</h2>
        <div className="space-y-3">
          <ValidationItem
            subject="Mathématiques"
            teacher="M. Kouassi"
            class="3ème A"
            count={28}
            date="Il y a 2 heures"
          />
          <ValidationItem
            subject="Français"
            teacher="Mme Diallo"
            class="2nde C"
            count={32}
            date="Il y a 5 heures"
          />
          <ValidationItem
            subject="Physique-Chimie"
            teacher="M. Traoré"
            class="1ère D"
            count={25}
            date="Il y a 1 jour"
          />
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Performance par Niveau</h2>
          <div className="space-y-4">
            <PerformanceBar level="6ème" average="13.2" percentage={66} />
            <PerformanceBar level="5ème" average="12.8" percentage={64} />
            <PerformanceBar level="4ème" average="12.5" percentage={62} />
            <PerformanceBar level="3ème" average="12.1" percentage={60} />
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Matières à Risque</h2>
          <div className="space-y-3">
            <RiskItem subject="Mathématiques 3ème" average="9.2/20" status="critical" />
            <RiskItem subject="Physique 2nde" average="10.1/20" status="warning" />
            <RiskItem subject="Anglais 4ème" average="10.8/20" status="warning" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

interface ValidationItemProps {
  subject: string
  teacher: string
  class: string
  count: number
  date: string
}

function ValidationItem({ subject, teacher, class: className, count, date }: ValidationItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{subject}</p>
        <p className="text-xs text-muted-foreground">
          {teacher}
          {' '}
          •
          {className}
          {' '}
          •
          {count}
          {' '}
          notes
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Valider
      </button>
    </div>
  )
}

interface PerformanceBarProps {
  level: string
  average: string
  percentage: number
}

function PerformanceBar({ level, average, percentage }: PerformanceBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{level}</span>
        <span className="text-muted-foreground">
          {average}
          /20
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface RiskItemProps {
  subject: string
  average: string
  status: 'critical' | 'warning'
}

function RiskItem({ subject, average, status }: RiskItemProps) {
  const statusColors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{subject}</p>
        <p className="text-xs text-muted-foreground">
          Moyenne:
          {average}
        </p>
      </div>
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[status]}`}>
        {status === 'critical' ? 'Critique' : 'Attention'}
      </span>
    </div>
  )
}
