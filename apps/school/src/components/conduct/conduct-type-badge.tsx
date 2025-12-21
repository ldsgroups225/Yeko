import { AlertTriangle, Award, Ban, FileText } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type ConductType = 'incident' | 'sanction' | 'reward' | 'note'

interface ConductTypeBadgeProps {
  type: ConductType
  showIcon?: boolean
  className?: string
}

const typeConfig: Record<ConductType, {
  icon: typeof AlertTriangle
  colorClass: string
}> = {
  incident: { icon: AlertTriangle, colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  sanction: { icon: Ban, colorClass: 'bg-red-500/10 text-red-600 border-red-500/20' },
  reward: { icon: Award, colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  note: { icon: FileText, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
}

export function ConductTypeBadge({
  type,
  showIcon = true,
  className,
}: ConductTypeBadgeProps) {
  const t = useTranslations()
  const config = typeConfig[type]
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
            whileHover={{ scale: 1.2, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className="mr-1.5 h-3 w-3" />
          </motion.div>
        )}
        {t.conduct.type[type]()}
      </Badge>
    </motion.div>
  )
}
