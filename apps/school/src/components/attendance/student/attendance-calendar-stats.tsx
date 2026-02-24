import type { AttendanceStatus } from './types-calendar'
import { IconInfoCircle } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { useAttendanceCalendar } from './attendance-calendar-context'
import { STATUS_CONFIG } from './types-calendar'

export function AttendanceCalendarStats() {
  const t = useTranslations()
  const { state } = useAttendanceCalendar()
  const { summary } = state

  return (
    <>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG['present']][]).map(([status, config]) => (
          <motion.div
            key={status}
            whileHover={{ y: -5 }}
            className={cn(
              'relative p-4 rounded-3xl border transition-all duration-300 group overflow-hidden',
              config.bgColor,
              config.borderColor,
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <config.icon className={cn('size-8', config.textColor)} />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className={cn('text-[10px] font-black uppercase tracking-[0.2em] italic', config.textColor)}>
                {config.label(t)}
              </span>
              <span className="text-2xl font-black italic tabular-nums">
                {summary[status]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <IconInfoCircle className="size-3 text-primary/40" />
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-relaxed">
          {t.attendance.historyDescription()}
        </p>
      </div>
    </>
  )
}
