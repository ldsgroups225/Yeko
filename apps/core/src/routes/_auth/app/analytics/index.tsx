import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Filter,
  School,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/analytics/')({
  component: Analytics,
})

function Analytics() {
  const { logger } = useLogger()

  useEffect(() => {
    logger.info('Analytics page viewed', {
      page: 'analytics',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration - will be replaced with real data from Phase 9+
  const analyticsData = {
    overview: {
      totalSchools: 127,
      activeSchools: 115,
      totalStudents: 45832,
      totalTeachers: 3241,
      growthRate: 12.5,
      systemHealth: 98.7,
    },
    trends: {
      schoolGrowth: [
        { month: 'Jan', schools: 110 },
        { month: 'Feb', schools: 115 },
        { month: 'Mar', schools: 118 },
        { month: 'Apr', schools: 122 },
        { month: 'May', schools: 125 },
        { month: 'Jun', schools: 127 },
      ],
      userActivity: [
        { day: 'Mon', users: 12500 },
        { day: 'Tue', users: 13200 },
        { day: 'Wed', users: 14100 },
        { day: 'Thu', users: 13800 },
        { day: 'Fri', users: 15200 },
        { day: 'Sat', users: 8900 },
        { day: 'Sun', users: 7200 },
      ],
    },
  }

  const reportTypes = [
    {
      title: 'Résumé des Écoles',
      description: 'Vue complète de toutes les écoles du système',
      icon: School,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
    },
    {
      title: 'Activité des Utilisateurs',
      description: 'Analyse détaillée de l\'engagement et de l\'activité des utilisateurs',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
    },
    {
      title: 'Santé du Système',
      description: 'Métriques de performance et rapports d\'état du système',
      icon: Activity,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 dark:bg-secondary/20',
    },
    {
      title: 'Tendances de Croissance',
      description: 'Métriques de croissance et analyse des tendances d\'utilisation',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 dark:bg-secondary/20',
    },
  ]

  const kpis = [
    {
      title: 'Taux de Croissance Mensuel',
      value: `${analyticsData.overview.growthRate}%`,
      change: '+2.3%',
      positive: true,
    },
    {
      title: 'Utilisateurs Actifs Aujourd\'hui',
      value: '15.2K',
      change: '+8.1%',
      positive: true,
    },
    {
      title: 'Santé du Système',
      value: `${analyticsData.overview.systemHealth}%`,
      change: '-0.1%',
      positive: false,
    },
    {
      title: 'Temps de Réponse',
      value: '120ms',
      change: '-15ms',
      positive: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytiques du Système</h1>
          <p className="text-muted-foreground">
            Métriques de performance à l'échelle du système et analytiques d'utilisation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Période
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exporter le Rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.positive ? 'text-primary' : 'text-destructive'}`}>
                {kpi.change}
                {' '}
                depuis le mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Génération de Rapports</CardTitle>
          <CardDescription>
            Générer des rapports complets pour différents aspects du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportTypes.map(report => (
              <div
                key={report.title}
                className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.bgColor}`}>
                  <report.icon className={`h-5 w-5 ${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{report.title}</p>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Croissance des Écoles
            </CardTitle>
            <CardDescription>
              Croissance mensuelle des écoles partenaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total des Écoles</span>
                <span className="text-sm text-muted-foreground">{analyticsData.overview.totalSchools}</span>
              </div>
              <div className="space-y-2">
                {analyticsData.trends.schoolGrowth.map(data => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm">{data.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(data.schools / analyticsData.overview.totalSchools) * 100}%`,
                          }}
                        >
                        </div>
                      </div>
                      <span className="text-sm w-8 text-right">{data.schools}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Activité des Utilisateurs
            </CardTitle>
            <CardDescription>
              Patterns d'activité hebdomadaire des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Jour de Pointe</span>
                <span className="text-sm text-muted-foreground">Vendredi</span>
              </div>
              <div className="space-y-2">
                {analyticsData.trends.userActivity.map(data => (
                  <div key={data.day} className="flex items-center justify-between">
                    <span className="text-sm">{data.day}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(data.users / 15200) * 100}%`,
                          }}
                        >
                        </div>
                      </div>
                      <span className="text-sm w-12 text-right">{data.users.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métriques de Performance du Système
          </CardTitle>
          <CardDescription>
            Indicateurs de performance et de santé du système en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Réponse Base de Données</span>
                <span className="text-sm text-muted-foreground">45ms</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Débit API</span>
                <span className="text-sm text-muted-foreground">1.2K req/s</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux d'Erreur</span>
                <span className="text-sm text-muted-foreground">0.12%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilisation Stockage</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytiques Avancées Bientôt Disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Les analytiques et rapports complets seront disponibles dans la Phase 9: Analytiques & Rapports
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Fonctionnalités à venir:</p>
              <ul className="mt-2 space-y-1">
                <li>• Graphiques et diagrammes interactifs</li>
                <li>• Rapports personnalisés avec période</li>
                <li>• Exportation PDF/Excel</li>
                <li>• Diffusion de données en temps réel</li>
                <li>• Filtrage et segmentation avancés</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
