import type { TablerIcon } from '@tabler/icons-react'
import type { TranslationFunctions } from '@/i18n'
import { IconClock, IconUserCheck, IconUserMinus, IconUserX } from '@tabler/icons-react'

export type TeacherAttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'on_leave'

export interface TeacherAttendanceEntry {
  teacherId: string
  teacherName: string
  teacherPhoto?: string | null
  status: TeacherAttendanceStatus
  arrivalTime?: string
  reason?: string
  notes?: string
}

export const STATUS_CONFIG: Record<TeacherAttendanceStatus, {
  label: (t: TranslationFunctions) => string
  icon: TablerIcon
  color: string
  bgColor: string
  borderColor: string
  indicatorColor: string
}> = {
  present: {
    label: t => t.attendance.status.present(),
    icon: IconUserCheck,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    indicatorColor: 'bg-success',
  },
  late: {
    label: t => t.attendance.status.late(),
    icon: IconClock,
    color: 'text-accent-foreground',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    indicatorColor: 'bg-accent',
  },
  on_leave: {
    label: t => t.attendance.status.on_leave(),
    icon: IconUserMinus,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
    indicatorColor: 'bg-secondary',
  },
  absent: {
    label: t => t.attendance.status.absent(),
    icon: IconUserX,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    indicatorColor: 'bg-destructive',
  },
  excused: {
    label: t => t.attendance.status.excused(),
    icon: IconUserMinus,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
    indicatorColor: 'bg-secondary',
  },
}
