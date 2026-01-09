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
  present: { variant: 'default', icon: IconCircleCheck, colorClass: 'bg-green-500/10 text-green-600 border-green-200' },
  late: { variant: 'secondary', icon: IconClock, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  absent: { variant: 'destructive', icon: IconCircleX, colorClass: 'bg-red-500/10 text-red-600 border-red-200' },
  excused: { variant: 'outline', icon: IconFileCheck, colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  on_leave: { variant: 'outline', icon: IconCalendar, colorClass: 'bg-purple-500/10 text-purple-600 border-purple-200' },
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
