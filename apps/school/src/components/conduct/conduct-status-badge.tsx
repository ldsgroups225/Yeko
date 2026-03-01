import { IconAlertTriangle, IconCircle, IconCircleCheck, IconCircleX, IconClock, IconSearch } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type ConductStatus = 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'

interface ConductStatusBadgeProps {
  status: ConductStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<ConductStatus, {
  icon: typeof IconCircle
  colorClass: string
}> = {
  open: { icon: IconCircle, colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
  investigating: { icon: IconSearch, colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
  pending_decision: { icon: IconClock, colorClass: 'bg-accent/10 text-accent-foreground border-accent/20' },
  resolved: { icon: IconCircleCheck, colorClass: 'bg-success/10 text-success border-success/20' },
  closed: { icon: IconCircleX, colorClass: 'bg-muted/10 text-muted-foreground border-muted/20' },
  appealed: { icon: IconAlertTriangle, colorClass: 'bg-accent/10 text-accent-foreground border-accent/20' },
}

export function ConductStatusBadge({
  status,
  showIcon = true,
  className,
}: ConductStatusBadgeProps) {
  const t = useTranslations()
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex"
    >
      <Badge
        variant="outline"
        className={cn(
          `
            rounded-xl px-2.5 py-1 text-[10px] font-black tracking-widest
            uppercase transition-all
          `,
          config.colorClass,
          className,
        )}
      >
        {showIcon && (
          <motion.div
            animate={{ rotate: status === 'investigating' ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="mr-1.5 h-3 w-3" />
          </motion.div>
        )}
        {t.conduct.status[status]()}
      </Badge>
    </motion.div>
  )
}
