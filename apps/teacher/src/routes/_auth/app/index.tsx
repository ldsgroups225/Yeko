import { IconCalendar, IconChevronLeft, IconChevronRight, IconClipboardCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { addDays, format, startOfWeek } from 'date-fns'

import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherDashboardQueryOptions } from '@/lib/queries/dashboard'
import { detailedScheduleQueryOptions } from '@/lib/queries/schedule'

export const Route = createFileRoute('/_auth/app/')({
  component: SchedulePage,
})

const DAYS_OF_WEEK = [
  { key: 1, label: 'Lun' },
  { key: 2, label: 'Mar' },
  { key: 3, label: 'Mer' },
  { key: 4, label: 'Jeu' },
  { key: 5, label: 'Ven' },
  { key: 6, label: 'Sam' },
]

function SchedulePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'fr' ? fr : undefined

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1) // Default to Monday if Sunday

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  // Calculate week dates
  const today = new Date()
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  })
  const weekEnd = addDays(weekStart, 6)

  const { data, isLoading: dataLoading } = useQuery({
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
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    ...teacherDashboardQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      date: format(today, 'yyyy-MM-dd'),
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading || dashboardLoading

  const daySchedule
    = data?.sessions.filter(s => s.dayOfWeek === selectedDay) ?? []

  const weekDates = DAYS_OF_WEEK.map((day, index) => ({
    ...day,
    date: addDays(weekStart, index),
    isToday:
      format(addDays(weekStart, index), 'yyyy-MM-dd')
      === format(today, 'yyyy-MM-dd'),
  }))

  if (isLoading) {
    return <ScheduleSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('schedule.title')}</h1>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <IconClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.pendingGrades')}</p>
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
          aria-label="Semaine précédente"
        >
          <IconChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium">
          {t('schedule.weekOf', {
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
          aria-label="Semaine suivante"
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
                  <ScheduleCard key={session.id} session={session} />
                ))}
              </div>
            )
          : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconCalendar className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t('schedule.noSessions')}
                  </p>
                </CardContent>
              </Card>
            )}
      </div>
    </div>
  )
}

interface ScheduleCardProps {
  session: {
    id: string
    startTime: string
    endTime: string
    class: { id: string, name: string }
    subject: { id: string, name: string, shortName: string | null }
    classroom: { id: string, name: string, code: string | null } | null
  }
}

function ScheduleCard({ session }: ScheduleCardProps) {
  const { t } = useTranslation()

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
          <Button size="sm">{t('schedule.startSession')}</Button>
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
