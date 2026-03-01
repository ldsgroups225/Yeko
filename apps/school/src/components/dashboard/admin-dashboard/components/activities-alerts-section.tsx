import { formatCurrency } from '@repo/data-ops'
import { IconAlertCircle } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { item } from '../constants'

interface ActivityItemProps {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="bg-primary mt-1 flex h-2 w-2 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
        <p className="text-muted-foreground text-xs">{time}</p>
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
  t: any
}

export function ActivitiesAlertsSection({ metrics, t }: ActivitiesAlertsSectionProps) {
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
        <div className="space-y-3">
          <ActivityItem
            title={t.dashboard.activity.teacherAdded()}
            description="Marie Kouassi - Mathématiques"
            time={t.common.timeAgo({ time: '2 heures' })}
          />
          <ActivityItem
            title={t.dashboard.activity.studentsEnrolled({ count: 15 })}
            description="Classe de 6ème A"
            time={t.common.timeAgo({ time: '5 heures' })}
          />
          <ActivityItem
            title={t.dashboard.activity.paymentReceived()}
            description="45,000 FCFA - Jean Kouadio"
            time={t.common.timeAgo({ time: '1 jour' })}
          />
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
