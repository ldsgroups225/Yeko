import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
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
  const { t } = useTranslation()
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {t(`alerts.severity.${severity}`)}
    </Badge>
  )
}
