import { IconCashBanknote, IconCreditCard, IconReceipt, IconTrendingUp } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface FinanceStatsProps {
  totalRevenue?: number
  totalPayments?: number
  pendingPayments?: number
  overdueAmount?: number
  isPending?: boolean
}

export function FinanceStats({
  totalRevenue = 0,
  totalPayments = 0,
  pendingPayments = 0,
  overdueAmount = 0,
  isPending = false,
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
      icon: IconTrendingUp,
      color: 'text-success',
      bgColor: 'bg-linear-to-br from-success/20 to-success/5 border-success/20',
      borderColor: 'border-success/20',
    },
    {
      title: t.finance.payments.title(),
      value: totalPayments.toString(),
      icon: IconCreditCard,
      color: 'text-secondary',
      bgColor: 'bg-linear-to-br from-secondary/20 to-secondary/5 border-secondary/20',
      borderColor: 'border-secondary/20',
    },
    {
      title: t.finance.payments.status.pending(),
      value: formatCurrency(pendingPayments),
      suffix: 'FCFA',
      icon: IconReceipt,
      color: 'text-accent-foreground',
      bgColor: 'bg-linear-to-br from-accent/20 to-accent/5 border-accent/20',
      borderColor: 'border-accent/20',
    },
    {
      title: t.dashboard.accountant.unpaidFees(),
      value: formatCurrency(overdueAmount),
      suffix: 'FCFA',
      icon: IconCashBanknote,
      color: 'text-destructive',
      bgColor: 'bg-linear-to-br from-destructive/20 to-destructive/5 border-destructive/20',
      borderColor: 'border-destructive/20',
    },
  ]

  if (isPending) {
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
