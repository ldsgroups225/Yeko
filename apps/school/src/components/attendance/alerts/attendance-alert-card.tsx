import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'
import { AlertSeverityBadge } from './alert-severity-badge'

type AlertSeverity = 'info' | 'warning' | 'critical'
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed'

interface AttendanceAlert {
  id: string
  alertType: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  createdAt: string
  teacherName?: string | null
  studentName?: string | null
  className?: string | null
}

interface AttendanceAlertCardProps {
  alert: AttendanceAlert
  onAcknowledge?: (id: string) => void
  onDismiss?: (id: string) => void
}

export function AttendanceAlertCard({
  alert,
  onAcknowledge,
  onDismiss,
}: AttendanceAlertCardProps) {
  const t = useTranslations()

  const subjectName = alert.teacherName ?? alert.studentName ?? alert.className

  return (
    <Card className="border-l-accent border-l-4">
      <CardHeader className="
        flex flex-row items-start justify-between space-y-0 pb-2
      "
      >
        <div>
          <div className="font-medium">{alert.title}</div>
          {subjectName && (
            <div className="text-muted-foreground text-sm">{subjectName}</div>
          )}
        </div>
        <AlertSeverityBadge severity={alert.severity} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 text-sm">{alert.message}</p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {alert.status === 'active' && (
            <div className="flex gap-2">
              {onAcknowledge && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  <IconCheck className="mr-1 h-3 w-3" />
                  {t.alerts.acknowledge()}
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismiss(alert.id)}
                >
                  <IconX className="mr-1 h-3 w-3" />
                  {t.alerts.dismiss()}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
