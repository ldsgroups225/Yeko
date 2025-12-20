import { CheckCircle, Save } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'
import { TeacherAttendanceRow } from './teacher-attendance-row'

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

interface TeacherAttendanceGridProps {
  entries: TeacherAttendanceEntry[]
  date: Date
  onDateChange: (date: Date) => void
  onSave: (entries: TeacherAttendanceEntry[]) => void
  isLoading?: boolean
  isSaving?: boolean
}

export function TeacherAttendanceGrid({
  entries: initialEntries,
  date,
  onDateChange,
  onSave,
  isLoading,
  isSaving,
}: TeacherAttendanceGridProps) {
  const t = useTranslations()
  const [entries, setEntries] = useState<TeacherAttendanceEntry[]>(initialEntries)
  const [hasChanges, setHasChanges] = useState(false)

  const handleEntryChange = (updatedEntry: TeacherAttendanceEntry) => {
    setEntries(prev =>
      prev.map(e => (e.teacherId === updatedEntry.teacherId ? updatedEntry : e)),
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
    onLeave: entries.filter(e => e.status === 'on_leave').length,
  }

  if (isLoading) {
    return <TeacherAttendanceGridSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{t.attendance.teacherAttendance()}</CardTitle>
        <div className="flex items-center gap-2">
          <DatePicker date={date} onSelect={d => d && onDateChange(d)} />
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
          <span className="text-purple-600">
            {t.attendance.status.on_leave()}
            :
            {summary.onLeave}
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{t.attendance.teacher()}</TableHead>
              <TableHead className="w-[200px]">{t.attendance.status.label()}</TableHead>
              <TableHead className="w-[120px]">{t.attendance.arrivalTime()}</TableHead>
              <TableHead className="w-[100px]">{t.attendance.lateMinutes()}</TableHead>
              <TableHead>{t.attendance.notes()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(entry => (
              <TeacherAttendanceRow
                key={entry.teacherId}
                entry={entry}
                onChange={handleEntryChange}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TeacherAttendanceGridSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}
