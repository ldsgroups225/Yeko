import type { StudentAttendanceEntry } from './types'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { generateUUID } from '@/utils/generateUUID'
import { StudentAttendanceHeader } from './student-attendance-header'
import { StudentAttendanceProvider } from './student-attendance-provider'
import { StudentAttendanceTable } from './student-attendance-table'

interface StudentAttendanceGridProps {
  className: string
  entries: StudentAttendanceEntry[]
  onSave: (entries: StudentAttendanceEntry[]) => void
  isPending?: boolean
  isSaving?: boolean
}

export function StudentAttendanceGrid({
  className,
  entries,
  onSave,
  isPending,
  isSaving,
}: StudentAttendanceGridProps) {
  if (isPending) {
    return <StudentAttendanceGridSkeleton />
  }

  return (
    <StudentAttendanceProvider className={className} entries={entries} onSave={onSave} isSaving={isSaving}>
      <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
        <StudentAttendanceHeader />
        <CardContent className="p-0">
          <StudentAttendanceTable />
        </CardContent>
      </Card>
    </StudentAttendanceProvider>
  )
}

function StudentAttendanceGridSkeleton() {
  return (
    <Card className="rounded-3xl border-border/40 bg-card/30">
      <div className="p-6 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-40 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map(() => (
            <Skeleton key={generateUUID()} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
