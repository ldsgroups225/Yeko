import { IconCalendar, IconCircleCheck, IconCircleX, IconClock, IconFileCheck } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type TeacherAttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'on_leave'

interface TeacherAttendanceStatusBadgeProps {
  status: TeacherAttendanceStatus
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<TeacherAttendanceStatus, {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: typeof IconCircleCheck
  colorClass: string
}> = {
  present: { variant: 'default', icon: IconCircleCheck, colorClass: 'bg-success/10 text-success border-success/20' },
  late: { variant: 'secondary', icon: IconClock, colorClass: 'bg-accent/10 text-accent-foreground border-accent/20' },
  absent: { variant: 'destructive', icon: IconCircleX, colorClass: 'bg-destructive/10 text-destructive border-destructive/20' },
  excused: { variant: 'outline', icon: IconFileCheck, colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
  on_leave: { variant: 'outline', icon: IconCalendar, colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
}

export function TeacherAttendanceStatusBadge({
  status,
  showIcon = true,
  className,
}: TeacherAttendanceStatusBadgeProps) {
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
