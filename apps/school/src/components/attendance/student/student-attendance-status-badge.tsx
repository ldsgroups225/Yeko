import { CheckCircle, Clock, FileCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StudentAttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

interface StudentAttendanceStatusBadgeProps {
  status: StudentAttendanceStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<StudentAttendanceStatus, {
  icon: typeof CheckCircle
  colorClass: string
}> = {
  present: { icon: CheckCircle, colorClass: 'bg-green-500/10 text-green-600 border-green-200' },
  late: { icon: Clock, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  absent: { icon: XCircle, colorClass: 'bg-red-500/10 text-red-600 border-red-200' },
  excused: { icon: FileCheck, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
}

export function StudentAttendanceStatusBadge({
  status,
  showIcon = true,
  className,
}: StudentAttendanceStatusBadgeProps) {
  const { t } = useTranslation()
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {t(`attendance.status.${status}`)}
    </Badge>
  )
}
