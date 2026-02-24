import type { TablerIcon } from '@tabler/icons-react'
import type { TranslationFunctions } from '@/i18n'
import { IconCalendar, IconClock, IconInfoCircle, IconUserX } from '@tabler/icons-react'

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export interface AttendanceDay {
  date: string
  status: AttendanceStatus
}

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    color: string
    bgColor: string
    borderColor: string
    textColor: string
    label: (t: TranslationFunctions) => string
    icon: TablerIcon
  }
> = {
  present: {
    color: 'bg-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    textColor: 'text-success',
    label: t => t.attendance.status.present(),
    icon: IconCalendar,
  },
  late: {
    color: 'bg-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    textColor: 'text-accent-foreground',
    label: t => t.attendance.status.late(),
    icon: IconClock,
  },
  absent: {
    color: 'bg-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    textColor: 'text-destructive',
    label: t => t.attendance.status.absent(),
    icon: IconUserX,
  },
  excused: {
    color: 'bg-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
    textColor: 'text-secondary',
    label: t => t.attendance.status.excused(),
    icon: IconInfoCircle,
  },
}
