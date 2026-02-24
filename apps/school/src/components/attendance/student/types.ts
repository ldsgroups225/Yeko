import type { TablerIcon } from '@tabler/icons-react'
import type { TranslationFunctions } from '@/i18n'
import { IconClock, IconUserCheck, IconUserMinus, IconUserX } from '@tabler/icons-react'

export type StudentAttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export interface StudentAttendanceEntry {
  studentId: string
  studentName: string
  studentPhoto?: string | null
  status: StudentAttendanceStatus
  arrivalTime?: string
  reason?: string
  notes?: string
}

export const STATUS_CONFIG: Record<StudentAttendanceStatus, {
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
