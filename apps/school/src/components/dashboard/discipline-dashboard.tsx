import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export function DisciplineDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tableau de bord Responsable Discipline
        </h1>
        <p className="text-muted-foreground">
          Suivi de la présence, ponctualité et conduite des élèves
        </p>
      </div>

      {/* Attendance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Taux de présence"
          value="94.5%"
          subtitle="Cette semaine"
          icon={CheckCircle}
          trend="positive"
        />
        <MetricCard
          title="Absences"
          value="67"
          subtitle="Aujourd'hui"
          icon={AlertTriangle}
          trend="negative"
        />
        <MetricCard
          title="Retards"
          value="23"
          subtitle="Aujourd'hui"
          icon={Clock}
          trend="negative"
        />
        <MetricCard
          title="Incidents"
          value="5"
          subtitle="Cette semaine"
          icon={AlertTriangle}
          trend="neutral"
        />
      </div>

      {/* Today's Absences */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Absences du Jour</h2>
        <div className="space-y-3">
          <AbsenceItem
            name="Jean Kouadio"
            class="3ème A"
            status="justified"
            reason="Maladie (certificat médical)"
          />
          <AbsenceItem
            name="Marie Diallo"
            class="2nde B"
            status="unjustified"
            reason="Non justifiée"
          />
          <AbsenceItem
            name="Kofi Mensah"
            class="1ère C"
            status="pending"
            reason="En attente de justification"
          />
        </div>
      </div>

      {/* Conduct & Punctuality */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Incidents de Conduite</h2>
          <div className="space-y-3">
            <ConductItem
              name="Ama Asante"
              class="4ème A"
              incident="Perturbation en classe"
              severity="minor"
              date="Aujourd'hui"
            />
            <ConductItem
              name="Kwame Nkrumah"
              class="3ème B"
              incident="Conflit avec un camarade"
              severity="moderate"
              date="Hier"
            />
            <ConductItem
              name="Fatou Sow"
              class="2nde C"
              incident="Manque de respect"
              severity="major"
              date="Il y a 2 jours"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Retards Fréquents</h2>
          <div className="space-y-3">
            <LateItem name="Ibrahim Traoré" class="6ème A" count={8} period="Ce mois" />
            <LateItem name="Aisha Bamba" class="5ème B" count={6} period="Ce mois" />
            <LateItem name="Yao Kouassi" class="4ème C" count={5} period="Ce mois" />
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
  trend: 'positive' | 'negative' | 'neutral'
}

function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  const trendColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

interface AbsenceItemProps {
  name: string
  class: string
  status: 'justified' | 'unjustified' | 'pending'
  reason: string
}

function AbsenceItem({ name, class: className, status, reason }: AbsenceItemProps) {
  const statusConfig = {
    justified: { label: 'Justifiée', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    unjustified: { label: 'Non justifiée', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{className}</p>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </div>
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig[status].color}`}>
        {statusConfig[status].label}
      </span>
    </div>
  )
}

interface ConductItemProps {
  name: string
  class: string
  incident: string
  severity: 'minor' | 'moderate' | 'major'
  date: string
}

function ConductItem({ name, class: className, incident, severity, date }: ConductItemProps) {
  const severityConfig = {
    minor: { label: 'Mineur', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    moderate: { label: 'Modéré', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
    major: { label: 'Grave', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  }

  return (
    <div className="space-y-2 rounded-md border border-border/40 bg-background p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{className}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${severityConfig[severity].color}`}>
          {severityConfig[severity].label}
        </span>
      </div>
      <p className="text-sm">{incident}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  )
}

interface LateItemProps {
  name: string
  class: string
  count: number
  period: string
}

function LateItem({ name, class: className, count, period }: LateItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{className}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">
          {count}
          {' '}
          retards
        </p>
        <p className="text-xs text-muted-foreground">{period}</p>
      </div>
    </div>
  )
}
