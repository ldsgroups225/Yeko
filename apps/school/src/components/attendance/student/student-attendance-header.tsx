import { IconCircleCheck, IconDeviceFloppy, IconSearch } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { useTranslations } from '@/i18n'
import { useStudentAttendance } from './student-attendance-context'
import { StudentAttendanceSummary } from './student-attendance-summary'

export function StudentAttendanceHeader() {
  const t = useTranslations()
  const { state, actions } = useStudentAttendance()
  const { searchQuery, hasChanges, isSaving, className } = state
  const { setSearchQuery, handleMarkAllPresent, handleSave } = actions

  return (
    <CardHeader className="relative border-b border-border/10 bg-muted/20 pb-4 pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {className}
            </CardTitle>
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">{t.schoolLife.studentAttendance()}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllPresent}
            className="h-9 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-success/10 hover:text-success transition-all px-4"
          >
            <IconCircleCheck className="mr-2 h-4 w-4" />
            {t.attendance.markAllPresent()}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="h-9 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] px-6 transition-all hover:scale-105 active:scale-95 disabled:grayscale"
          >
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            {isSaving ? t.common.saving() : t.common.save()}
          </Button>
        </div>
      </div>

      <StudentAttendanceSummary />

      <div className="mt-4 relative">
        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
        <Input
          placeholder={t.common.search()}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-10 pl-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold italic"
        />
      </div>
    </CardHeader>
  )
}
