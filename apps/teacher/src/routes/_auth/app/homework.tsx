import type { Locale } from 'date-fns'

import type { TranslationFunctions } from '@/i18n/i18n-types'
import { IconBook, IconCalendar, IconCircleCheck, IconCircleX, IconClock, IconFileText, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { format, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'

import { homeworkListQueryOptions } from '@/lib/queries/homework'

export const Route = createFileRoute('/_auth/app/homework')({
  component: HomeworkLayout,
})

function HomeworkLayout() {
  const { location } = useRouterState()
  const isExactHomework = location.pathname === '/app/homework' || location.pathname === '/app/homework/'

  if (!isExactHomework) {
    return <Outlet />
  }

  return <HomeworkPage />
}

function HomeworkPage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const locale = currentLocale === 'fr' ? fr : undefined
  const [status, setStatus] = useState<'active' | 'closed' | 'draft'>('active')

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isPending: dataPending } = useQuery({
    ...homeworkListQueryOptions({
      teacherId: context?.teacherId ?? '',
      status: status === 'closed' ? 'closed' : status,
    }),
    enabled: !!context,
  })

  const isPending = contextLoading || dataPending

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{LL.homework.title()}</h1>
        <Link to="/app/homework/new">
          <Button size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            {LL.homework.new()}
          </Button>
        </Link>
      </div>

      <Tabs
        value={status}
        onValueChange={v => setStatus(v as typeof status)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="gap-1.5">
            <IconClock className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.homework.status.active()}</span>
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-1.5">
            <IconCircleCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.homework.status.closed()}</span>
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-1.5">
            <IconFileText className="h-4 w-4" />
            <span className="hidden sm:inline">{LL.homework.status.draft()}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="mt-4">
          {isPending
            ? (
                <HomeworkSkeleton />
              )
            : data?.homework && data.homework.length > 0
              ? (
                  <div className="space-y-2">
                    {data.homework.map(hw => (
                      <HomeworkCard key={hw.id} homework={hw} locale={locale} />
                    ))}
                  </div>
                )
              : (
                  <EmptyHomework status={status} />
                )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface HomeworkCardProps {
  homework: {
    id: string
    title: string
    className: string
    subjectName: string
    dueDate: string
    dueTime: string | null
    status: 'draft' | 'active' | 'closed' | 'cancelled'
    submissionCount: number
    totalStudents: number
  }
  locale: Locale | undefined
}

function HomeworkCard({ homework, locale }: HomeworkCardProps) {
  const { LL } = useI18nContext()
  const dueDate = new Date(homework.dueDate)
  const isOverdue = isPast(dueDate) && homework.status === 'active'
  const isDueToday = isToday(dueDate)

  return (
    <Link to="/app/homework/$homeworkId" params={{ homeworkId: homework.id }}>
      <Card className={`transition-colors hover:bg-muted/50 ${isOverdue ? 'border-destructive/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="truncate font-semibold">{homework.title}</h3>
              <p className="text-sm text-muted-foreground">
                {homework.className}
                {' '}
                •
                {homework.subjectName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconCalendar className="h-3.5 w-3.5" />
                <span className={isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : ''}>
                  {format(dueDate, 'd MMM yyyy', { locale })}
                  {homework.dueTime && ` ${LL.common.at()} ${homework.dueTime}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={homework.status} isOverdue={isOverdue} />
              {homework.status === 'active' && (
                <span className="text-xs text-muted-foreground">
                  {homework.submissionCount}
                  /
                  {homework.totalStudents}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatusBadge({ status, isOverdue }: { status: keyof TranslationFunctions['homework']['status'], isOverdue: boolean }) {
  const { LL } = useI18nContext()

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="gap-1">
        <IconCircleX className="h-3 w-3" />
        {LL.homework.overdue()}
      </Badge>
    )
  }

  const config: Record<keyof TranslationFunctions['homework']['status'], { icon: typeof IconClock, variant: 'default' | 'secondary' | 'outline' }> = {
    active: { icon: IconClock, variant: 'default' },
    closed: { icon: IconCircleCheck, variant: 'secondary' },
    draft: { icon: IconFileText, variant: 'outline' },
    cancelled: { icon: IconCircleX, variant: 'outline' },
  }

  const statusConfig = config[status] || config.active
  const Icon = statusConfig.icon
  const variant = statusConfig.variant

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {LL.homework.status[status]()}
    </Badge>
  )
}

function EmptyHomework({ status }: { status: string }) {
  const { LL } = useI18nContext()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <IconBook className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {LL.homework.noHomework()}
        </p>
        {status === 'active' && (
          <Link to="/app/homework/new">
            <Button variant="outline" className="mt-4">
              <IconPlus className="mr-2 h-4 w-4" />
              {LL.homework.new()}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function HomeworkSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
