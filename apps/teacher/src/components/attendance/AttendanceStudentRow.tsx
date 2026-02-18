import { IconCheck, IconClock, IconUser, IconX } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { useI18nContext } from '@/i18n/i18n-react'

export interface StudentAttendance {
  studentId: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
  enrollmentId: string
  attendance: {
    id: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes: string | null
    recordedAt: Date | null
  } | null
}

interface AttendanceStudentRowProps {
  student: StudentAttendance
  onStatusChange: (status: 'present' | 'absent' | 'late' | 'excused') => void
  isLoading: boolean
}

export function AttendanceStudentRow({
  student,
  onStatusChange,
  isLoading,
}: AttendanceStudentRowProps) {
  const { LL } = useI18nContext()
  const currentStatus = student.attendance?.status

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.photoUrl ?? undefined} />
          <AvatarFallback>
            {student.firstName[0]}
            {student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {student.lastName}
            {' '}
            {student.firstName}
          </p>
          {student.matricule && (
            <p className="text-sm text-muted-foreground">{student.matricule}</p>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant={currentStatus === 'present' ? 'default' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('present')}
          disabled={isLoading}
        >
          <IconCheck className="w-4 h-4 mr-1" />
          {LL.attendance.status.present()}
        </Button>
        <Button
          variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('absent')}
          disabled={isLoading}
        >
          <IconX className="w-4 h-4 mr-1" />
          {LL.attendance.status.absent()}
        </Button>
        <Button
          variant={currentStatus === 'late' ? 'secondary' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('late')}
          disabled={isLoading}
        >
          <IconClock className="w-4 h-4 mr-1" />
          {LL.attendance.status.late()}
        </Button>
        <Button
          variant={currentStatus === 'excused' ? 'outline' : 'outline'}
          size="sm"
          className="min-w-[80px]"
          onClick={() => onStatusChange('excused')}
          disabled={isLoading}
        >
          <IconUser className="w-4 h-4 mr-1" />
          {LL.attendance.status.excused()}
        </Button>
      </div>
    </div>
  )
}
