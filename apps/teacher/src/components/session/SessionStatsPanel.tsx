import { IconCheck, IconClock, IconPercentage, IconUsers, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { m as motion } from 'motion/react'
import { useI18nContext } from '@/i18n/i18n-react'

type SessionMode = 'attendance_initial' | 'attendance_late' | 'participation'

interface SessionStatsPanelProps {
  mode: SessionMode
  attendanceStats?: {
    present: number
    absent: number
    late: number
  }
  participationStats?: {
    totalStudents: number
    participatedCount: number
    participationRate: number | string
  }
  totalStudents: number
  onAction: () => void
  actionLabel: string
  isActionDisabled?: boolean
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number | string
  color: 'primary' | 'emerald' | 'red' | 'amber' | 'muted'
  unit?: string
  className?: string
}

function StatCard({ icon, title, value, color, unit, className }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    amber: 'bg-accent/10 text-accent border-accent/20',
    muted: 'bg-muted/50 text-muted-foreground border-border/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3',
        colorClasses[color],
        className,
      )}
    >
      <div className="
        bg-background/50 flex h-10 w-10 items-center justify-center rounded-lg
      "
      >
        {icon}
      </div>
      <div>
        <p className="
          text-muted-foreground text-[10px] font-bold tracking-widest uppercase
        "
        >
          {title}
        </p>
        <p className="text-xl font-black">
          {value}
          {unit && <span className="ml-0.5 text-sm">{unit}</span>}
        </p>
      </div>
    </motion.div>
  )
}

export function SessionStatsPanel({
  mode,
  attendanceStats,
  participationStats,
  totalStudents,
  onAction,
  actionLabel,
  isActionDisabled = false,
  onSecondaryAction,
  secondaryActionLabel,
}: SessionStatsPanelProps) {
  const { LL } = useI18nContext()

  const isAttendanceMode = mode === 'attendance_initial' || mode === 'attendance_late'

  return (
    <div className="flex h-full flex-col">
      <h2 className="text-foreground mb-4 text-lg font-semibold">
        {LL.attendance.stats.title()}
      </h2>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {/* Total Students */}
        <StatCard
          icon={<IconUsers className="h-5 w-5" />}
          title={LL.session.statsTotal()}
          value={totalStudents}
          color="primary"
          className={mode === 'participation' ? 'col-span-2' : ''}
        />

        {isAttendanceMode && attendanceStats && (
          <>
            <StatCard
              icon={<IconCheck className="h-5 w-5" />}
              title={LL.session.statsPresent()}
              value={attendanceStats.present}
              color="emerald"
            />
            <StatCard
              icon={<IconX className="h-5 w-5" />}
              title={LL.session.statsAbsent()}
              value={attendanceStats.absent}
              color="red"
            />
            <StatCard
              icon={<IconClock className="h-5 w-5" />}
              title={LL.session.statsLate()}
              value={attendanceStats.late}
              color="amber"
            />
          </>
        )}

        {mode === 'participation' && participationStats && (
          <>
            <StatCard
              icon={<IconCheck className="h-5 w-5" />}
              title={LL.session.statsParticipated()}
              value={participationStats.participatedCount}
              color="emerald"
            />
            <StatCard
              icon={<IconPercentage className="h-5 w-5" />}
              title={LL.session.statsRate()}
              value={participationStats.participationRate}
              color="muted"
              unit="%"
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-row-reverse gap-2">
        {/* Action Button */}
        <Button
          size="lg"
          onClick={onAction}
          disabled={isActionDisabled}
          className="h-12 flex-1 rounded-xl font-bold shadow-lg"
        >
          {actionLabel}
        </Button>

        {/* Secondary Action */}
        {onSecondaryAction && secondaryActionLabel && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onSecondaryAction}
            className="
              hover:bg-destructive/10 hover:text-destructive
              h-12 flex-1 rounded-xl
            "
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
