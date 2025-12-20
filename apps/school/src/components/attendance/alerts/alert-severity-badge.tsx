import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type AlertSeverity = 'info' | 'warning' | 'critical'

interface AlertSeverityBadgeProps {
  severity: AlertSeverity
  showIcon?: boolean
  className?: string
}

const severityConfig: Record<AlertSeverity, {
  icon: typeof Info
  colorClass: string
}> = {
  info: { icon: Info, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  warning: { icon: AlertTriangle, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  critical: { icon: AlertCircle, colorClass: 'bg-red-500/10 text-red-600 border-red-200' },
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
