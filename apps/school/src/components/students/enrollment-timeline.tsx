import {
  IconArrowRight,
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconSchool,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'

import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/formatDate'

interface EnrollmentItem {
  enrollment: {
    id: string
    enrollmentDate: string
    status: string
    confirmedAt?: string | null
    cancelledAt?: string | null
    transferredAt?: string | null
    rollNumber?: number | null
  }
  class: {
    id: string
    section: string
    gradeName: string
    seriesName?: string | null
  }
  schoolYear?: {
    id: string
    name: string
  }
}

interface EnrollmentTimelineProps {
  enrollments: EnrollmentItem[]
}

const statusConfig = {
  confirmed: {
    icon: IconCircleCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
  },
  pending: {
    icon: IconClock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
  },
  cancelled: {
    icon: IconCircleX,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
  },
  transferred: {
    icon: IconArrowRight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
  },
}

export function EnrollmentTimeline({ enrollments }: EnrollmentTimelineProps) {
  const t = useTranslations()

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <IconSchool className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          {t.students.noEnrollmentHistory()}
        </p>
      </div>
    )
  }

  // Sort by enrollment date descending (most recent first)
  const sortedEnrollments = [...enrollments].sort(
    (a, b) =>
      new Date(b.enrollment.enrollmentDate).getTime()
        - new Date(a.enrollment.enrollmentDate).getTime(),
  )

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border/40" />

      <div className="space-y-6">
        {sortedEnrollments.map((item, index) => {
          const status = item.enrollment.status as keyof typeof statusConfig
          const config = statusConfig[status] || statusConfig.pending
          const StatusIcon = config.icon
          const isFirst = index === 0

          return (
            <div key={item.enrollment.id} className="relative flex gap-4 pl-10">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute left-2 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-card backdrop-blur-sm',
                  config.borderColor,
                  isFirst && 'ring-2 ring-offset-2 ring-primary/20',
                  isFirst && config.bgColor,
                )}
              >
                <StatusIcon className={cn('h-3 w-3', config.color)} />
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 transition-all hover:shadow-sm',
                  isFirst && 'border-primary/50 bg-primary/5 shadow-sm',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {item.class.gradeName}
                      {' '}
                      {item.class.section}
                      {item.class.seriesName && (
                        <span className="font-normal text-muted-foreground">
                          {' '}
                          (
                          {item.class.seriesName}
                          )
                        </span>
                      )}
                    </p>
                    {item.schoolYear && (
                      <p className="text-sm text-muted-foreground">
                        {item.schoolYear.name}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={cn(config.bgColor, config.color, 'border-0')}
                  >
                    {{
                      confirmed: t.students.enrollmentConfirmed,
                      pending: t.students.enrollmentPending,
                      cancelled: t.students.enrollmentCancelled,
                      transferred: t.students.enrollmentTransferred,
                    }[status]()}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5" />
                    <span>
                      {t.students.enrolled()}
                      :
                      {' '}
                      {formatDate(item.enrollment.enrollmentDate, 'MEDIUM')}
                    </span>
                  </div>
                  {item.enrollment.rollNumber && (
                    <div className="flex items-center gap-1">
                      <span>
                        {t.students.rollNumber()}
                        : #
                        {item.enrollment.rollNumber}
                      </span>
                    </div>
                  )}
                  {item.enrollment.confirmedAt && (
                    <div className="flex items-center gap-1">
                      <IconCircleCheck className="h-3.5 w-3.5 text-green-600" />
                      <span>
                        {t.students.confirmedOn()}
                        :
                        {' '}
                        {formatDate(item.enrollment.confirmedAt, 'MEDIUM')}
                      </span>
                    </div>
                  )}
                  {item.enrollment.transferredAt && (
                    <div className="flex items-center gap-1">
                      <IconArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        {t.students.transferredOn()}
                        :
                        {' '}
                        {formatDate(item.enrollment.transferredAt, 'MEDIUM')}
                      </span>
                    </div>
                  )}
                  {item.enrollment.cancelledAt && (
                    <div className="flex items-center gap-1">
                      <IconCircleX className="h-3.5 w-3.5 text-red-600" />
                      <span>
                        {t.students.cancelledOn()}
                        :
                        {' '}
                        {formatDate(item.enrollment.cancelledAt, 'MEDIUM')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
