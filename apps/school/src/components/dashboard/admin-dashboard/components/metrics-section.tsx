import { formatCurrency, formatNumber } from '@repo/data-ops'
import { IconBook, IconCurrencyDollar, IconSchool, IconUsers } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { container, item } from '../constants'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="
        group border-border/40 bg-card/60 relative overflow-hidden rounded-xl
        border p-6 shadow-sm backdrop-blur-xl transition-all
        hover:shadow-lg
      "
    >
      <div className="
        bg-primary/10
        group-hover:bg-primary/20
        absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl transition-all
      "
      />
      <div className="relative flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <div className="bg-primary/10 text-primary rounded-full p-2">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={`
              text-xs
              ${trend === 'up'
            ? 'text-success'
            : trend === 'down'
              ? 'text-destructive'
              : 'text-muted-foreground'
          }
            `}
          >
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}

interface MetricsSectionProps {
  metrics: any
  t: any
}

export function MetricsSection({ metrics, t }: MetricsSectionProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="
        grid gap-4
        md:grid-cols-2
        lg:grid-cols-4
      "
    >
      <MetricCard
        title={t.dashboard.totalStudents()}
        value={formatNumber(metrics?.totalStudents ?? 0)}
        change=""
        trend="neutral"
        icon={IconSchool}
      />
      <MetricCard
        title={t.dashboard.teachers()}
        value={formatNumber(metrics?.totalTeachers ?? 0)}
        change=""
        trend="neutral"
        icon={IconUsers}
      />
      <MetricCard
        title={t.dashboard.activeClasses()}
        value={formatNumber(metrics?.activeClasses ?? 0)}
        change=""
        trend="neutral"
        icon={IconBook}
      />
      <MetricCard
        title={t.dashboard.revenueThisMonth()}
        value={formatCurrency(metrics?.revenueThisMonth ?? 0)}
        change=""
        trend="neutral"
        icon={IconCurrencyDollar}
      />
    </motion.div>
  )
}
