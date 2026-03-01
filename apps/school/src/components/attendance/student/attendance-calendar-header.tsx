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
    <CardHeader className="
      border-border/10 bg-muted/20 relative border-b pt-4 pb-4
    "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="
              border-primary/20 h-10 w-10 rounded-2xl border shadow-lg
            "
            >
              <AvatarImage src={studentPhoto ?? undefined} alt={studentName} />
              <AvatarFallback className="
                bg-primary/10 text-primary text-[10px] font-black
                tracking-widest uppercase
              "
              >
                {studentName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="
              bg-background border-border/40 absolute -right-1 -bottom-1
              rounded-lg border p-1 shadow-sm
            "
            >
              <IconCalendar className="text-primary size-2.5" />
            </div>
          </div>
          <div>
            <CardTitle className="
              text-sm font-black tracking-tight uppercase italic
            "
            >
              {studentName}
            </CardTitle>
            <p className="
              text-muted-foreground/40 text-[10px] font-bold tracking-widest
              uppercase italic
            "
            >
              {t.attendance.history()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="
              hover:bg-primary/5
              h-8 w-8 rounded-lg
            "
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <span className="
            w-28 text-center text-[10px] font-black tracking-widest uppercase
            italic
          "
          >
            {monthName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="
              hover:bg-primary/5
              h-8 w-8 rounded-lg
            "
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
