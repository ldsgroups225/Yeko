import { CheckCircle, Save } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

type StudentAttendanceStatus
  = | 'present'
    | 'late'
    | 'absent'
    | 'excused'

interface StudentAttendanceEntry {
  studentId: string
  studentName: string
  studentPhoto?: string | null
  status: StudentAttendanceStatus
  arrivalTime?: string
  reason?: string
  notes?: string
}

interface StudentAttendanceGridProps {
  className: string
  entries: StudentAttendanceEntry[]
  onSave: (entries: StudentAttendanceEntry[]) => void
  isLoading?: boolean
  isSaving?: boolean
}

const statusButtons: { status: StudentAttendanceStatus, label: string }[] = [
  { status: 'present', label: 'P' },
  { status: 'late', label: 'R' },
  { status: 'absent', label: 'A' },
  { status: 'excused', label: 'E' },
]

const statusColors: Record<StudentAttendanceStatus, string> = {
  present: 'bg-green-500 hover:bg-green-600 text-white',
  late: 'bg-amber-500 hover:bg-amber-600 text-white',
  absent: 'bg-red-500 hover:bg-red-600 text-white',
  excused: 'bg-blue-500 hover:bg-blue-600 text-white',
}

export function StudentAttendanceGrid({
  className,
  entries: initialEntries,
  onSave,
  isLoading,
  isSaving,
}: StudentAttendanceGridProps) {
  const t = useTranslations()
  const [entries, setEntries]
    = useState<StudentAttendanceEntry[]>(initialEntries)
  const [hasChanges, setHasChanges] = useState(false)

  const handleStatusChange = (
    studentId: string,
    status: StudentAttendanceStatus,
  ) => {
    setEntries(prev =>
      prev.map(e => (e.studentId === studentId ? { ...e, status } : e)),
    )
    setHasChanges(true)
  }

  const handleMarkAllPresent = () => {
    setEntries(prev => prev.map(e => ({ ...e, status: 'present' as const })))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(entries)
    setHasChanges(false)
  }

  const summary = {
    present: entries.filter(e => e.status === 'present').length,
    late: entries.filter(e => e.status === 'late').length,
    absent: entries.filter(e => e.status === 'absent').length,
    excused: entries.filter(e => e.status === 'excused').length,
  }

  if (isLoading) {
    return <StudentAttendanceGridSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{className}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleMarkAllPresent}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t.attendance.markAllPresent()}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t.common.saving() : t.common.save()}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 text-sm">
          <span className="text-green-600">
            {t.attendance.status.present()}
            :
            {summary.present}
          </span>
          <span className="text-amber-600">
            {t.attendance.status.late()}
            :
            {summary.late}
          </span>
          <span className="text-red-600">
            {t.attendance.status.absent()}
            :
            {summary.absent}
          </span>
          <span className="text-blue-600">
            {t.attendance.status.excused()}
            :
            {summary.excused}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map(entry => (
            <StudentAttendanceCard
              key={entry.studentId}
              entry={entry}
              onStatusChange={status =>
                handleStatusChange(entry.studentId, status)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface StudentAttendanceCardProps {
  entry: StudentAttendanceEntry
  onStatusChange: (status: StudentAttendanceStatus) => void
}

function StudentAttendanceCard({
  entry,
  onStatusChange,
}: StudentAttendanceCardProps) {
  const t = useTranslations()
  const initials = entry.studentName
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
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={entry.studentPhoto ?? undefined}
            alt={entry.studentName}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium truncate">
          {entry.studentName}
        </span>
      </div>
      <div className="flex gap-1">
        {statusButtons.map(({ status, label }) => (
          <Button
            key={status}
            size="sm"
            variant={entry.status === status ? 'default' : 'outline'}
            className={cn(
              'h-7 flex-1 p-0 text-xs',
              entry.status === status && statusColors[status],
            )}
            onClick={() => onStatusChange(status)}
            title={statusTranslations[status]()}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function StudentAttendanceGridSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 20 }).map(() => (
            <Skeleton key={generateUUID()} className="h-24 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
