import {
  IconActivity,
  IconCalendar,
  IconChartBar,
  IconDownload,
  IconSchool,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  analyticsOverviewQueryOptions,
  platformUsageQueryOptions,
  schoolsPerformanceQueryOptions,
} from '@/integrations/tanstack-query/analytics-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/analytics/')({
  component: Analytics,
})

type TimeRange = '7d' | '30d' | '90d' | '1y'

function Analytics() {
  const { logger } = useLogger()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const { data: overview, isLoading: overviewLoading } = useQuery(
    analyticsOverviewQueryOptions(timeRange),
  )
  const { data: schoolsPerf, isLoading: schoolsLoading } = useQuery(
    schoolsPerformanceQueryOptions(timeRange),
  )
  const { data: platformUsage, isLoading: usageLoading } = useQuery(
    platformUsageQueryOptions(timeRange),
  )

  useEffect(() => {
    logger.info('Analytics page viewed', {
      page: 'analytics',
      timeRange,
      timestamp: new Date().toISOString(),
    })
  }, [logger, timeRange])

  const handleExport = async () => {
    toast.info('Fonctionnalité d\'export en développement')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytiques du Système
          </h1>
          <p className="text-muted-foreground">
            Métriques de performance et analytiques d&apos;utilisation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={v => setTimeRange(v as TimeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <IconCalendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <IconDownload className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewLoading
          ? (
              [1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            )
          : (
              <>
                <KpiCard
                  title="Écoles Actives"
                  value={overview?.totalSchools?.toLocaleString() || '0'}
                  change={`${(overview?.schoolsGrowth ?? 0) >= 0 ? '+' : ''}${overview?.schoolsGrowth ?? 0}%`}
                  positive={(overview?.schoolsGrowth ?? 0) >= 0}
                  icon={IconSchool}
                />
                <KpiCard
                  title="Utilisateurs Actifs"
                  value={(overview?.activeUsers || 0).toLocaleString()}
                  change={`${(overview?.userGrowth ?? 0) >= 0 ? '+' : ''}${overview?.userGrowth ?? 0}%`}
                  positive={(overview?.userGrowth ?? 0) >= 0}
                  icon={IconUsers}
                />
                <KpiCard
                  title="Taux d'Engagement"
                  value={`${overview?.engagementRate || 0}%`}
                  change="+2.3%"
                  positive
                  icon={IconTrendingUp}
                />
                <KpiCard
                  title="Temps de Réponse"
                  value={`${overview?.avgResponseTime || 0}ms`}
                  change="-15ms"
                  positive
                  icon={IconActivity}
                />
              </>
            )}
      </div>

      {/* Platform Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DAU/WAU/MAU */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Utilisateurs Actifs
            </CardTitle>
            <CardDescription>
              Activité des utilisateurs sur différentes périodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading
              ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                )
              : (
                  <div className="space-y-4">
                    <UsageBar
                      label="Journalier (DAU)"
                      value={platformUsage?.dau || 0}
                      max={platformUsage?.mau || 1}
                    />
                    <UsageBar
                      label="Hebdomadaire (WAU)"
                      value={platformUsage?.wau || 0}
                      max={platformUsage?.mau || 1}
                    />
                    <UsageBar
                      label="Mensuel (MAU)"
                      value={platformUsage?.mau || 0}
                      max={platformUsage?.mau || 1}
                    />
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5" />
              Utilisation des Fonctionnalités
            </CardTitle>
            <CardDescription>
              Fonctionnalités les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading
              ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                )
              : (
                  <div className="space-y-3">
                    {platformUsage?.featureUsage?.slice(0, 5).map(feature => (
                      <div key={feature.name} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {feature.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {feature.usage}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${feature.usage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </CardContent>
        </Card>
      </div>

      {/* Schools Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schools by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSchool className="h-5 w-5" />
              Écoles par Statut
            </CardTitle>
            <CardDescription>
              Répartition des écoles par statut d&apos;activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolsLoading
              ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                )
              : (
                  <div className="space-y-4">
                    <StatusBar
                      label="Actives"
                      count={schoolsPerf?.byStatus?.active || 0}
                      color="bg-green-500"
                    />
                    <StatusBar
                      label="Inactives"
                      count={schoolsPerf?.byStatus?.inactive || 0}
                      color="bg-gray-400"
                    />
                    <StatusBar
                      label="Suspendues"
                      count={schoolsPerf?.byStatus?.suspended || 0}
                      color="bg-red-500"
                    />
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Top Schools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Top Écoles
            </CardTitle>
            <CardDescription>
              Écoles avec le meilleur engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolsLoading
              ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                )
              : (
                  <div className="space-y-2">
                    {schoolsPerf?.topSchools?.slice(0, 5).map((school, index) => (
                      <div
                        key={school.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {school.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {school.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {school.engagementScore}
                            %
                          </p>
                          <p className="text-xs text-muted-foreground">
                            engagement
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Métriques de Performance du Système
          </CardTitle>
          <CardDescription>
            Indicateurs de performance en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageLoading
            ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              )
            : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <PerformanceMetric
                    label="Requêtes API"
                    value={`${platformUsage?.apiEndpoints?.reduce((sum, e) => sum + e.requests, 0)?.toLocaleString() || 0}`}
                    sublabel="Total aujourd'hui"
                  />
                  <PerformanceMetric
                    label="Temps Réponse"
                    value={`${Math.round((platformUsage?.apiEndpoints?.reduce((sum, e) => sum + e.avgResponseTime, 0) || 0) / (platformUsage?.apiEndpoints?.length || 1) || 0)}ms`}
                    sublabel="Moyenne"
                  />
                  <PerformanceMetric
                    label="Pic d'Activité"
                    value={`${platformUsage?.peakUsageTimes?.reduce((max, p) => Math.max(max, p.requests), 0) ?? 0}`}
                    sublabel="Requêtes/heure"
                  />
                  <PerformanceMetric
                    label="Fonctionnalités"
                    value={`${platformUsage?.featureUsage?.length || 0}`}
                    sublabel="Modules actifs"
                  />
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  )
}

// KPI Card Component
function KpiCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}
        >
          {change}
          {' '}
          depuis la période précédente
        </p>
      </CardContent>
    </Card>
  )
}

// Usage Bar Component
function UsageBar({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Status Bar Component
function StatusBar({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  const total = 100 // Placeholder for total calculation
  const percentage = Math.round((count / total) * 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Performance Metric Component
function PerformanceMetric({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel: string
}) {
  return (
    <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}
