import { IconBook, IconClipboardCheck, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function CoordinatorDashboard() {
  const t = useTranslations()

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.dashboard.coordinator.title()}
        </h1>
        <p className="text-muted-foreground">
          {t.dashboard.coordinator.subtitle()}
        </p>
      </div>

      {/* Academic Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard title={t.dashboard.coordinator.subjects()} value="24" subtitle="8 levels" icon={IconBook} />
        <MetricCard title={t.dashboard.coordinator.pendingGrades()} value="156" subtitle={t.common.pending()} icon={IconClipboardCheck} />
        <MetricCard title={t.dashboard.coordinator.averageGrade()} value="12.8/20" subtitle="+0.5 pts" icon={IconTrendingUp} />
        <MetricCard title={t.dashboard.coordinator.teachers()} value="89" subtitle={t.common.active()} icon={IconUsers} />
      </motion.div>

      {/* Validation Queue */}
      <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.coordinator.gradesToValidate()}</h2>
        <div className="space-y-3">
          <ValidationItem
            subject="Mathématiques"
            teacher="M. Kouassi"
            class="3ème A"
            count={28}
            date="Il y a 2 heures"
          />
          <ValidationItem
            subject="Français"
            teacher="Mme Diallo"
            class="2nde C"
            count={32}
            date="Il y a 5 heures"
          />
          <ValidationItem
            subject="Physique-Chimie"
            teacher="M. Traoré"
            class="1ère D"
            count={25}
            date="Il y a 1 jour"
          />
        </div>
      </motion.div>

      {/* Performance Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.coordinator.performanceByLevel()}</h2>
          <div className="space-y-4">
            <PerformanceBar level="6ème" average="13.2" percentage={66} />
            <PerformanceBar level="5ème" average="12.8" percentage={64} />
            <PerformanceBar level="4ème" average="12.5" percentage={62} />
            <PerformanceBar level="3ème" average="12.1" percentage={60} />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.coordinator.atRiskSubjects()}</h2>
          <div className="space-y-3">
            <RiskItem subject="Mathematics 3rd" average="9.2/20" status="critical" />
            <RiskItem subject="Physics 2nd" average="10.1/20" status="warning" />
            <RiskItem subject="English 4th" average="10.8/20" status="warning" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-lg border border-border/40 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

interface ValidationItemProps {
  subject: string
  teacher: string
  class: string
  count: number
  date: string
}

function ValidationItem({ subject, teacher, class: className, count, date }: ValidationItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{subject}</p>
        <p className="text-xs text-muted-foreground">
          {teacher}
          {' '}
          •
          {className}
          {' '}
          •
          {count}
          {' '}
          notes
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Valider
      </motion.button>
    </div>
  )
}

interface PerformanceBarProps {
  level: string
  average: string
  percentage: number
}

function PerformanceBar({ level, average, percentage }: PerformanceBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{level}</span>
        <span className="text-muted-foreground">
          {average}
          /20
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

interface RiskItemProps {
  subject: string
  average: string
  status: 'critical' | 'warning'
}

function RiskItem({ subject, average, status }: RiskItemProps) {
  const t = useTranslations()
  const statusColors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{subject}</p>
        <p className="text-xs text-muted-foreground">
          Average:
          {average}
        </p>
      </div>
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[status]}`}>
        {status === 'critical' ? t.dashboard.coordinator.critical() : t.dashboard.coordinator.warning()}
      </span>
    </div>
  )
}
