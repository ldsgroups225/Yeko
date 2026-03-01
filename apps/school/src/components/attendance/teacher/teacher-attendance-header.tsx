import { IconCircleCheck, IconDeviceFloppy, IconSearch } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { useTranslations } from '@/i18n'
import { useTeacherAttendance } from './teacher-attendance-context'
import { TeacherAttendanceSummary } from './teacher-attendance-summary'

export function TeacherAttendanceHeader() {
  const t = useTranslations()
  const { state, actions } = useTeacherAttendance()
  const { searchQuery, hasChanges, isSaving } = state
  const { setSearchQuery, handleMarkAllPresent, handleSave } = actions

  return (
    <CardHeader className="
      border-border/10 bg-muted/20 relative border-b pt-4 pb-4
    "
    >
      <div className="
        flex flex-col gap-4
        md:flex-row md:items-center md:justify-between
      "
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <CardTitle className="
              text-muted-foreground/60 text-[10px] font-black tracking-[0.2em]
              uppercase
            "
            >
              {t.nav.teachers()}
            </CardTitle>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase italic">{t.schoolLife.teacherAttendance()}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllPresent}
            className="
              border-border/40
              hover:bg-success/10 hover:text-success
              h-9 rounded-2xl px-4 text-[10px] font-black tracking-widest
              uppercase transition-all
            "
          >
            <IconCircleCheck className="mr-2 h-4 w-4" />
            {t.attendance.markAllPresent()}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="
              bg-primary shadow-primary/20 h-9 rounded-2xl px-6 text-[10px]
              font-black tracking-widest uppercase shadow-xl transition-all
              hover:scale-105
              active:scale-95
              disabled:grayscale
            "
          >
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            {isSaving ? t.common.saving() : t.common.save()}
          </Button>
        </div>
      </div>

      <TeacherAttendanceSummary />

      <div className="relative mt-4">
        <IconSearch className="
          text-muted-foreground/40 absolute top-1/2 left-4 size-4
          -translate-y-1/2
        "
        />
        <Input
          placeholder={t.common.search()}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="
            bg-background/50 border-border/40
            focus:ring-primary/20
            h-10 rounded-2xl pl-12 font-bold italic transition-all
          "
        />
      </div>
    </CardHeader>
  )
}
