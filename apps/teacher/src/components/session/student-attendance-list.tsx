import { IconCheck, IconClock, IconX } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { useTranslation } from 'react-i18next'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
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
  const { t } = useTranslation()

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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {stats.present}
            {' '}
            P
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {stats.absent}
            {' '}
            A
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {stats.late}
            {' '}
            R
          </Badge>
        </div>
        <Button onClick={onSave} disabled={isSaving} size="sm">
          {isSaving ? t('common.loading') : t('attendance.save', 'Enregistrer')}
        </Button>
      </div>

      <div className="space-y-2">
        {students.map((student) => {
          const status = attendance.get(student.id)

          return (
            <div
              key={student.id}
              className={`rounded-lg border p-3 transition-colors ${status === 'absent' ? 'bg-red-50/50' : 'bg-card'}`}
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
                  <p className="text-xs text-muted-foreground">{student.matricule}</p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant={status === 'present' ? 'default' : 'outline'}
                    className={`h-8 w-8 ${status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => onStatusChange(student.id, 'present')}
                    title={t('attendance.present')}
                  >
                    <IconCheck className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={status === 'absent' ? 'destructive' : 'outline'}
                    className="h-8 w-8"
                    onClick={() => onStatusChange(student.id, 'absent')}
                    title={t('attendance.absent')}
                  >
                    <IconX className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={status === 'late' ? 'secondary' : 'outline'}
                    className={`h-8 w-8 ${status === 'late' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}`}
                    onClick={() => onStatusChange(student.id, 'late')}
                    title={t('attendance.late')}
                  >
                    <IconClock className="w-4 h-4" />
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
