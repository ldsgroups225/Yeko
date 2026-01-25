import {
  IconBook,
  IconCalendar,
  IconClipboardList,
  IconMessageCircle,
  IconSchool,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { ActiveSessionCard } from '@/components/session/active-session-card'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherDashboardQueryOptions } from '@/lib/queries/dashboard'

export const Route = createFileRoute('/_auth/app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t, i18n } = useTranslation()
  const today = new Date()
  const locale = i18n.language === 'fr' ? fr : undefined

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...teacherDashboardQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {t('app.greeting', { name: 'Enseignant' })}
        </h1>
        <p className="text-sm capitalize text-muted-foreground">
          {format(today, 'EEEE d MMMM yyyy', { locale })}
        </p>
      </div>

      {/* Active Session Banner */}
      {data?.activeSession && (
        <ActiveSessionCard
          session={data.activeSession}
          onComplete={() => {
            // TODO: Implement session completion
          }}
        />
      )}

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconCalendar className="h-4 w-4" />
            {t('dashboard.todaySchedule')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.todaySchedule && data.todaySchedule.length > 0
            ? (
                <div className="space-y-2">
                  {data.todaySchedule.map(session => (
                    <ScheduleItem key={session.id} session={session} />
                  ))}
                </div>
              )
            : (
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.noClassesToday')}
                </p>
              )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton
            icon={<IconClipboardList className="h-5 w-5" />}
            label={t('session.notes')}
            href="/app/sessions"
          />
          <QuickActionButton
            icon={<IconBook className="h-5 w-5" />}
            label={t('homework.title')}
            href="/app/sessions"
          />
          <QuickActionButton
            icon={<IconSchool className="h-5 w-5" />}
            label={t('grades.title')}
            href="/app/grades"
          />
          <QuickActionButton
            icon={<IconMessageCircle className="h-5 w-5" />}
            label={t('messages.title')}
            href="/app/messages"
          />
        </div>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data?.pendingGrades ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.pendingGrades')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {data?.unreadMessages ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.unreadMessages')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      {data?.upcomingClasses && data.upcomingClasses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t('dashboard.upcomingClasses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.upcomingClasses.map(cls => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{cls.class.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.subject.name}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {cls.minutesUntil < 60
                      ? `${cls.minutesUntil} min`
                      : `${Math.floor(cls.minutesUntil / 60)}h ${cls.minutesUntil % 60}m`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ScheduleItemProps {
  session: {
    id: string
    startTime: string
    endTime: string
    class: { id: string, name: string }
    subject: { id: string, name: string }
    classroom: { name: string } | null
  }
}

function ScheduleItem({ session }: ScheduleItemProps) {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const isPast = session.endTime < currentTime
  const isCurrent
    = session.startTime <= currentTime && session.endTime >= currentTime
  const isUpcoming = session.startTime > currentTime

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${isCurrent
        ? 'border-primary bg-primary/5'
        : isPast
          ? 'opacity-60'
          : ''
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium">{session.startTime}</span>
        <span className="text-xs text-muted-foreground">{session.endTime}</span>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{session.class.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {session.subject.name}
          {session.classroom && ` • ${session.classroom.name}`}
        </p>
      </div>
      <div>
        {isPast && (
          <Badge variant="secondary" className="text-xs">
            ✓
          </Badge>
        )}
        {isCurrent && (
          <Badge variant="default" className="text-xs">
            En cours
          </Badge>
        )}
        {isUpcoming && (
          <Badge variant="outline" className="text-xs">
            À venir
          </Badge>
        )}
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  href: string
}

function QuickActionButton({ icon, label, href }: QuickActionButtonProps) {
  return (
    <Link
      to={href}
      className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center transition-colors hover:bg-muted active:scale-95"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}
