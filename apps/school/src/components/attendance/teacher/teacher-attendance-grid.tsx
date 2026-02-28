import type { TeacherAttendanceEntry } from './types'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { generateUUID } from '@/utils/generateUUID'
import { TeacherAttendanceHeader } from './teacher-attendance-header'
import { TeacherAttendanceProvider } from './teacher-attendance-provider'
import { TeacherAttendanceTable } from './teacher-attendance-table'

interface TeacherAttendanceGridProps {
  entries: TeacherAttendanceEntry[]
  onSave: (entries: TeacherAttendanceEntry[]) => void
  isPending?: boolean
  isSaving?: boolean
}

export function TeacherAttendanceGrid({
  entries,
  onSave,
  isPending,
  isSaving,
}: TeacherAttendanceGridProps) {
  if (isPending) {
    return <TeacherAttendanceGridSkeleton />
  }

  return (
    <TeacherAttendanceProvider entries={entries} onSave={onSave} isSaving={isSaving}>
      <Card className="
        border-border/40 bg-card/30 relative overflow-hidden rounded-3xl
        shadow-2xl backdrop-blur-xl
      "
      >
        <TeacherAttendanceHeader />
        <CardContent className="p-0">
          <TeacherAttendanceTable />
        </CardContent>
      </Card>
    </TeacherAttendanceProvider>
  )
}

function TeacherAttendanceGridSkeleton() {
  return (
    <Card className="border-border/40 bg-card/30 rounded-3xl">
      <div className="space-y-3 p-6">
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
