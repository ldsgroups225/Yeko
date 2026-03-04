import { formatCurrency } from '@repo/data-ops'
import { IconAlertCircle, IconArrowRight, IconCheck, IconPlus } from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'motion/react'
import { item } from '../constants'

interface ActivityItemProps {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time, action }: ActivityItemProps & { action?: string }) {
  const getIcon = () => {
    switch (action) {
      case 'create': return <IconPlus className="h-3 w-3 text-white" />
      case 'update': return <IconCheck className="h-3 w-3 text-white" />
      case 'delete': return <IconArrowRight className="h-3 w-3 text-white" />
      default: return null
    }
  }

  const getBgColor = () => {
    switch (action) {
      case 'create': return 'bg-green-500'
      case 'update': return 'bg-blue-500'
      case 'delete': return 'bg-red-500'
      default: return 'bg-primary'
    }
  }

  return (
    <div className="flex gap-3">
      <div className={`${getBgColor()} mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full`}>
        {getIcon()}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs leading-none">{description}</p>
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{time}</p>
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
    warning: 'text-accent-foreground',
    info: 'text-secondary',
    error: 'text-destructive',
  }

  return (
    <div className="flex gap-3">
      <IconAlertCircle className={`
        mt-0.5 h-4 w-4 shrink-0
        ${colors[type]}
      `}
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}

interface ActivitiesAlertsSectionProps {
  metrics: any
  recentActivities?: Array<{
    id: string
    action: string
    tableName: string
    userName: string | null
    createdAt: Date
    details: any
  }>
  t: any
}

export function ActivitiesAlertsSection({ metrics, recentActivities, t }: ActivitiesAlertsSectionProps) {
  const formatActivityTitle = (activity: any) => {
    const tableNames: Record<string, string> = {
      students: t.nav.students(),
      teachers: t.nav.teachers(),
      payments: t.nav.payments(),
      enrollments: t.nav.enrollments(),
      users: t.nav.users(),
      classes: t.nav.classes(),
    }

    const actions: Record<string, string> = {
      create: t.common.create(),
      update: t.common.edit(),
      delete: t.common.delete(),
    }

    const tableName = tableNames[activity.tableName] || activity.tableName
    const action = actions[activity.action] || activity.action

    return `${action} ${tableName.toLowerCase()}`
  }

  const formatActivityDescription = (activity: any) => {
    if (activity.userName) {
      return `Par ${activity.userName}`
    }
    return ''
  }

  return (
    <div className="
      grid gap-4
      lg:grid-cols-2
    "
    >
      <motion.div
        variants={item}
        className="border-border/40 bg-card rounded-lg border p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.recentActivity()}</h2>
        <div className="space-y-4">
          {recentActivities && recentActivities.length > 0
            ? (
                recentActivities.map(activity => (
                  <ActivityItem
                    key={activity.id}
                    title={formatActivityTitle(activity)}
                    description={formatActivityDescription(activity)}
                    action={activity.action}
                    time={formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  />
                ))
              )
            : (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  {t.common.noResults()}
                </p>
              )}
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="border-border/40 bg-card rounded-lg border p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.alerts()}</h2>
        <div className="space-y-3">
          {(metrics?.overdueAmount ?? 0) > 0 && (
            <AlertItem
              type="warning"
              title={t.dashboard.alertsSection.overduePayments()}
              description={`${formatCurrency(metrics?.overdueAmount ?? 0)} ${t.dashboard.alertsSection.overduePaymentsDesc({ count: 0 })}`}
            />
          )}
          <AlertItem
            type="info"
            title={t.dashboard.alertsSection.termEnd()}
            description={t.dashboard.alertsSection.termEndDesc({ days: 15 })}
          />
        </div>
      </motion.div>
    </div>
  )
}
