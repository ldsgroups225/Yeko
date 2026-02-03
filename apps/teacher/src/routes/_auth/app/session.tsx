import type { Locale } from 'date-fns'
import { IconBook, IconCalendar, IconCircleCheck, IconCircleX, IconClock, IconPlayerPlay } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherDashboardQueryOptions } from '@/lib/queries/dashboard'
import { sessionHistoryQueryOptions } from '@/lib/queries/sessions'

export const Route = createFileRoute('/_auth/app/session')({
  component: SessionsPage,
})

function SessionsPage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const locale = currentLocale === 'fr' ? fr : undefined

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...sessionHistoryQueryOptions({
      teacherId: context?.teacherId ?? '',
      page: 1,
      pageSize: 20,
    }),
    enabled: !!context,
  })

  // Check for active session
  // Check for active session
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    ...teacherDashboardQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading || dashboardLoading

  if (isLoading) {
    return <SessionsSkeleton />
  }

  const sessions = data?.sessions ?? []
  const activeSession = dashboardData?.activeSession

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">

      {activeSession && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <IconClock className="w-5 h-5 text-primary animate-pulse" />
              {LL.session.active()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{activeSession.subjectName}</h3>
              <p className="text-muted-foreground">{activeSession.className}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalendar className="w-4 h-4" />
                {format(new Date(activeSession.startTime), 'HH:mm')}
              </div>
              <Link to="/app/sessions/$sessionId" params={{ sessionId: activeSession.id }} className="mt-2">
                <Button className="w-full">
                  <IconPlayerPlay className="w-4 h-4 mr-2" />
                  {LL.common.resume()}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <h1 className="text-xl font-semibold">{LL.session.history()}</h1>

      {sessions.length > 0
        ? (
            <div className="space-y-2">
              {sessions.map(session => (
                <SessionHistoryCard
                  key={session.id}
                  session={session}
                  locale={locale}
                />
              ))}
            </div>
          )
        : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconBook className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {LL.session.noHistory()}
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

interface SessionHistoryCardProps {
  session: {
    id: string
    className: string
    subjectName: string
    date: string
    startTime: string
    endTime: string | null
    status: 'scheduled' | 'completed' | 'cancelled'
    studentsPresent: number | null
    studentsAbsent: number | null
  }
  locale: Locale | undefined
}

function SessionHistoryCard({ session, locale }: SessionHistoryCardProps) {
  const { LL } = useI18nContext()

  const statusConfig = {
    scheduled: {
      icon: IconClock,
      label: LL.session.active(),
      variant: 'default' as const,
    },
    completed: {
      icon: IconCircleCheck,
      label: LL.session.completed(),
      variant: 'secondary' as const,
    },
    cancelled: {
      icon: IconCircleX,
      label: LL.session.cancelled(),
      variant: 'destructive' as const,
    },
  }

  const config = statusConfig[session.status]
  const StatusIcon = config.icon

  return (
    <Link to="/app/sessions/$sessionId" params={{ sessionId: session.id }}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(session.date), 'EEEE d MMM', { locale })}
                </span>
                <span>•</span>
                <span>
                  {session.startTime}
                  {' '}
                  -
                  {session.endTime}
                </span>
              </div>
              <h3 className="font-semibold">{session.subjectName}</h3>
              <p className="text-sm text-muted-foreground">
                {session.className}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={config.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
              {session.status === 'completed'
                && session.studentsPresent !== null && (
                <span className="text-xs text-muted-foreground">
                  {session.studentsPresent}
                  {' '}
                  présents
                  {session.studentsAbsent
                    ? ` / ${session.studentsAbsent} absents`
                    : ''}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <Skeleton className="h-7 w-40" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
