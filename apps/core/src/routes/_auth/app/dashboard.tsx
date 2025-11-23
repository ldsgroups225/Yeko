import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  School,
  TrendingUp,
} from 'lucide-react'
import { useEffect } from 'react'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { StatsCard } from '@/components/dashboard/stats-card'
import { SystemHealth } from '@/components/dashboard/system-health'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardStatsQueryOptions, recentActivityQueryOptions, systemHealthQueryOptions } from '@/integrations/tanstack-query/dashboard-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { logger } = useLogger()

  // Fetch real data using TanStack Query
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(dashboardStatsQueryOptions())
  const { data: health, isLoading: healthLoading, error: healthError } = useQuery(systemHealthQueryOptions())
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery(recentActivityQueryOptions(5))

  useEffect(() => {
    logger.info('Dashboard viewed', {
      page: 'dashboard',
      timestamp: new Date().toISOString(),
      statsLoaded: !statsLoading && !statsError,
      healthLoaded: !healthLoading && !healthError,
      activitiesLoaded: !activitiesLoading && !activitiesError,
    })
  }, [logger, statsLoading, statsError, healthLoading, healthError, activitiesLoading, activitiesError])

  // Quick actions remain the same
  const quickActions = [
    {
      title: 'Ajouter une école',
      description: 'Enregistrer une nouvelle école partenaire',
      icon: Plus,
      href: '/schools/create',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Créer un programme',
      description: 'Définir des modèles de programmes ministériels',
      icon: BookOpen,
      href: '/catalogs/programs',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Voir les analytiques',
      description: 'Mesures de performance du système',
      icon: TrendingUp,
      href: '/analytics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Tickets de support',
      description: 'Gérer les demandes de support',
      icon: AlertCircle,
      href: '/support',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  const recentSchools = stats?.recentSchools.map(school => ({
    ...school,
    joinedDate: new Date(school.createdAt).toLocaleDateString(),
  })) || []

  // Transform health data for component
  const healthData = health
    ? {
        database: health.database.status,
        api: health.api.status,
        storage: health.storage.status,
        uptime: health.api.uptime,
        responseTime: Number.parseInt(health.database.latency) || 0,
        lastChecked: new Date().toISOString(),
      }
    : undefined

  // Transform activity data for component
  const activityData = activities?.map((activity) => {
    let type: 'success' | 'info' | 'warning' | 'error' = 'info'
    let action: string = activity.type
    let target = activity.description

    if (activity.type === 'school_created') {
      type = 'success'
      action = 'Nouvelle école'
      target = activity.description.split(': ')[1] || activity.description
    }
    else if (activity.type === 'user_login') {
      type = 'info'
      action = 'Connexion'
      target = activity.user
    }
    else if (activity.type === 'school_updated') {
      type = 'warning'
      action = 'Mise à jour'
      target = activity.description.split(': ')[1] || activity.description
    }
    else if (activity.type === 'report_generated') {
      type = 'info'
      action = 'Rapport'
      target = activity.description
    }

    return {
      id: activity.id,
      action,
      target,
      date: new Date(activity.timestamp).toLocaleDateString(),
      user: activity.user,
      type,
    }
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue dans le tableau de bord Super Administrateur de Yeko Core. Voici un aperçu de votre système.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des écoles"
          value={stats?.totalSchools || 0}
          change={12}
          changeLabel="actives ce mois"
          icon={School}
          isLoading={statsLoading}
          error={statsError?.message}
        />

        <StatsCard
          title="Écoles actives"
          value={stats?.activeSchools || 0}
          change={8}
          changeLabel="ce mois"
          icon={CheckCircle}
          isLoading={statsLoading}
          error={statsError?.message}
        />

        <StatsCard
          title="Inscriptions récentes"
          value={stats?.recentRegistrations || 0}
          change={15}
          changeLabel="ces 30 derniers jours"
          icon={TrendingUp}
          isLoading={statsLoading}
          error={statsError?.message}
        />

        <StatsCard
          title="Écoles inactives"
          value={stats?.inactiveSchools || 0}
          change={-5}
          changeLabel="ce mois"
          icon={Clock}
          isLoading={statsLoading}
          error={statsError?.message}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Tâches courantes pour gérer votre écosystème Yeko
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickActions.map(action => (
              <div
                key={action.title}
                className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Schools */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Écoles récentes</CardTitle>
            <CardDescription>
              Dernières écoles partenaires à rejoindre la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchools.map(school => (
                <div key={school.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <School className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {school.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rejoint
                        {' '}
                        {school.joinedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {school.status === 'active'
                      ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        )
                      : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-600">En attente</span>
                          </>
                        )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <SystemHealth
        health={healthData}
        isLoading={healthLoading}
        error={healthError?.message}
      />

      {/* Activity Feed */}
      <ActivityFeed
        activities={activityData}
        isLoading={activitiesLoading}
        error={activitiesError?.message}
        limit={5}
      />
    </div>
  )
}
