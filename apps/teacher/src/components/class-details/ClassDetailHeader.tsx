import {
  IconArrowLeft,
  IconClock,
  IconDeviceFloppy,
  IconPlus,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { useI18nContext } from '@/i18n/i18n-react'

interface ClassDetailHeaderProps {
  schoolId: string
  className: string
  isSessionActive: boolean
  isEntryMode: boolean
  isSaving: boolean
  isWithinTimeWindow: boolean
  isLate: boolean
  onStartSession: () => void
  onStartEntry: () => void
  onCancelEntry: () => void
  onSaveEntry: () => void
}

export function ClassDetailHeader({
  schoolId,
  className: classroomName,
  isSessionActive,
  isEntryMode,
  isSaving,
  isWithinTimeWindow,
  isLate,
  onStartSession,
  onStartEntry,
  onCancelEntry,
  onSaveEntry,
}: ClassDetailHeaderProps) {
  const { LL } = useI18nContext()

  return (
    <header className="flex flex-col gap-6 mb-10 pt-4 px-1">
      <div className="flex items-center justify-between">
        <Link
          to="/app/schools/$schoolId/classes"
          params={{ schoolId }}
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 group-hover:bg-primary/20 group-hover:text-primary transition-all shadow-sm">
            <IconArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight uppercase group-hover:translate-x-0.5 transition-transform">
            {LL.nav.back()}
          </span>
        </Link>
        {isSessionActive && (
          <div className="flex gap-2.5">
            <Badge variant="outline" className="h-8 px-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold animate-pulse shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
              {LL.session.gpsActive()}
            </Badge>
            <Badge variant="outline" className="h-8 px-4 bg-primary/10 border-primary/20 text-primary font-bold shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              {LL.session.active()}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground lining-nums text-wrap-balance">
            {classroomName}
          </h1>
          <div className="flex items-center gap-2.5 text-muted-foreground/80">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <p className="text-sm font-bold uppercase tracking-widest">{LL.common.student_plural()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {!isEntryMode
            ? (
                <>
                  {isWithinTimeWindow && !isSessionActive && (
                    <Button
                      variant={isLate ? 'destructive' : 'default'}
                      className={`flex-1 sm:flex-none min-w-[160px] h-12 sm:h-14 font-black rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-95 ${
                        !isLate ? 'shadow-primary/25' : 'shadow-destructive/25'
                      }`}
                      onClick={onStartSession}
                    >
                      <IconClock className="w-5 h-5 mr-2.5" />
                      {LL.session.startClass()}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none min-w-[160px] h-12 sm:h-14 font-black rounded-xl sm:rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-95"
                    onClick={onStartEntry}
                  >
                    <IconPlus className="w-5 h-5 mr-2.5" />
                    {LL.grades.addNote()}
                  </Button>
                </>
              )
            : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none min-w-[130px] h-12 sm:h-14 font-black rounded-xl border-2"
                    onClick={onCancelEntry}
                  >
                    {LL.common.cancel()}
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none min-w-[130px] h-12 sm:h-14 font-black rounded-xl shadow-2xl hover:brightness-110"
                    onClick={onSaveEntry}
                    disabled={isSaving}
                  >
                    <IconDeviceFloppy className="w-5 h-5 mr-2.5" />
                    {LL.common.save()}
                  </Button>
                </>
              )}
        </div>
      </div>
    </header>
  )
}
