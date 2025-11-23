import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityItem {
  id: string
  action: string
  target: string
  date: string
  user: string
  type: 'success' | 'info' | 'warning' | 'error'
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
  isLoading?: boolean
  error?: string
  limit?: number
}

export function ActivityFeed({ activities, isLoading, error, limit = 5 }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-600">Activité récente</CardTitle>
          <CardDescription className="text-red-600">
            Impossible de charger les données d'activité
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Dernières activités dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'Succès'
      case 'warning':
        return 'Attention'
      case 'error':
        return 'Erreur'
      default:
        return 'Info'
    }
  }

  const displayActivities = activities.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Dernières activités dans le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {activity.action}
                  </p>
                  <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                    {getTypeLabel(activity.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.target}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Par
                    {' '}
                    {activity.user}
                  </span>
                  <span>{activity.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
