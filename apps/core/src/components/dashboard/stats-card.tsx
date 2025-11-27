import type { LucideIcon } from 'lucide-react'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  isLoading?: boolean
  error?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  isLoading,
  error,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24 mt-2" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/10 dark:border-destructive/40 dark:bg-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">{title}</CardTitle>
          <Icon className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Erreur de chargement</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isPositive && <TrendingUp className="h-3 w-3 text-primary" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className={isPositive ? 'text-primary' : isNegative ? 'text-destructive' : ''}>
              {change > 0 ? '+' : ''}
              {change}
              %
            </span>
            {changeLabel && ` ${changeLabel}`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
