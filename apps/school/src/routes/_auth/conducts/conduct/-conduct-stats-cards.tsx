import type { ReactNode } from 'react'
import type { ConductSummary } from './-conduct.types'
import type { TranslationFunctions } from '@/i18n'
import {
  IconAlertTriangle,
  IconAward,
  IconChartBar,
  IconUsers,
} from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@/lib/utils'

interface ConductStatsCardsProps {
  t: TranslationFunctions
  summary: ConductSummary
  isPending: boolean
}

export function ConductStatsCards({ t, summary, isPending }: ConductStatsCardsProps) {
  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {['total', 'avg', 'incidents', 'excellent'].map(key => (
          <Skeleton key={key} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title={t.common.total()}
        label={t.students.title()}
        value={summary.totalStudents.toString()}
        description={t.common.total()}
        tone="blue"
        icon={<IconUsers className="h-5 w-5" />}
      />
      <StatCard
        title={t.reportCards.average()}
        label={t.conduct.totalPoints()}
        value={`${summary.averageScore.toFixed(1)} / 20`}
        description={t.reportCards.average()}
        tone="green"
        icon={<IconChartBar className="h-5 w-5" />}
      />
      <StatCard
        title={t.conduct.type.incident()}
        label={t.conduct.totalRecords()}
        value={summary.totalIncidents.toString()}
        description={t.conduct.type.incident()}
        tone="orange"
        icon={<IconAlertTriangle className="h-5 w-5" />}
      />
      <StatCard
        title={t.attendance.status.present()}
        label={t.attendance.attendanceRate()}
        value={`${summary.presentRate}%`}
        description={`${summary.presentCount} ${t.common.of()} ${summary.attendanceKnownCount}`}
        tone="gold"
        icon={<IconAward className="h-5 w-5" />}
      />
    </div>
  )
}

function StatCard({
  title,
  label,
  value,
  description,
  icon,
  tone = 'blue',
}: {
  title: string
  label: string
  value: string
  description: string
  icon: ReactNode
  tone?: 'blue' | 'green' | 'orange' | 'gold'
}) {
  const toneClasses = {
    blue: 'border-blue-100 bg-linear-to-br from-blue-50 to-blue-100/50 text-blue-700',
    green: 'border-emerald-100 bg-linear-to-br from-emerald-50 to-emerald-100/60 text-emerald-700',
    orange: 'border-orange-100 bg-linear-to-br from-orange-50 to-orange-100/60 text-orange-700',
    gold: 'border-amber-100 bg-linear-to-br from-amber-50 to-amber-100/60 text-amber-700',
  }

  return (
    <Card className={cn('rounded-[24px] border shadow-[0_14px_30px_rgba(15,23,42,0.04)]', toneClasses[tone])}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold">
            {label}
          </div>
          <div>
            <p className="text-foreground text-[2rem] leading-none font-black tracking-tight">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{title}</p>
            <p className="text-muted-foreground/80 text-[11px]">{description}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/65 p-2.5 text-current">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
