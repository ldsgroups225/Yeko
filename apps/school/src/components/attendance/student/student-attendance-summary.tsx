import type { StudentAttendanceStatus } from './types'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { useStudentAttendance } from './student-attendance-context'
import { STATUS_CONFIG } from './types'

export function StudentAttendanceSummary() {
  const t = useTranslations()
  const { state } = useStudentAttendance()
  const { summary } = state

  return (
    <div className="
      mt-4 grid grid-cols-2 gap-3
      md:grid-cols-4
    "
    >
      <SummaryCard
        label={t.attendance.status.present()}
        count={summary.present}
        config={STATUS_CONFIG.present}
      />
      <SummaryCard
        label={t.attendance.status.late()}
        count={summary.late}
        config={STATUS_CONFIG.late}
      />
      <SummaryCard
        label={t.attendance.status.absent()}
        count={summary.absent}
        config={STATUS_CONFIG.absent}
      />
      <SummaryCard
        label={t.attendance.status.excused()}
        count={summary.excused}
        config={STATUS_CONFIG.excused}
      />
    </div>
  )
}

function SummaryCard({ label, count, config }: { label: string, count: number, config: typeof STATUS_CONFIG[StudentAttendanceStatus] }) {
  const Icon = config.icon
  return (
    <div className={cn(
      `
        group relative overflow-hidden rounded-2xl border p-3 transition-all
        duration-300
      `,
      config.bgColor,
      config.borderColor,
    )}
    >
      <div className="
        absolute top-0 right-0 p-3 opacity-5 transition-transform duration-500
        group-hover:scale-110
      "
      >
        <Icon className={cn('size-6', config.color)} />
      </div>
      <div className="relative z-10 flex flex-col">
        <span className={cn(`
          mb-0.5 text-[8px] font-black tracking-widest uppercase italic
        `, config.color)}
        >
          {label}
        </span>
        <span className="
          text-xl font-black italic tabular-nums transition-transform
          group-hover:translate-x-1
        "
        >
          {count}
        </span>
      </div>
    </div>
  )
}
