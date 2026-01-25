import type { Locale } from 'date-fns'
import { IconBook, IconCalendar, IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { sessionHistoryQueryOptions } from '@/lib/queries/sessions'

export const Route = createFileRoute('/_auth/app/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'fr' ? fr : undefined

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...sessionHistoryQueryOptions({
      teacherId: context?.teacherId ?? '',
      page: 1,
      pageSize: 20,
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading

  if (isLoading) {
    return <SessionsSkeleton />
  }

  const sessions = data?.sessions ?? []

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('session.history')}</h1>

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
                  {t('session.noHistory')}
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
    endTime: string
    status: 'scheduled' | 'completed' | 'cancelled'
    studentsPresent: number | null
    studentsAbsent: number | null
  }
  locale: Locale | undefined
}

function SessionHistoryCard({ session, locale }: SessionHistoryCardProps) {
  const { t } = useTranslation()

  const statusConfig = {
    scheduled: {
      icon: IconClock,
      label: t('session.active'),
      variant: 'default' as const,
    },
    completed: {
      icon: IconCircleCheck,
      label: t('session.completed'),
      variant: 'secondary' as const,
    },
    cancelled: {
      icon: IconCircleX,
      label: t('session.cancelled'),
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
