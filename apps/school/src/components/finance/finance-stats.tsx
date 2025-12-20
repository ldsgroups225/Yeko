import {
  Banknote,
  CreditCard,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface FinanceStatsProps {
  totalRevenue?: number
  totalPayments?: number
  pendingPayments?: number
  overdueAmount?: number
  isLoading?: boolean
}

export function FinanceStats({
  totalRevenue = 0,
  totalPayments = 0,
  pendingPayments = 0,
  overdueAmount = 0,
  isLoading = false,
}: FinanceStatsProps) {
  const t = useTranslations()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: t.finance.income(),
      value: formatCurrency(totalRevenue),
      suffix: 'FCFA',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: t.finance.payments.title(),
      value: totalPayments.toString(),
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: t.finance.payments.status.pending(),
      value: formatCurrency(pendingPayments),
      suffix: 'FCFA',
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: t.dashboard.accountant.unpaidFees(),
      value: formatCurrency(overdueAmount),
      suffix: 'FCFA',
      icon: Banknote,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(() => (
          <Card key={generateUUID()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
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
  )
}
