import { IconCalendar, IconChevronLeft, IconChevronRight, IconClock, IconInfoCircle, IconUserX } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { useLocale, useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

interface AttendanceDay {
  date: string
  status: AttendanceStatus
}

interface AttendanceCalendarProps {
  studentName: string
  studentPhoto?: string | null
  month: Date
  onMonthChange: (month: Date) => void
  attendanceData: AttendanceDay[]
}

const statusConfig: Record<AttendanceStatus, {
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  label: (t: any) => string
  icon: any
}> = {
  present: {
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-500',
    label: t => t.attendance.status.present(),
    icon: IconCalendar,
  },
  late: {
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-500',
    label: t => t.attendance.status.late(),
    icon: IconClock,
  },
  absent: {
    color: 'bg-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    textColor: 'text-rose-500',
    label: t => t.attendance.status.absent(),
    icon: IconUserX,
  },
  excused: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-500',
    label: t => t.attendance.status.excused(),
    icon: IconInfoCircle,
  },
}

export function AttendanceCalendar({
  studentName,
  studentPhoto,
  month,
  onMonthChange,
  attendanceData,
}: AttendanceCalendarProps) {
  const t = useTranslations()
  const { locale } = useLocale()

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    attendanceData.forEach(d => map.set(d.date, d.status))
    return map
  }, [attendanceData])

  const calendarDays = useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, monthIndex, d))
    }

    return days
  }, [month])

  const handlePrevMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  }

  const summary = {
    present: attendanceData.filter(d => d.status === 'present').length,
    late: attendanceData.filter(d => d.status === 'late').length,
    absent: attendanceData.filter(d => d.status === 'absent').length,
    excused: attendanceData.filter(d => d.status === 'excused').length,
  }

  const monthName = month.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })

  return (
    <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
      <CardHeader className="relative border-b border-border/10 bg-muted/20 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 rounded-2xl border border-primary/20 shadow-lg">
                <AvatarImage src={studentPhoto ?? undefined} alt={studentName} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px]">
                  {studentName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-background border border-border/40 shadow-sm">
                <IconCalendar className="size-2.5 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase italic tracking-tight">{studentName}</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{t.attendance.history()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg hover:bg-primary/5">
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[10px] font-black uppercase tracking-widest w-28 text-center italic">{monthName}</span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg hover:bg-primary/5">
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {(locale === 'fr' ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
            <div key={generateUUID()} className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          <AnimatePresence mode="popLayout">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={generateUUID()} className="h-12 rounded-2xl" />
              }
              const dateStr = day.toISOString().split('T')[0]
              const status = attendanceMap.get(dateStr ?? '')
              const config = status ? statusConfig[status] : null
              const isToday = new Date().toISOString().split('T')[0] === dateStr

              return (
                <TooltipProvider key={dateStr}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.005 }}
                        className={cn(
                          'h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all group relative overflow-hidden border',
                          config
                            ? cn(config.bgColor, config.borderColor, 'shadow-lg shadow-black/5 scale-[1.02] z-10')
                            : 'bg-background/20 border-border/10 hover:border-primary/30',
                          isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        )}
                      >
                        <span className={cn(
                          'text-xs font-black italic tracking-tight',
                          config ? 'text-foreground' : 'text-muted-foreground/30',
                          isToday && 'text-primary',
                        )}
                        >
                          {day.getDate()}
                        </span>

                        {config
                          ? (
                              <div className={cn('size-1.5 rounded-full shadow-sm', config.color)} />
                            )
                          : (
                              <div className="size-1.5 rounded-full bg-border/20 group-hover:bg-primary/20 transition-colors" />
                            )}
                      </motion.div>
                    </TooltipTrigger>
                    {config && (
                      <TooltipContent className="rounded-2xl font-black uppercase tracking-[0.2em] text-[8px] border-border/40 backdrop-blur-xl bg-background/80 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('size-2 rounded-full animate-pulse', config.color)} />
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

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.entries(statusConfig) as [AttendanceStatus, typeof statusConfig['present']][]).map(([status, config]) => (
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
                  {(summary as any)[status]}
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
      </CardContent>
    </Card>
  )
}
