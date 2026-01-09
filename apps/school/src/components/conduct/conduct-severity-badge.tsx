import { Badge } from '@workspace/ui/components/badge'
import { motion } from 'motion/react'
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
  dotClass: string
}> = {
  low: {
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    dotClass: 'bg-blue-600',
  },
  medium: {
    colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    dotClass: 'bg-amber-600',
  },
  high: {
    colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    dotClass: 'bg-orange-600',
  },
  critical: {
    colorClass: 'bg-red-500/10 text-red-600 border-red-500/20',
    dotClass: 'bg-red-600',
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
        {t.conduct.severity[severity]()}
      </Badge>
    </motion.div>
  )
}
