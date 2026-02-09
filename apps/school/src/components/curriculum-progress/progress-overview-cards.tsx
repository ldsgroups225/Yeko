import { IconBook, IconCircleCheck, IconClock, IconTrendingDown } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslations } from '@/i18n'

interface ProgressOverviewData {
  totalClasses: number
  onTrack: number
  slightlyBehind: number
  significantlyBehind: number
  ahead: number
  averageProgress: number
}

interface ProgressOverviewCardsProps {
  data: ProgressOverviewData | null
  isPending?: boolean
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )
}

export function ProgressOverviewCards({ data, isPending }: ProgressOverviewCardsProps) {
  const t = useTranslations()

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (!data)
    return null

  const cards = [
    {
      title: t.curriculum.totalClasses(),
      value: data.totalClasses,
      icon: IconBook,
      color: 'text-secondary',
    },
    {
      title: t.curriculum.onTrack(),
      value: data.onTrack + data.ahead,
      icon: IconCircleCheck,
      color: 'text-success',
    },
    {
      title: t.curriculum.behind(),
      value: data.slightlyBehind + data.significantlyBehind,
      icon: IconTrendingDown,
      color: 'text-destructive',
    },
    {
      title: t.curriculum.averageProgress(),
      value: `${data.averageProgress.toFixed(0)}%`,
      icon: IconClock,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
