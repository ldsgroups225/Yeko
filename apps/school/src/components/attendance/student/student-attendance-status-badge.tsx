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
    colorClass: 'bg-success/10 text-success border-success/20',
  },
  late: {
    icon: IconClock,
    colorClass: 'bg-accent/10 text-accent-foreground border-accent/20',
  },
  absent: {
    icon: IconCircleX,
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  excused: {
    icon: IconFileCheck,
    colorClass: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  on_leave: {
    icon: IconCalendar,
    colorClass: 'bg-secondary/10 text-secondary border-secondary/20',
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
