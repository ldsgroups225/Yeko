import {
  IconCashBanknote,
  IconCreditCard,
  IconPigMoney,
  IconReceipt,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
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
  isPending?: boolean
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
  isPending = false,
}: FinancialDashboardProps) {
  const t = useTranslations()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-4
        "
        >
          {Array.from({ length: 4 }).map(() => (
            <Card
              key={generateUUID()}
              className="
                border-border/40 bg-card/40 rounded-2xl backdrop-blur-xl
              "
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="
          grid gap-6
          md:grid-cols-2
        "
        >
          {Array.from({ length: 2 }).map(() => (
            <Card
              key={generateUUID()}
              className="
                border-border/40 bg-card/40 rounded-3xl backdrop-blur-xl
              "
            >
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
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 border-secondary/20',
      gradient: 'from-secondary/10 to-transparent',
    },
    {
      title: t.finance.dashboard.collected(),
      value: formatCurrency(totalCollected),
      suffix: 'FCFA',
      icon: IconTrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10 border-success/20',
      gradient: 'from-success/10 to-transparent',
    },
    {
      title: t.finance.dashboard.outstanding(),
      value: formatCurrency(totalOutstanding),
      suffix: 'FCFA',
      icon: IconTrendingDown,
      color: 'text-accent',
      bgColor: 'bg-accent/10 border-accent/20',
      gradient: 'from-accent/10 to-transparent',
    },
    {
      title: t.finance.dashboard.paymentsThisMonth(),
      value: paymentsThisMonth.toString(),
      icon: IconCreditCard,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10 border-secondary/20',
      gradient: 'from-secondary/10 to-transparent',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="
        grid gap-6
        md:grid-cols-2
        lg:grid-cols-4
      "
      >
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="
              border-border/40 bg-card/40
              hover:bg-card/60
              relative overflow-hidden rounded-2xl border shadow-sm
              backdrop-blur-xl transition-colors
            "
            >
              <div
                className={`
                  absolute inset-0 bg-linear-to-br
                  ${stat.gradient}
                  opacity-50
                `}
              />
              <CardHeader className="
                relative z-10 flex flex-row items-center justify-between
                space-y-0 pb-2
              "
              >
                <CardTitle className="
                  text-muted-foreground text-sm font-bold tracking-wide
                  uppercase
                "
                >
                  {stat.title}
                </CardTitle>
                <div className={`
                  rounded-xl border p-2.5
                  ${stat.bgColor}
                `}
                >
                  <stat.icon className={`
                    h-4 w-4
                    ${stat.color}
                  `}
                  />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-black tracking-tight">
                  {stat.value}
                  {stat.suffix && (
                    <span className="
                      text-muted-foreground/80 ml-1 text-sm font-medium
                    "
                    >
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="
        grid gap-6
        md:grid-cols-2
      "
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="
            border-border/40 bg-card/40 h-full rounded-3xl border shadow-md
            backdrop-blur-xl
          "
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="
                  bg-primary/10 border-primary/20 rounded-xl border p-2
                "
                >
                  <IconCashBanknote className="text-primary h-5 w-5" />
                </div>
                {t.finance.dashboard.collectionRate()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="
                  text-primary text-5xl font-black tracking-tight
                "
                >
                  {collectionRate.toFixed(1)}
                  %
                </span>
                <span className="
                  text-muted-foreground bg-muted/30 border-border/50
                  rounded-full border px-3 py-1 text-sm font-medium
                "
                >
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
                <p className="text-muted-foreground pl-1 text-xs font-medium">
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
          <Card className="
            border-border/40 bg-card/40 h-full rounded-3xl border shadow-md
            backdrop-blur-xl
          "
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="
                  bg-primary/10 border-primary/20 rounded-xl border p-2
                "
                >
                  <IconUsers className="text-primary h-5 w-5" />
                </div>
                {t.finance.dashboard.studentPaymentStatus()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="
                  bg-muted/20 border-border/40 space-y-1 rounded-2xl border p-4
                "
                >
                  <p className="
                    text-muted-foreground text-xs font-bold tracking-wider
                    uppercase
                  "
                  >
                    {t.finance.dashboard.totalStudents()}
                  </p>
                  <p className="text-3xl font-black">{totalStudents}</p>
                </div>
                <div className="
                  space-y-1 rounded-2xl border border-orange-500/10
                  bg-orange-500/5 p-4
                "
                >
                  <p className="
                    text-xs font-bold tracking-wider text-orange-600/80
                    uppercase
                  "
                  >
                    {t.finance.dashboard.withBalance()}
                  </p>
                  <p className="text-3xl font-black text-orange-600">
                    {studentsWithBalance}
                  </p>
                </div>
              </div>
              {refundsPending > 0 && (
                <div className="
                  bg-accent/10 border-accent/20 text-accent
                  dark:text-accent
                  flex items-center gap-3 rounded-xl border p-3
                "
                >
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
