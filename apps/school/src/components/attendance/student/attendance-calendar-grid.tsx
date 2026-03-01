import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'
import { useAttendanceCalendar } from './attendance-calendar-context'
import { STATUS_CONFIG } from './types-calendar'

export function AttendanceCalendarGrid() {
  const t = useTranslations()
  const { locale } = useLocale()
  const { state } = useAttendanceCalendar()
  const { calendarDays, attendanceMap } = state

  const dayNames = locale === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div className="mb-4 grid grid-cols-7 gap-2 text-center">
        {dayNames.map(day => (
          <div
            key={generateUUID()}
            className="
              text-muted-foreground/30 text-[8px] font-black tracking-widest
              uppercase
            "
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        <AnimatePresence mode="popLayout">
          {calendarDays.map((day, idx) => {
            if (!day)
              return <div key={generateUUID()} className="h-12 rounded-2xl" />

            const dateStr = day.toISOString().split('T')[0]
            const status = attendanceMap.get(dateStr ?? '')
            const config = status ? STATUS_CONFIG[status] : null
            const isToday = new Date().toISOString().split('T')[0] === dateStr

            return (
              <TooltipProvider key={dateStr}>
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.005 }}
                        className={cn(
                          `
                            group relative flex h-12 flex-col items-center
                            justify-center gap-0.5 overflow-hidden rounded-2xl
                            border transition-all
                          `,
                          config
                            ? cn(config.bgColor, config.borderColor, `
                              z-10 scale-[1.02] shadow-lg shadow-black/5
                            `)
                            : `
                              bg-background/20 border-border/10
                              hover:border-primary/30
                            `,
                          isToday && `
                            ring-primary ring-offset-background ring-2
                            ring-offset-2
                          `,
                        )}
                      >
                        <span className={cn(
                          'text-xs font-black tracking-tight italic',
                          config
                            ? 'text-foreground'
                            : `text-muted-foreground/30`,
                          isToday && 'text-primary',
                        )}
                        >
                          {day.getDate()}
                        </span>
                        {config
                          ? <div className={cn('size-1.5 rounded-full shadow-sm', config.color)} />
                          : (
                              <div className="
                                bg-border/20
                                group-hover:bg-primary/20
                                size-1.5 rounded-full transition-colors
                              "
                              />
                            )}
                      </motion.div>
                    )}
                  />
                  {config && (
                    <TooltipContent className="
                      border-border/40 bg-background/80 rounded-2xl px-3 py-2
                      text-[8px] font-black tracking-[0.2em] uppercase
                      backdrop-blur-xl
                    "
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('size-2 animate-pulse rounded-full', config.color)} />
                        {config.label(t)}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}
