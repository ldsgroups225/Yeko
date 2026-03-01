import { IconCheck, IconClock, IconX } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { useI18nContext } from '@/i18n/i18n-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface StudentAttendanceListProps {
  students: Student[]
  attendance: Map<string, AttendanceStatus>
  onStatusChange: (studentId: string, status: AttendanceStatus) => void
  onSave: () => void
  isSaving?: boolean
}

export function StudentAttendanceList({
  students,
  attendance,
  onStatusChange,
  onSave,
  isSaving,
}: StudentAttendanceListProps) {
  const { LL } = useI18nContext()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const stats = {
    present: Array.from(attendance.values()).filter(s => s === 'present').length,
    absent: Array.from(attendance.values()).filter(s => s === 'absent').length,
    late: Array.from(attendance.values()).filter(s => s === 'late').length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm">
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            {stats.present}
            {' '}
            P
          </Badge>
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            {stats.absent}
            {' '}
            A
          </Badge>
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            {stats.late}
            {' '}
            R
          </Badge>
        </div>
        <Button onClick={onSave} disabled={isSaving} size="sm">
          {isSaving ? LL.common.loading() : LL.attendance.save()}
        </Button>
      </div>

      <div className="space-y-2">
        {students.map((student) => {
          const status = attendance.get(student.id)

          return (
            <div
              key={student.id}
              className={`
                rounded-lg border p-3 transition-colors
                ${status === 'absent'
              ? `bg-destructive/5`
              : `bg-card`}
              `}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.photoUrl ?? undefined} />
                  <AvatarFallback>
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {student.lastName}
                    {' '}
                    {student.firstName}
                  </p>
                  <p className="text-muted-foreground text-xs">{student.matricule}</p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant={status === 'present' ? 'default' : 'outline'}
                    className={`
                      h-8 w-8
                      ${status === 'present'
              ? `
                bg-success
                hover:bg-success/90
              `
              : ''}
                    `}
                    onClick={() => onStatusChange(student.id, 'present')}
                    title={LL.attendance.present()}
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={status === 'absent' ? 'destructive' : 'outline'}
                    className="h-8 w-8"
                    onClick={() => onStatusChange(student.id, 'absent')}
                    title={LL.attendance.absent()}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={status === 'late' ? 'secondary' : 'outline'}
                    className={`
                      h-8 w-8
                      ${status === 'late'
              ? `
                bg-warning/10 text-warning
                hover:bg-warning/20
              `
              : ''}
                    `}
                    onClick={() => onStatusChange(student.id, 'late')}
                    title={LL.attendance.late()}
                  >
                    <IconClock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
