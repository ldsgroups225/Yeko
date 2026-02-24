import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'
import { useAttendanceCalendar } from './attendance-calendar-context'

export function AttendanceCalendarHeader() {
  const t = useTranslations()
  const { state, actions } = useAttendanceCalendar()
  const { studentName, studentPhoto, monthName } = state
  const { handlePrevMonth, handleNextMonth } = actions

  return (
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
            <CardTitle className="text-sm font-black uppercase italic tracking-tight">
              {studentName}
            </CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
              {t.attendance.history()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg hover:bg-primary/5">
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[10px] font-black uppercase tracking-widest w-28 text-center italic">
            {monthName}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg hover:bg-primary/5">
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
