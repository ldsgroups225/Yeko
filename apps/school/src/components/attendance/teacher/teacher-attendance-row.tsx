import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { TableCell, TableRow } from '@workspace/ui/components/table'
import { Textarea } from '@workspace/ui/components/textarea'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

type TeacherAttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'on_leave'

interface TeacherAttendanceEntry {
  teacherId: string
  teacherName: string
  teacherPhoto?: string | null
  department?: string | null
  status: TeacherAttendanceStatus
  arrivalTime?: string
  lateMinutes?: number
  reason?: string
  notes?: string
  lateCount?: number
}

interface TeacherAttendanceRowProps {
  entry: TeacherAttendanceEntry
  onChange: (entry: TeacherAttendanceEntry) => void
}

const statusButtons: { status: TeacherAttendanceStatus, label: string, shortLabel: string }[] = [
  { status: 'present', label: 'attendance.status.present', shortLabel: 'P' },
  { status: 'late', label: 'attendance.status.late', shortLabel: 'R' },
  { status: 'absent', label: 'attendance.status.absent', shortLabel: 'A' },
  { status: 'excused', label: 'attendance.status.excused', shortLabel: 'E' },
  { status: 'on_leave', label: 'attendance.status.on_leave', shortLabel: 'C' },
]

const statusColors: Record<TeacherAttendanceStatus, string> = {
  present: 'bg-success text-success-foreground hover:bg-success/90',
  late: 'bg-accent text-accent-foreground hover:bg-accent/90',
  absent: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  excused: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  on_leave: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
}

export function TeacherAttendanceRow({ entry, onChange }: TeacherAttendanceRowProps) {
  const t = useTranslations()

  const handleStatusChange = (status: TeacherAttendanceStatus) => {
    onChange({ ...entry, status })
  }

  const handleArrivalTimeChange = (arrivalTime: string) => {
    onChange({ ...entry, arrivalTime })
  }

  const handleNotesChange = (notes: string) => {
    onChange({ ...entry, notes })
  }

  const initials = entry.teacherName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusTranslations = {
    present: t.attendance.status.present,
    late: t.attendance.status.late,
    absent: t.attendance.status.absent,
    excused: t.attendance.status.excused,
    on_leave: t.attendance.status.on_leave,
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.teacherPhoto ?? undefined} alt={entry.teacherName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{entry.teacherName}</div>
            {entry.department && (
              <div className="text-muted-foreground text-xs">{entry.department}</div>
            )}
          </div>
          {entry.lateCount && entry.lateCount >= 3 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {entry.lateCount}
              {' '}
              {t.attendance.lateThisMonth()}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {statusButtons.map(({ status, shortLabel }) => (
            <Button
              key={status}
              size="sm"
              variant={entry.status === status ? 'default' : 'outline'}
              className={cn(
                'h-8 w-8 p-0',
                entry.status === status && statusColors[status],
              )}
              onClick={() => handleStatusChange(status)}
              title={statusTranslations[status]()}
            >
              {shortLabel}
            </Button>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {(entry.status === 'late' || entry.status === 'present') && (
          <Input
            type="time"
            value={entry.arrivalTime ?? ''}
            onChange={e => handleArrivalTimeChange(e.target.value)}
            className="w-28"
          />
        )}
      </TableCell>
      <TableCell>
        {entry.lateMinutes && entry.lateMinutes > 0 && (
          <span className="text-accent-foreground font-medium">
            +
            {entry.lateMinutes}
            {' '}
            min
          </span>
        )}
      </TableCell>
      <TableCell>
        <Textarea
          value={entry.notes ?? ''}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder={t.attendance.notesPlaceholder()}
          className="h-9 min-h-[36px] resize-none"
          rows={1}
        />
      </TableCell>
    </TableRow>
  )
}
