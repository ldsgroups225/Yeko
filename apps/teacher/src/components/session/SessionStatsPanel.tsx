import { IconCheck, IconClock, IconPercentage, IconUsers, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'motion/react'
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
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    muted: 'bg-muted/50 text-muted-foreground border-border/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border',
        colorClasses[color],
        className,
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <p className="text-xl font-black">
          {value}
          {unit && <span className="text-sm ml-0.5">{unit}</span>}
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
    <div className="flex flex-col h-full">
      <h2 className="mb-4 font-semibold text-foreground text-lg">
        {LL.attendance.stats.title()}
      </h2>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {/* Total Students */}
        <StatCard
          icon={<IconUsers className="w-5 h-5" />}
          title={LL.session.statsTotal()}
          value={totalStudents}
          color="primary"
          className={mode === 'participation' ? 'col-span-2' : ''}
        />

        {isAttendanceMode && attendanceStats && (
          <>
            <StatCard
              icon={<IconCheck className="w-5 h-5" />}
              title={LL.session.statsPresent()}
              value={attendanceStats.present}
              color="emerald"
            />
            <StatCard
              icon={<IconX className="w-5 h-5" />}
              title={LL.session.statsAbsent()}
              value={attendanceStats.absent}
              color="red"
            />
            <StatCard
              icon={<IconClock className="w-5 h-5" />}
              title={LL.session.statsLate()}
              value={attendanceStats.late}
              color="amber"
            />
          </>
        )}

        {mode === 'participation' && participationStats && (
          <>
            <StatCard
              icon={<IconCheck className="w-5 h-5" />}
              title={LL.session.statsParticipated()}
              value={participationStats.participatedCount}
              color="emerald"
            />
            <StatCard
              icon={<IconPercentage className="w-5 h-5" />}
              title={LL.session.statsRate()}
              value={participationStats.participationRate}
              color="muted"
              unit="%"
            />
          </>
        )}
      </div>

      <div className="flex flex-row-reverse gap-2 mt-4">
        {/* Action Button */}
        <Button
          size="lg"
          onClick={onAction}
          disabled={isActionDisabled}
          className="flex-1 h-12 font-bold rounded-xl shadow-lg"
        >
          {actionLabel}
        </Button>

        {/* Secondary Action */}
        {onSecondaryAction && secondaryActionLabel && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onSecondaryAction}
            className="flex-1 h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
