import {
  AlertCircle,
  BookOpen,
  DollarSign,
  GraduationCap,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

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

export function AdminDashboard() {
  const { t } = useTranslation()
  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Key Metrics */}
      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t('dashboard.totalStudents')}
          value="1,234"
          change="+12%"
          trend="up"
          icon={GraduationCap}
        />
        <MetricCard
          title={t('dashboard.teachers')}
          value="89"
          change="+3"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title={t('dashboard.activeClasses')}
          value="42"
          change="0"
          trend="neutral"
          icon={BookOpen}
        />
        <MetricCard
          title={t('dashboard.revenueThisMonth')}
          value="245,000 FCFA"
          change="+8%"
          trend="up"
          icon={DollarSign}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton icon={Users} label={t('dashboard.addUser')} />
          <QuickActionButton icon={GraduationCap} label={t('dashboard.enrollStudent')} />
          <QuickActionButton icon={BookOpen} label={t('dashboard.createClass')} />
          <QuickActionButton icon={DollarSign} label={t('dashboard.recordPayment')} />
        </div>
      </motion.div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('dashboard.recentActivity')}</h2>
          <div className="space-y-3">
            <ActivityItem
              title={t('dashboard.activity.teacherAdded')}
              description="Marie Kouassi - Mathématiques"
              time={t('common.timeAgo', { time: '2 heures' })}
            />
            <ActivityItem
              title={t('dashboard.activity.studentsEnrolled', { count: 15 })}
              description="Classe de 6ème A"
              time={t('common.timeAgo', { time: '5 heures' })}
            />
            <ActivityItem
              title={t('dashboard.activity.paymentReceived')}
              description="45,000 FCFA - Jean Kouadio"
              time={t('common.timeAgo', { time: '1 jour' })}
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('dashboard.alerts')}</h2>
          <div className="space-y-3">
            <AlertItem
              type="warning"
              title={t('dashboard.alertsSection.overduePayments')}
              description={t('dashboard.alertsSection.overduePaymentsDesc', { count: 23 })}
            />
            <AlertItem
              type="info"
              title={t('dashboard.alertsSection.termEnd')}
              description={t('dashboard.alertsSection.termEndDesc', { days: 15 })}
            />
            <AlertItem
              type="warning"
              title={t('dashboard.alertsSection.classCapacity')}
              description={t('dashboard.alertsSection.classCapacityDesc', { count: 3 })}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

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
      className="rounded-lg border border-border/40 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${trend === 'up'
            ? 'text-green-600 dark:text-green-400'
            : trend === 'down'
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground'
          }`}
        >
          {change}
        </p>
      </div>
    </motion.div>
  )
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

function QuickActionButton({ icon: Icon, label }: QuickActionButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, backgroundColor: 'var(--accent)' }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-3 rounded-md border border-border/40 bg-background p-3 text-sm font-medium transition-colors hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

interface AlertItemProps {
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
}

function AlertItem({ type, title, description }: AlertItemProps) {
  const colors = {
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="flex gap-3">
      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${colors[type]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
