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
  open: { icon: IconCircle, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  investigating: { icon: IconSearch, colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  pending_decision: { icon: IconClock, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  resolved: { icon: IconCircleCheck, colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  closed: { icon: IconCircleX, colorClass: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' },
  appealed: { icon: IconAlertTriangle, colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
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
          'rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all',
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
