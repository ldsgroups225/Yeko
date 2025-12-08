import { AlertTriangle, CheckCircle, Circle, Clock, Search, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ConductStatus = 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'

interface ConductStatusBadgeProps {
  status: ConductStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<ConductStatus, {
  icon: typeof Circle
  colorClass: string
}> = {
  open: { icon: Circle, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  investigating: { icon: Search, colorClass: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  pending_decision: { icon: Clock, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  resolved: { icon: CheckCircle, colorClass: 'bg-green-500/10 text-green-600 border-green-200' },
  closed: { icon: XCircle, colorClass: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  appealed: { icon: AlertTriangle, colorClass: 'bg-orange-500/10 text-orange-600 border-orange-200' },
}

export function ConductStatusBadge({
  status,
  showIcon = true,
  className,
}: ConductStatusBadgeProps) {
  const { t } = useTranslation()
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {t(`conduct.status.${status}`)}
    </Badge>
  )
}
