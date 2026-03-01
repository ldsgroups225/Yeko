import { IconActivity, IconAlertCircle, IconAlertTriangle, IconChevronDown, IconChevronUp, IconCircleCheck } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
  collapsedByDefault?: boolean
}

export function SystemHealth({ health, isLoading, error, collapsedByDefault = false }: SystemHealthProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsedByDefault)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-4
          "
          >
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
      <Card className="
        border-destructive/20 bg-destructive/10
        dark:border-destructive/40 dark:bg-destructive/20
      "
      >
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5" />
            Santé du système
          </CardTitle>
          <CardDescription className="text-destructive">
            Impossible de charger les données de santé du système
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <IconCircleCheck className="text-primary h-4 w-4" />
      case 'warning':
        return <IconAlertTriangle className="text-secondary h-4 w-4" />
      case 'error':
        return <IconAlertCircle className="text-destructive h-4 w-4" />
      default:
        return <IconActivity className="text-muted-foreground h-4 w-4" />
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-primary'
      case 'warning':
        return 'bg-secondary'
      case 'error':
        return 'bg-destructive'
      default:
        return 'bg-muted'
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

  // Determine overall status
  const overallStatus = healthMetrics.some(m => m.status === 'error')
    ? 'error'
    : healthMetrics.some(m => m.status === 'warning')
      ? 'warning'
      : 'healthy'

  return (
    <Card className={cn('transition-all duration-300', isCollapsed ? 'pb-0' : '')}>
      <CardHeader className="
        flex flex-row items-start justify-between space-y-0 pb-2
      "
      >
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Santé du système
            {isCollapsed && (
              <span className={cn(
                `
                  ml-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-sm
                  font-normal
                `,
                overallStatus === 'healthy'
                  ? `
                    bg-primary/10 text-primary
                    dark:bg-primary/20 dark:text-primary
                  `
                  : overallStatus === 'warning'
                    ? `
                      bg-secondary/10 text-secondary
                      dark:bg-secondary/20 dark:text-secondary
                    `
                    : `
                      bg-destructive/10 text-destructive
                      dark:bg-destructive/20 dark:text-destructive
                    `,
              )}
              >
                {getStatusIcon(overallStatus)}
                {overallStatus === 'healthy' ? 'Opérationnel' : overallStatus === 'warning' ? 'Attention' : 'Erreur'}
              </span>
            )}
          </CardTitle>
          {!isCollapsed && (
            <CardDescription>
              Indicateurs de performance et de santé du système en temps réel
            </CardDescription>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed
            ? <IconChevronDown className="h-4 w-4" />
            : (
                <IconChevronUp className="h-4 w-4" />
              )}
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-6">
          <div className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-4
          "
          >
            {healthMetrics.map(item => (
              <div key={item.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-muted-foreground text-sm">{item.value}</span>
                  </div>
                </div>
                <div className="bg-secondary h-2 w-full rounded-full">
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${getProgressBarColor(item.status)}
                    `}
                    style={{
                      width: getProgressWidth(item.status),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
