import { IconBuilding, IconSchool, IconUsers } from '@tabler/icons-react'

import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group'
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
      value={[value]}
      onValueChange={v => v && v[0] && onChange(v[0] as TimetableViewMode)}
      disabled={disabled}
      className="
        bg-card/30 border-border/40 gap-1 rounded-2xl border p-1
        backdrop-blur-md
      "
    >
      <ToggleGroupItem
        value="class"
        aria-label={t.timetables.viewByClass()}
        className="
          data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
          hover:bg-muted/50
          rounded-xl transition-all
          data-[state=on]:shadow-lg
        "
      >
        <IconUsers className="mr-2 h-4 w-4" />
        {t.timetables.class()}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="teacher"
        aria-label={t.timetables.viewByTeacher()}
        className="
          data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
          hover:bg-muted/50
          rounded-xl transition-all
          data-[state=on]:shadow-lg
        "
      >
        <IconSchool className="mr-2 h-4 w-4" />
        {t.timetables.teacher()}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="classroom"
        aria-label={t.timetables.viewByClassroom()}
        className="
          data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
          hover:bg-muted/50
          rounded-xl transition-all
          data-[state=on]:shadow-lg
        "
      >
        <IconBuilding className="mr-2 h-4 w-4" />
        {t.timetables.classroom()}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
