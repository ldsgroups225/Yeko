import { formatDate } from '@repo/data-ops'
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
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
  pending: {
    icon: IconClock,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent',
  },
  cancelled: {
    icon: IconCircleX,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
  },
  transferred: {
    icon: IconArrowRight,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
}

export function EnrollmentTimeline({ enrollments }: EnrollmentTimelineProps) {
  const t = useTranslations()

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="
        flex flex-col items-center justify-center py-8 text-center
      "
      >
        <IconSchool className="text-muted-foreground h-12 w-12" />
        <p className="text-muted-foreground mt-2">
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
      <div className="bg-border/40 absolute top-0 left-4 h-full w-0.5" />

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
                  `
                    bg-card absolute left-2 flex h-5 w-5 items-center
                    justify-center rounded-full border-2 backdrop-blur-sm
                  `,
                  config.borderColor,
                  isFirst && 'ring-primary/20 ring-2 ring-offset-2',
                  isFirst && config.bgColor,
                )}
              >
                <StatusIcon className={cn('h-3 w-3', config.color)} />
              </div>

              {/* Content */}
              <div
                className={cn(
                  `
                    border-border/40 bg-card/50 flex-1 rounded-xl border p-4
                    backdrop-blur-sm transition-all
                    hover:shadow-sm
                  `,
                  isFirst && 'border-primary/50 bg-primary/5 shadow-sm',
                )}
              >
                <div className="
                  flex flex-wrap items-start justify-between gap-2
                "
                >
                  <div>
                    <p className="font-semibold">
                      {item.class.gradeName}
                      {' '}
                      {item.class.section}
                      {item.class.seriesName && (
                        <span className="text-muted-foreground font-normal">
                          {' '}
                          (
                          {item.class.seriesName}
                          )
                        </span>
                      )}
                    </p>
                    {item.schoolYear && (
                      <p className="text-muted-foreground text-sm">
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

                <div className="
                  text-muted-foreground mt-3 flex flex-wrap gap-4 text-sm
                "
                >
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
                      <IconCircleCheck className="text-success h-3.5 w-3.5" />
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
                      <IconArrowRight className="text-primary h-3.5 w-3.5" />
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
                      <IconCircleX className="text-destructive h-3.5 w-3.5" />
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
