import { IconCalendar, IconChevronLeft, IconChevronRight, IconClipboardCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { addDays, format, startOfWeek } from 'date-fns'

import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherDashboardQueryOptions } from '@/lib/queries/dashboard'
import { detailedScheduleQueryOptions } from '@/lib/queries/schedule'

export const Route = createFileRoute('/_auth/app/')({
  component: SchedulePage,
})

function SchedulePage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const locale = currentLocale === 'fr' ? fr : undefined

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1) // Default to Monday if Sunday

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  // Calculate week dates
  const today = new Date()
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  })
  const weekEnd = addDays(weekStart, 6)

  const { data, isPending: dataPending } = useQuery({
    ...detailedScheduleQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
    }),
    enabled: !!context,
  })

  // Keep pending grades count from the old dashboard logic as it was present in planning.tsx
  const { data: dashboardData, isPending: dashboardPending } = useQuery({
    ...teacherDashboardQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      date: format(today, 'yyyy-MM-dd'),
    }),
    enabled: !!context,
  })

  const isPending = contextLoading || dataPending || dashboardPending

  const daySchedule
    = data?.sessions.filter(s => s.dayOfWeek === selectedDay) ?? []

  const weekDates = [
    { key: 1, label: LL.schedule.days.mon(), date: weekStart },
    { key: 2, label: LL.schedule.days.tue(), date: addDays(weekStart, 1) },
    { key: 3, label: LL.schedule.days.wed(), date: addDays(weekStart, 2) },
    { key: 4, label: LL.schedule.days.thu(), date: addDays(weekStart, 3) },
    { key: 5, label: LL.schedule.days.fri(), date: addDays(weekStart, 4) },
    { key: 6, label: LL.schedule.days.sat(), date: addDays(weekStart, 5) },
  ].map(day => ({
    ...day,
    isToday:
      format(day.date, 'yyyy-MM-dd')
      === format(today, 'yyyy-MM-dd'),
  }))

  if (isPending) {
    return <ScheduleSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{LL.schedule.title()}</h1>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <IconClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{LL.dashboard.pendingGrades()}</p>
              <p className="text-2xl font-bold">{dashboardData?.pendingGrades ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset(prev => prev - 1)}
          aria-label={LL.schedule.previousWeek()}
        >
          <IconChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium">
          {LL.schedule.weekOf({
            date: format(weekStart, 'd MMM', { locale }),
          })}
          {' '}
          -
          {' '}
          {format(weekEnd, 'd MMM yyyy', { locale })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset(prev => prev + 1)}
          aria-label={LL.schedule.nextWeek()}
        >
          <IconChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekDates.map(day => (
          <button
            key={day.key}
            type="button"
            onClick={() => setSelectedDay(day.key)}
            className={`flex min-w-[48px] flex-col items-center rounded-lg p-2 transition-colors ${selectedDay === day.key
              ? 'bg-primary text-primary-foreground'
              : day.isToday
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <span className="text-xs font-medium">{day.label}</span>
            <span className="text-lg font-semibold">
              {format(day.date, 'd')}
            </span>
          </button>
        ))}
      </div>

      {/* Day Schedule */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {format(weekDates[selectedDay - 1]?.date ?? today, 'EEEE d MMMM', {
            locale,
          })}
        </h2>

        {daySchedule.length > 0
          ? (
              <div className="space-y-2">
                {daySchedule.map(session => (
                  <ScheduleCard
                    key={session.id}
                    session={session}
                    schoolId={context?.schoolId ?? ''}
                  />
                ))}
              </div>
            )
          : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconCalendar className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {LL.schedule.noSessions()}
                  </p>
                </CardContent>
              </Card>
            )}
      </div>
    </div>
  )
}

interface ScheduleCardProps {
  schoolId: string
  session: {
    id: string
    startTime: string
    endTime: string
    class: { id: string, name: string }
    subject: { id: string, name: string, shortName: string | null }
    classroom: { id: string | null, name: string | null, code: string | null } | null
    date: string
    hasSession: boolean
    sessionStatus: 'scheduled' | 'substituted' | 'cancelled'
    statusDetails: null
    dayOfWeek: number
  }
}

function ScheduleCard({ session, schoolId }: ScheduleCardProps) {
  const { LL } = useI18nContext()
  const { Link } = createFileRoute('/_auth/app/')({})

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {session.startTime}
                {' '}
                -
                {session.endTime}
              </span>
            </div>
            <h3 className="font-semibold">{session.subject.name}</h3>
            <p className="text-sm text-muted-foreground">
              {session.class.name}
              {session.classroom && ` • ${session.classroom.name}`}
            </p>
          </div>
          <Link
            to="/app/schools/$schoolId/class/$classId"
            params={{
              schoolId,
              classId: session.class.id,
            }}
            search={{ timetableSessionId: session.id }}
          >
            <Button size="sm">
              {LL.session.startClass()}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <Skeleton className="h-7 w-40" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-16 w-12" />
        ))}
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
