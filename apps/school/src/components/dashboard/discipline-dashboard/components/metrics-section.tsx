import { IconAlertTriangle, IconCircleCheck, IconClock } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { container, item } from '../constants'

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend: 'positive' | 'negative' | 'neutral'
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: MetricCardProps) {
  const trendColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-lg border border-border/40 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

interface MetricsSectionProps {
  t: any
}

export function MetricsSection({ t }: MetricsSectionProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        title={t.dashboard.discipline.presenceRate()}
        value="94.5%"
        subtitle={t.dashboard.discipline.thisWeek()}
        icon={IconCircleCheck}
        trend="positive"
      />
      <MetricCard
        title={t.dashboard.discipline.absences()}
        value="67"
        subtitle={t.dashboard.discipline.today()}
        icon={IconAlertTriangle}
        trend="negative"
      />
      <MetricCard
        title={t.dashboard.discipline.delays()}
        value="23"
        subtitle={t.dashboard.discipline.today()}
        icon={IconClock}
        trend="negative"
      />
      <MetricCard
        title={t.dashboard.discipline.incidents()}
        value="5"
        subtitle={t.dashboard.discipline.thisWeek()}
        icon={IconAlertTriangle}
        trend="neutral"
      />
    </motion.div>
  )
}
