'use client'

import {
  Banknote,
  CreditCard,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { generateUUID } from '@/utils/generateUUID'

interface FinancialDashboardProps {
  totalExpectedRevenue?: number
  totalCollected?: number
  totalOutstanding?: number
  collectionRate?: number
  totalStudents?: number
  studentsWithBalance?: number
  paymentsThisMonth?: number
  refundsPending?: number
  isLoading?: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function FinancialDashboard({
  totalExpectedRevenue = 0,
  totalCollected = 0,
  totalOutstanding = 0,
  collectionRate = 0,
  totalStudents = 0,
  studentsWithBalance = 0,
  paymentsThisMonth = 0,
  refundsPending = 0,
  isLoading = false,
}: FinancialDashboardProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(() => (
            <Card key={generateUUID()}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const mainStats = [
    {
      title: t('finance.dashboard.expectedRevenue'),
      value: formatCurrency(totalExpectedRevenue),
      suffix: 'FCFA',
      icon: PiggyBank,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: t('finance.dashboard.collected'),
      value: formatCurrency(totalCollected),
      suffix: 'FCFA',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: t('finance.dashboard.outstanding'),
      value: formatCurrency(totalOutstanding),
      suffix: 'FCFA',
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: t('finance.dashboard.paymentsThisMonth'),
      value: paymentsThisMonth.toString(),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.suffix && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              {t('finance.dashboard.collectionRate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">
                {collectionRate.toFixed(1)}
                %
              </span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalCollected)}
                {' '}
                /
                {formatCurrency(totalExpectedRevenue)}
                {' '}
                FCFA
              </span>
            </div>
            <Progress value={collectionRate} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {t('finance.dashboard.collectionRateDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('finance.dashboard.studentPaymentStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('finance.dashboard.totalStudents')}</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('finance.dashboard.withBalance')}</p>
                <p className="text-2xl font-bold text-orange-600">{studentsWithBalance}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                {refundsPending}
                {' '}
                {t('finance.dashboard.refundsPending')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
