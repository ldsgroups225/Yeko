import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type AlertSeverity = 'info' | 'warning' | 'critical'

interface AlertSeverityBadgeProps {
  severity: AlertSeverity
  showIcon?: boolean
  className?: string
}

const severityConfig: Record<AlertSeverity, {
  icon: typeof IconInfoCircle
  colorClass: string
}> = {
  info: { icon: IconInfoCircle, colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
  warning: { icon: IconAlertTriangle, colorClass: 'bg-accent/10 text-accent-foreground border-accent/20' },
  critical: { icon: IconAlertCircle, colorClass: 'bg-destructive/10 text-destructive border-destructive/20' },
}

export function AlertSeverityBadge({
  severity,
  showIcon = true,
  className,
}: AlertSeverityBadgeProps) {
  const t = useTranslations()
  const config = severityConfig[severity]
  const Icon = config.icon

  const severityTranslations = {
    info: t.alerts.severity.info,
    warning: t.alerts.severity.warning,
    critical: t.alerts.severity.critical,
  }

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {severityTranslations[severity]()}
    </Badge>
  )
}
