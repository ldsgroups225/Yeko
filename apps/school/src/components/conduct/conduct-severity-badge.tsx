import { Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ConductSeverityBadgeProps {
  severity: ConductSeverity
  showIcon?: boolean
  className?: string
}

const severityConfig: Record<ConductSeverity, {
  colorClass: string
}> = {
  low: { colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  medium: { colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  high: { colorClass: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  critical: { colorClass: 'bg-red-500/10 text-red-600 border-red-200' },
}

export function ConductSeverityBadge({
  severity,
  showIcon = true,
  className,
}: ConductSeverityBadgeProps) {
  const t = useTranslations()
  const config = severityConfig[severity]

  const severityTranslations = {
    low: t.conduct.severity.low,
    medium: t.conduct.severity.medium,
    high: t.conduct.severity.high,
    critical: t.conduct.severity.critical,
  }

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Circle className="mr-1 h-2 w-2 fill-current" />}
      {severityTranslations[severity]()}
    </Badge>
  )
}
