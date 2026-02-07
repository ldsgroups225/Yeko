import {
  IconAlertCircle,
  IconBook,
  IconCircleCheck,
  IconClock,
  IconPlus,
  IconSchool,
  IconTrendingUp,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useEffect } from 'react'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { StatsCard } from '@/components/dashboard/stats-card'
import { SystemHealth } from '@/components/dashboard/system-health'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { dashboardStatsQueryOptions, recentActivityQueryOptions, systemHealthQueryOptions } from '@/integrations/tanstack-query/dashboard-options'
import { authClient } from '@/lib/auth-client'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { logger } = useLogger()
  const { data: session } = authClient.useSession()
  const { format: formatDate } = useDateFormatter()

  // Fetch real data using TanStack Query
  const { data: stats, isPending: statsPending, error: statsError } = useQuery(dashboardStatsQueryOptions())
  const { data: health, isPending: healthPending, error: healthError } = useQuery(systemHealthQueryOptions())
  const { data: activities, isPending: activitiesPending, error: activitiesError } = useQuery(recentActivityQueryOptions(5))

  useEffect(() => {
    logger.info('Dashboard viewed', {
      page: 'dashboard',
      timestamp: new Date().toISOString(),
      statsLoaded: !statsPending && !statsError,
      healthLoaded: !healthPending && !healthError,
      activitiesLoaded: !activitiesPending && !activitiesError,
    })
  }, [logger, statsPending, statsError, healthPending, healthError, activitiesPending, activitiesError])

  // Quick actions remain the same
  const quickActions = [
    {
      title: 'Ajouter une école',
      description: 'Enregistrer une nouvelle école partenaire',
      icon: IconPlus,
      href: '/schools/create',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Créer un programme',
      description: 'Définir des modèles de programmes ministériels',
      icon: IconBook,
      href: '/catalogs/programs',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Voir les analytiques',
      description: 'Mesures de performance du système',
      icon: IconTrendingUp,
      href: '/analytics',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Tickets de support',
      description: 'Gérer les demandes de support',
      icon: IconAlertCircle,
      href: '/support',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ]

  const recentSchools = stats?.recentSchools.map(school => ({
    ...school,
    joinedDate: formatDate(school.createdAt, 'MEDIUM'),
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
      const schoolName = activity.description.split(': ')[1] || activity.description
      action = `${schoolName} a rejoint la plateforme`
      target = 'Nouvelle inscription'
    }
    else if (activity.type === 'user_login') {
      type = 'info'
      action = `${activity.user} s'est connecté`
      target = 'Connexion système'
    }
    else if (activity.type === 'school_updated') {
      type = 'warning'
      const schoolName = activity.description.split(': ')[1] || activity.description
      action = `${schoolName} a été mis à jour`
      target = 'Modification de profil'
    }
    else if (activity.type === 'report_generated') {
      type = 'info'
      action = `Rapport généré: ${activity.description}`
      target = 'Export de données'
    }

    return {
      id: activity.id,
      action,
      target,
      date: formatDate(activity.timestamp, 'MEDIUM'),
      user: activity.user,
      // userAvatar: activity.userAvatar, // Assuming this might be available in future, currently undefined
      type,
    }
  }) || []

  const greeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir'
  const userName = session?.user?.name || 'Super Admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          {greeting}
          {', '}
          {userName}
          . Voici un aperçu de votre système aujourd'hui.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total des écoles"
          value={stats?.totalSchools || 0}
          change={12}
          changeLabel="actives ce mois"
          icon={IconSchool}
          isLoading={statsPending}
          error={statsError?.message}
        />

        <StatsCard
          title="Écoles actives"
          value={stats?.activeSchools || 0}
          change={8}
          changeLabel="ce mois"
          icon={IconCircleCheck}
          isLoading={statsPending}
          error={statsError?.message}
        />

        <StatsCard
          title="Inscriptions récentes"
          value={stats?.recentRegistrations || 0}
          change={15}
          changeLabel="ces 30 derniers jours"
          icon={IconTrendingUp}
          isLoading={statsPending}
          error={statsError?.message}
        />

        <StatsCard
          title="Écoles inactives"
          value={stats?.inactiveSchools || 0}
          change={-5}
          changeLabel="ce mois"
          icon={IconClock}
          isLoading={statsPending}
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
                      <IconSchool className="h-5 w-5 text-primary" />
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
                            <IconCircleCheck className="h-4 w-4 text-primary" />
                            <span className="text-sm text-primary">Active</span>
                          </>
                        )
                      : (
                          <>
                            <IconClock className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-secondary">En attente</span>
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
        isLoading={healthPending}
        error={healthError?.message}
        collapsedByDefault={true}
      />

      {/* Activity Feed */}
      <ActivityFeed
        activities={activityData}
        isLoading={activitiesPending}
        error={activitiesError?.message}
        limit={5}
      />
    </div>
  )
}
