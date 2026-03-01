import type { Icon as TablerIcon } from '@tabler/icons-react'
import { IconAlertCircle, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: TablerIcon
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
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="
        border-destructive/20 bg-destructive/10
        dark:border-destructive/40 dark:bg-destructive/20
      "
      >
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-destructive text-sm font-medium">{title}</CardTitle>
          <Icon className="text-destructive h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <IconAlertCircle className="text-destructive h-4 w-4" />
            <span className="text-destructive text-sm">Erreur de chargement</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="
        flex flex-row items-center justify-between space-y-0 pb-2
      "
      >
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change !== undefined && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            {isPositive && <IconTrendingUp className="text-primary h-3 w-3" />}
            {isNegative && (
              <IconTrendingDown className="text-destructive h-3 w-3" />
            )}
            <span className={isPositive
              ? 'text-primary'
              : isNegative
                ? `text-destructive`
                : ''}
            >
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
