import { IconCalendar, IconCircleCheck, IconCircleX, IconClock, IconFileCheck } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type StudentAttendanceStatus
  = | 'present'
    | 'late'
    | 'absent'
    | 'excused'
    | 'on_leave'

interface StudentAttendanceStatusBadgeProps {
  status: StudentAttendanceStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<
  StudentAttendanceStatus,
  {
    icon: typeof IconCircleCheck
    colorClass: string
  }
> = {
  present: {
    icon: IconCircleCheck,
    colorClass: 'bg-green-500/10 text-green-600 border-green-200',
  },
  late: {
    icon: IconClock,
    colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  absent: {
    icon: IconCircleX,
    colorClass: 'bg-red-500/10 text-red-600 border-red-200',
  },
  excused: {
    icon: IconFileCheck,
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  on_leave: {
    icon: IconCalendar,
    colorClass: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
}

export function StudentAttendanceStatusBadge({
  status,
  showIcon = true,
  className,
}: StudentAttendanceStatusBadgeProps) {
  const t = useTranslations()
  const config = statusConfig[status]
  const Icon = config.icon

  const statusTranslations = {
    present: t.attendance.status.present,
    late: t.attendance.status.late,
    absent: t.attendance.status.absent,
    excused: t.attendance.status.excused,
    on_leave: t.attendance.status.on_leave,
  }

  return (
    <Badge variant="outline" className={cn(config.colorClass, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {statusTranslations[status]()}
    </Badge>
  )
}
