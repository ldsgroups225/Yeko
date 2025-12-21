import {
  Banknote,
  CreditCard,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'
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
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-linear-to-br from-green-500/20 to-green-500/5 border-green-500/20',
      borderColor: 'border-green-200 dark:border-green-800/30',
    },
    {
      title: t.finance.payments.title(),
      value: totalPayments.toString(),
      icon: CreditCard,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-linear-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20',
      borderColor: 'border-blue-200 dark:border-blue-800/30',
    },
    {
      title: t.finance.payments.status.pending(),
      value: formatCurrency(pendingPayments),
      suffix: 'FCFA',
      icon: Receipt,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-linear-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800/30',
    },
    {
      title: t.dashboard.accountant.unpaidFees(),
      value: formatCurrency(overdueAmount),
      suffix: 'FCFA',
      icon: Banknote,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-linear-to-br from-red-500/20 to-red-500/5 border-red-500/20',
      borderColor: 'border-red-200 dark:border-red-800/30',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(() => (
          <Card key={generateUUID()} className="rounded-2xl border-border/40 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`rounded-2xl border bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 ${stat.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl border backdrop-blur-md ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">
                {stat.value}
                {stat.suffix && (
                  <span className="ml-1 text-sm font-medium text-muted-foreground/80">
                    {stat.suffix}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
