import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  School,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { logger } = useLogger()

  useEffect(() => {
    logger.info('Dashboard viewed', {
      page: 'dashboard',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration - will be replaced with real data from Phase 4+
  const stats = {
    totalSchools: 127,
    activeSchools: 115,
    totalStudents: 45832,
    totalTeachers: 3241,
    recentActivity: 42,
    pendingApprovals: 8,
  }

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
      href: '/programs',
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

  const recentSchools = [
    { id: 1, name: 'Lycée Saint-Exupéry', status: 'active', joinedDate: '2025-01-15' },
    { id: 2, name: 'Collège Jean-Moulin', status: 'pending', joinedDate: '2025-01-14' },
    { id: 3, name: 'Ecole Primaire Victor Hugo', status: 'active', joinedDate: '2025-01-13' },
    { id: 4, name: 'Lycée Marie Curie', status: 'active', joinedDate: '2025-01-12' },
  ]

  const systemHealth = [
    { metric: 'Base de données', status: 'healthy', value: '99.9%' },
    { metric: 'Temps de réponse API', status: 'healthy', value: '120ms' },
    { metric: 'Temps de disponibilité', status: 'healthy', value: '30 jours' },
    { metric: 'Stockage', status: 'warning', value: '78%' },
  ]

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des écoles</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +
                {stats.activeSchools}
              </span>
              {' '}
              actives ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span>
              {' '}
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span>
              {' '}
              depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approbations en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Nécessite une attention
            </p>
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Santé du système
          </CardTitle>
          <CardDescription>
            Indicateurs de performance et de santé du système en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemHealth.map(item => (
              <div key={item.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.status === 'healthy'
                      ? 'bg-green-600'
                      : item.status === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{
                      width: item.status === 'healthy' ? '90%' : item.status === 'warning' ? '70%' : '50%',
                    }}
                  >
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
