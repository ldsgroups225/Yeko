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
  onStartSession: () => void
  onStartEntry: () => void
  onCancelEntry: () => void
  onSaveEntry: () => void
}

export function ClassDetailHeader({
  schoolId,
  className: classromName,
  isSessionActive,
  isEntryMode,
  isSaving,
  onStartSession,
  onStartEntry,
  onCancelEntry,
  onSaveEntry,
}: ClassDetailHeaderProps) {
  const { LL } = useI18nContext()

  return (
    <header className="flex flex-col gap-6 mb-8 pt-2">
      <div className="flex items-center justify-between">
        <Link
          to="/app/schools/$schoolId/classes"
          params={{ schoolId }}
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <IconArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight uppercase">{LL.nav.back()}</span>
        </Link>
        {isSessionActive && (
          <Badge variant="outline" className="h-7 px-3 bg-primary/10 border-primary/20 text-primary font-bold animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            {LL.session.active()}
          </Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground lining-nums">
            {classromName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <p className="text-sm font-bold uppercase tracking-wider">{LL.common.student_plural()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isEntryMode
            ? (
                <>
                  {!isSessionActive && (
                    <Button
                      className="flex-1 min-w-[140px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                      onClick={onStartSession}
                    >
                      <IconClock className="w-5 h-5 mr-2" />
                      {LL.session.start()}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[140px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                    onClick={onStartEntry}
                  >
                    <IconPlus className="w-5 h-5 mr-2" />
                    {LL.grades.addNote()}
                  </Button>
                </>
              )
            : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl"
                    onClick={onCancelEntry}
                  >
                    {LL.common.cancel()}
                  </Button>
                  <Button
                    className="flex-1 min-w-[120px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl shadow-xl"
                    onClick={onSaveEntry}
                    disabled={isSaving}
                  >
                    <IconDeviceFloppy className="w-5 h-5 mr-2" />
                    {LL.common.save()}
                  </Button>
                </>
              )}
        </div>
      </div>
    </header>
  )
}
