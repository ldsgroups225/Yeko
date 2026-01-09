'use client'

import { IconCashBanknote, IconCreditCard, IconPigMoney, IconReceipt, IconTrendingDown, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(() => (
            <Card key={generateUUID()} className="rounded-2xl border-border/40 bg-card/40 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map(() => (
            <Card key={generateUUID()} className="rounded-3xl border-border/40 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const mainStats = [
    {
      title: t.finance.dashboard.expectedRevenue(),
      value: formatCurrency(totalExpectedRevenue),
      suffix: 'FCFA',
      icon: IconPigMoney,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      gradient: 'from-blue-500/10 to-transparent',
    },
    {
      title: t.finance.dashboard.collected(),
      value: formatCurrency(totalCollected),
      suffix: 'FCFA',
      icon: IconTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10 border-green-500/20',
      gradient: 'from-green-500/10 to-transparent',
    },
    {
      title: t.finance.dashboard.outstanding(),
      value: formatCurrency(totalOutstanding),
      suffix: 'FCFA',
      icon: IconTrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      gradient: 'from-orange-500/10 to-transparent',
    },
    {
      title: t.finance.dashboard.paymentsThisMonth(),
      value: paymentsThisMonth.toString(),
      icon: IconCreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      gradient: 'from-purple-500/10 to-transparent',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-colors shadow-sm overflow-hidden relative">
              <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-50`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-xl p-2.5 border ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
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

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <IconCashBanknote className="h-5 w-5 text-primary" />
                </div>
                {t.finance.dashboard.collectionRate()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-black tracking-tight text-primary">
                  {collectionRate.toFixed(1)}
                  %
                </span>
                <span className="text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                  {formatCurrency(totalCollected)}
                  {' '}
                  /
                  {formatCurrency(totalExpectedRevenue)}
                  {' '}
                  FCFA
                </span>
              </div>
              <div className="space-y-2">
                <Progress value={collectionRate} className="h-3 rounded-full" />
                <p className="text-xs text-muted-foreground font-medium pl-1">
                  {t.finance.dashboard.collectionRateDescription()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <IconUsers className="h-5 w-5 text-primary" />
                </div>
                {t.finance.dashboard.studentPaymentStatus()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.finance.dashboard.totalStudents()}</p>
                  <p className="text-3xl font-black">{totalStudents}</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600/80">{t.finance.dashboard.withBalance()}</p>
                  <p className="text-3xl font-black text-orange-600">{studentsWithBalance}</p>
                </div>
              </div>
              {refundsPending > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-500">
                  <IconReceipt className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    {refundsPending}
                    {' '}
                    {t.finance.dashboard.refundsPending()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
