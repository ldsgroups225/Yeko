import { Activity, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface HealthMetric {
  metric: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  value: string
  responseTime?: number
}

interface SystemHealthProps {
  health?: {
    database: string
    api: string
    storage: string
    uptime: string
    responseTime: number
    lastChecked: string
  }
  isLoading?: boolean
  error?: string
}

export function SystemHealth({ health, isLoading, error }: SystemHealthProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !health) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Santé du système
          </CardTitle>
          <CardDescription className="text-red-600">
            Impossible de charger les données de santé du système
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-600'
      case 'warning':
        return 'bg-yellow-600'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'healthy':
        return '90%'
      case 'warning':
        return '70%'
      case 'error':
        return '30%'
      default:
        return '50%'
    }
  }

  const healthMetrics: HealthMetric[] = [
    {
      metric: 'Base de données',
      status: health.database as HealthMetric['status'],
      value: health.database === 'healthy' ? 'Opérationnelle' : 'Erreur',
    },
    {
      metric: 'Temps de réponse API',
      status: health.responseTime < 500 ? 'healthy' : health.responseTime < 1000 ? 'warning' : 'error',
      value: `${health.responseTime}ms`,
    },
    {
      metric: 'Disponibilité',
      status: 'healthy',
      value: health.uptime,
    },
    {
      metric: 'Dernière vérification',
      status: 'healthy',
      value: new Date(health.lastChecked).toLocaleTimeString(),
    },
  ]

  return (
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
          {healthMetrics.map(item => (
            <div key={item.metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.metric}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(item.status)}`}
                  style={{
                    width: getProgressWidth(item.status),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
