import { AlertTriangle, Award, Ban, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
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
  incident: { icon: AlertTriangle, colorClass: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  sanction: { icon: Ban, colorClass: 'bg-red-500/10 text-red-600 border-red-200' },
  reward: { icon: Award, colorClass: 'bg-green-500/10 text-green-600 border-green-200' },
  note: { icon: FileText, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
}

export function ConductTypeBadge({
  type,
  showIcon = true,
  className,
}: ConductTypeBadgeProps) {
  const { t } = useTranslation()
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {t(`conduct.type.${type}`)}
    </Badge>
  )
}
