import { BookOpen, CheckCircle2, Clock, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
  isLoading?: boolean
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

export function ProgressOverviewCards({ data, isLoading }: ProgressOverviewCardsProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (!data) return null

  const cards = [
    {
      title: t('curriculum.totalClasses'),
      value: data.totalClasses,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: t('curriculum.onTrack'),
      value: data.onTrack + data.ahead,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: t('curriculum.behind'),
      value: data.slightlyBehind + data.significantlyBehind,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: t('curriculum.averageProgress'),
      value: `${data.averageProgress.toFixed(0)}%`,
      icon: Clock,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
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
