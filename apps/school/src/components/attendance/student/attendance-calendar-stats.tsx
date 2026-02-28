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
      <div className="
        mt-8 grid grid-cols-2 gap-4
        md:grid-cols-4
      "
      >
        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG['present']][]).map(([status, config]) => (
          <motion.div
            key={status}
            whileHover={{ y: -5 }}
            className={cn(
              `
                group relative overflow-hidden rounded-3xl border p-4
                transition-all duration-300
              `,
              config.bgColor,
              config.borderColor,
            )}
          >
            <div className="
              absolute top-0 right-0 p-4 opacity-5 transition-transform
              duration-500
              group-hover:scale-110
            "
            >
              <config.icon className={cn('size-8', config.textColor)} />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className={cn(`
                text-[10px] font-black tracking-[0.2em] uppercase italic
              `, config.textColor)}
              >
                {config.label(t)}
              </span>
              <span className="text-2xl font-black italic tabular-nums">
                {summary[status]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="
        bg-primary/5 border-primary/10 mt-4 flex items-center gap-2 rounded-2xl
        border p-3
      "
      >
        <IconInfoCircle className="text-primary/40 size-3" />
        <p className="
          text-muted-foreground/40 text-[9px] leading-relaxed font-bold
          tracking-widest uppercase italic
        "
        >
          {t.attendance.historyDescription()}
        </p>
      </div>
    </>
  )
}
