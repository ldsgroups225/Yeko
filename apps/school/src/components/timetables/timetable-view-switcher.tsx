import { Building2, GraduationCap, Users } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useTranslations } from '@/i18n'

export type TimetableViewMode = 'class' | 'teacher' | 'classroom'

interface TimetableViewSwitcherProps {
  value: TimetableViewMode
  onChange: (value: TimetableViewMode) => void
  disabled?: boolean
}

export function TimetableViewSwitcher({
  value,
  onChange,
  disabled,
}: TimetableViewSwitcherProps) {
  const t = useTranslations()

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={v => v && onChange(v as TimetableViewMode)}
      disabled={disabled}
      className="bg-card/30 backdrop-blur-md border border-border/40 p-1 rounded-2xl gap-1"
    >
      <ToggleGroupItem
        value="class"
        aria-label={t.timetables.viewByClass()}
        className="rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all hover:bg-muted/50 data-[state=on]:shadow-lg"
      >
        <Users className="h-4 w-4 mr-2" />
        {t.timetables.class()}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="teacher"
        aria-label={t.timetables.viewByTeacher()}
        className="rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all hover:bg-muted/50 data-[state=on]:shadow-lg"
      >
        <GraduationCap className="h-4 w-4 mr-2" />
        {t.timetables.teacher()}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="classroom"
        aria-label={t.timetables.viewByClassroom()}
        className="rounded-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all hover:bg-muted/50 data-[state=on]:shadow-lg"
      >
        <Building2 className="h-4 w-4 mr-2" />
        {t.timetables.classroom()}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
