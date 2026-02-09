import { Badge } from '@workspace/ui/components/badge'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type ConductSeverity = 'low' | 'medium' | 'high' | 'critical' | 'urgent'

interface ConductSeverityBadgeProps {
  severity: ConductSeverity
  showIcon?: boolean
  className?: string
}

const severityConfig: Record<ConductSeverity, {
  colorClass: string
  dotClass: string
}> = {
  low: {
    colorClass: 'bg-secondary/10 text-secondary border-secondary/20',
    dotClass: 'bg-secondary',
  },
  medium: {
    colorClass: 'bg-accent/10 text-accent-foreground border-accent/20',
    dotClass: 'bg-accent-foreground',
  },
  high: {
    colorClass: 'bg-accent/10 text-accent-foreground border-accent/20',
    dotClass: 'bg-accent-foreground',
  },
  critical: {
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
    dotClass: 'bg-destructive',
  },
  urgent: {
    colorClass: 'bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/20',
    dotClass: 'bg-destructive-foreground',
  },
}

export function ConductSeverityBadge({
  severity,
  showIcon = true,
  className,
}: ConductSeverityBadgeProps) {
  const t = useTranslations()
  const config = severityConfig[severity]

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex"
    >
      <Badge
        variant="outline"
        className={cn(
          'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-all',
          config.colorClass,
          className,
        )}
      >
        {showIcon && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dotClass)}
          />
        )}
        {(severity === 'urgent' ? t.conduct.severity.critical() : t.conduct.severity[severity]())}
      </Badge>
    </motion.div>
  )
}
