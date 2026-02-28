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
    <header className="mb-10 flex flex-col gap-6 px-1 pt-4">
      <div className="flex items-center justify-between">
        <Link
          to="/app/schools/$schoolId/classes"
          params={{ schoolId }}
          className="
            group text-muted-foreground
            hover:text-foreground
            flex items-center gap-2 transition-all duration-300
          "
        >
          <div className="
            bg-muted/50
            group-hover:bg-primary/20 group-hover:text-primary
            flex h-9 w-9 items-center justify-center rounded-full shadow-sm
            transition-all
          "
          >
            <IconArrowLeft className="h-4 w-4" />
          </div>
          <span className="
            text-sm font-bold tracking-tight uppercase transition-transform
            group-hover:translate-x-0.5
          "
          >
            {LL.nav.back()}
          </span>
        </Link>
        {isSessionActive && (
          <div className="flex gap-2.5">
            <Badge
              variant="outline"
              className="
                h-8 animate-pulse border-emerald-500/20 bg-emerald-500/10 px-4
                font-bold text-emerald-600 shadow-sm
              "
            >
              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {LL.session.gpsActive()}
            </Badge>
            <Badge
              variant="outline"
              className="
                bg-primary/10 border-primary/20 text-primary h-8 px-4 font-bold
                shadow-sm
              "
            >
              <div className="bg-primary mr-2 h-1.5 w-1.5 rounded-full" />
              {LL.session.active()}
            </Badge>
          </div>
        )}
      </div>

      <div className="
        flex flex-col justify-between gap-6
        sm:flex-row sm:items-end
      "
      >
        <div className="space-y-2">
          <h1 className="
            text-foreground text-wrap-balance text-4xl font-black tracking-tight
            lining-nums
            sm:text-5xl
          "
          >
            {classroomName}
          </h1>
          <div className="text-muted-foreground/80 flex items-center gap-2.5">
            <div className="bg-primary/40 h-2 w-2 rounded-full" />
            <p className="text-sm font-bold tracking-widest uppercase">{LL.common.student_plural()}</p>
          </div>
        </div>

        <div className="
          flex w-full items-center gap-3
          sm:w-auto sm:gap-4
        "
        >
          {!isEntryMode
            ? (
                <>
                  {isWithinTimeWindow && !isSessionActive && (
                    <Button
                      variant={isLate ? 'destructive' : 'default'}
                      className={`
                        h-12 min-w-[160px] flex-1 rounded-xl font-black
                        shadow-xl transition-all
                        active:scale-95
                        sm:h-14 sm:flex-none sm:rounded-2xl
                        ${
                    !isLate ? 'shadow-primary/25' : 'shadow-destructive/25'
                    }
                      `}
                      onClick={onStartSession}
                    >
                      <IconClock className="mr-2.5 h-5 w-5" />
                      {LL.session.startClass()}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="
                      border-primary/20 bg-primary/5 text-primary
                      hover:bg-primary/10
                      h-12 min-w-[160px] flex-1 rounded-xl border-2 font-black
                      transition-all
                      active:scale-95
                      sm:h-14 sm:flex-none sm:rounded-2xl
                    "
                    onClick={onStartEntry}
                  >
                    <IconPlus className="mr-2.5 h-5 w-5" />
                    {LL.grades.addNote()}
                  </Button>
                </>
              )
            : (
                <>
                  <Button
                    variant="outline"
                    className="
                      h-12 min-w-[130px] flex-1 rounded-xl border-2 font-black
                      sm:h-14 sm:flex-none
                    "
                    onClick={onCancelEntry}
                  >
                    {LL.common.cancel()}
                  </Button>
                  <Button
                    className="
                      h-12 min-w-[130px] flex-1 rounded-xl font-black shadow-2xl
                      hover:brightness-110
                      sm:h-14 sm:flex-none
                    "
                    onClick={onSaveEntry}
                    disabled={isSaving}
                  >
                    <IconDeviceFloppy className="mr-2.5 h-5 w-5" />
                    {LL.common.save()}
                  </Button>
                </>
              )}
        </div>
      </div>
    </header>
  )
}
