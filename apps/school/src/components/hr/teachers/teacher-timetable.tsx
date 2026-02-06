import type { TimetableSessionData } from '@/components/timetables/timetable-session-card'
import { IconCalendar } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Suspense, lazy } from 'react'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { teacherOptions } from '@/lib/queries/teachers'

const TimetableGrid = lazy(() => import('@/components/timetables/timetable-grid').then(m => ({ default: m.TimetableGrid })))

interface TeacherTimetableProps {
  teacherId: string
}

export function TeacherTimetable({ teacherId }: TeacherTimetableProps) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()

  const { data: sessions, isLoading } = useQuery({
    ...teacherOptions.schedules(teacherId, schoolYearId || ''),
    enabled: !!teacherId && !!schoolYearId,
  })

  // Unwraps the Result object if successful, otherwise defaults to empty array
  const sessionsList = sessions?.success ? sessions.data : []

  const formattedSessions: TimetableSessionData[] = (sessionsList || []).map(session => ({
    id: session.id,
    subjectId: session.subjectId,
    subjectName: session.subject?.name || '',
    teacherId: session.teacherId,
    teacherName: '', // Not needed for teacher-view
    dayOfWeek: session.dayOfWeek,
    startTime: session.startTime,
    endTime: session.endTime,
    classroomName: session.classroom?.name || undefined,
    color: 'primary',
  }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-card" />
        <div className="h-[400px] animate-pulse rounded-2xl bg-card/40 border border-border/40" />
      </div>
    )
  }

  if (formattedSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card/40 rounded-2xl border border-dashed border-border/40 backdrop-blur-sm">
        <IconCalendar className="mb-4 size-12 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold">{t.hr.teachers.noSchedule?.() || 'Aucun emploi du temps'}</h3>
        <p className="text-sm text-muted-foreground">Cet enseignant n'a pas encore de séances d'emploi du temps.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/20 p-4 shadow-sm backdrop-blur-sm">
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
        <TimetableGrid
          sessions={formattedSessions}
          readOnly
        />
      </Suspense>
    </div>
  )
}
