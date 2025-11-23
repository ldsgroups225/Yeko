import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Download,
  FileText,
  MapPin,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AnalyticsErrorBoundary } from '@/components/error-boundary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  analyticsOverviewQueryOptions,
  platformUsageQueryOptions,
  schoolsPerformanceQueryOptions,
} from '@/integrations/tanstack-query/analytics-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/analytics')({
  component: () => (
    <AnalyticsErrorBoundary>
      <AnalyticsPage />
    </AnalyticsErrorBoundary>
  ),
})

function AnalyticsPage() {
  const { logger } = useLogger()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery(
    analyticsOverviewQueryOptions(timeRange),
  )
  const { data: schoolsPerf, isLoading: schoolsPerfLoading } = useQuery(
    schoolsPerformanceQueryOptions(timeRange),
  )
  const { data: platformUsage, isLoading: usageLoading } = useQuery(
    platformUsageQueryOptions(timeRange),
  )

  useEffect(() => {
    logger.info('Analytics page viewed', {
      page: 'analytics',
      timeRange,
      activeTab,
    })
  }, [logger, timeRange, activeTab])

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      toast.info(`Génération du rapport ${format.toUpperCase()}...`)
      // TODO: Implement actual export
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`Rapport ${format.toUpperCase()} généré avec succès`)
      logger.info('Report exported', { format, timeRange })
    }
    catch (error) {
      toast.error('Erreur lors de la génération du rapport')
      logger.error('Report export failed', error instanceof Error ? error : new Error(String(error)))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytiques & Rapports</h1>
          <p className="text-muted-foreground">
            Mesures de performance du système et statistiques d'utilisation
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={v => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="schools">Performance des écoles</TabsTrigger>
          <TabsTrigger value="usage">Utilisation de la plateforme</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewLoading
              ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                )
              : (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Écoles</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview?.totalSchools || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          +
                          {overview?.schoolsGrowth || 0}
                          % vs période précédente
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview?.activeUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview?.userGrowth || 0}
                          % de croissance
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overview?.engagementRate || 0}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Utilisateurs actifs quotidiens
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overview?.avgResponseTime || 0}
                          ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Temps de réponse moyen de l'API
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
          </div>

          {/* Charts Placeholder */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendance des Inscriptions</CardTitle>
                <CardDescription>Nouvelles écoles au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Graphique à venir</p>
                    <p className="text-xs">Intégration Recharts en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Statut</CardTitle>
                <CardDescription>Distribution des écoles par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Graphique à venir</p>
                    <p className="text-xs">Intégration Recharts en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schools Performance Tab */}
        <TabsContent value="schools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Schools by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Écoles par Statut</CardTitle>
                <CardDescription>Répartition des écoles partenaires</CardDescription>
              </CardHeader>
              <CardContent>
                {schoolsPerfLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Actives</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.active || 0}
                              {' '}
                              écoles
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.active || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Inactives</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.inactive || 0}
                              {' '}
                              écoles
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.inactive || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Suspendues</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.suspended || 0}
                              {' '}
                              écoles
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.suspended || 0}</span>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Géographique</CardTitle>
                <CardDescription>Écoles par région</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Carte à venir</p>
                    <p className="text-xs">Intégration de carte en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Schools */}
          <Card>
            <CardHeader>
              <CardTitle>Écoles les Plus Performantes</CardTitle>
              <CardDescription>Basé sur l'engagement et l'utilisation</CardDescription>
            </CardHeader>
            <CardContent>
              {schoolsPerfLoading
                ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      {schoolsPerf?.topSchools.map((school: { id: string, name: string, code: string, status: string, engagementScore: number }, index: number) => (
                        <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <span className="text-lg font-bold text-primary">
                                #
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{school.name}</p>
                              <p className="text-sm text-muted-foreground">{school.code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {school.engagementScore}
                              % engagement
                            </p>
                            <Badge variant="outline">{school.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs Actifs</CardTitle>
                <CardDescription>Activité quotidienne, hebdomadaire et mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Quotidiens (DAU)</span>
                          <span className="text-2xl font-bold">{platformUsage?.dau || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Hebdomadaires (WAU)</span>
                          <span className="text-2xl font-bold">{platformUsage?.wau || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Mensuels (MAU)</span>
                          <span className="text-2xl font-bold">{platformUsage?.mau || 0}</span>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Utilisation des Fonctionnalités</CardTitle>
                <CardDescription>Modules les plus utilisés</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-3">
                        {platformUsage?.featureUsage.map((feature: { name: string, usage: number }) => (
                          <div key={feature.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{feature.name}</span>
                              <span className="font-medium">
                                {feature.usage}
                                %
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${feature.usage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
              </CardContent>
            </Card>
          </div>

          {/* API Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisation de l'API</CardTitle>
              <CardDescription>Endpoints les plus sollicités</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Graphique à venir</p>
                  <p className="text-xs">Intégration Recharts en cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
