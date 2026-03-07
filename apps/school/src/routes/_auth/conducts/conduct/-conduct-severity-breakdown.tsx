import type { ConductSummary } from './-conduct.types'
import type { TranslationFunctions } from '@/i18n'
import { Card, CardContent } from '@workspace/ui/components/card'
import { motion } from 'motion/react'

interface ConductSeverityBreakdownProps {
  t: TranslationFunctions
  summary: ConductSummary
}

export function ConductSeverityBreakdown({ t, summary }: ConductSeverityBreakdownProps) {
  const total = Math.max(1, summary.attendanceKnownCount)

  return (
    <Card className="rounded-[28px] border-white/60 bg-white/85 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-3 md:grid-cols-2">
          <BreakdownCard
            label={t.attendance.status.present()}
            value={summary.byStatus.present}
            total={total}
            tone="green"
          />
          <BreakdownCard
            label={t.attendance.status.late()}
            value={summary.byStatus.late}
            total={total}
            tone="amber"
          />
          <BreakdownCard
            label={t.attendance.status.absent()}
            value={summary.byStatus.absent}
            total={total}
            tone="red"
          />
          <BreakdownCard
            label={t.attendance.status.excused()}
            value={summary.byStatus.excused}
            total={total}
            tone="blue"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function BreakdownCard({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: 'green' | 'amber' | 'red' | 'blue'
}) {
  const percent = Number(((value / Math.max(1, total)) * 100).toFixed(1))
  const palette = {
    green: {
      badge: 'bg-emerald-100 text-emerald-700',
      track: 'bg-emerald-100',
      bar: 'bg-emerald-500',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-700',
      track: 'bg-amber-100',
      bar: 'bg-amber-500',
    },
    red: {
      badge: 'bg-red-100 text-red-700',
      track: 'bg-red-100',
      bar: 'bg-red-500',
    },
    blue: {
      badge: 'bg-blue-100 text-blue-700',
      track: 'bg-blue-100',
      bar: 'bg-blue-500',
    },
  }[tone]

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${palette.badge}`}>
          {label}
        </span>
        <div className="text-right">
          <div className="text-foreground text-xl font-black">{value}</div>
          <div className="text-muted-foreground text-[11px] font-semibold">{`${percent}%`}</div>
        </div>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${palette.track}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full ${palette.bar}`}
        />
      </div>
    </div>
  )
}
