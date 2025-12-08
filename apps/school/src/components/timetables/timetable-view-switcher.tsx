import { Building2, GraduationCap, Users } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
  const { t } = useTranslation()

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={v => v && onChange(v as TimetableViewMode)}
      disabled={disabled}
    >
      <ToggleGroupItem value="class" aria-label={t('timetables.viewByClass')}>
        <Users className="h-4 w-4 mr-2" />
        {t('timetables.class')}
      </ToggleGroupItem>
      <ToggleGroupItem value="teacher" aria-label={t('timetables.viewByTeacher')}>
        <GraduationCap className="h-4 w-4 mr-2" />
        {t('timetables.teacher')}
      </ToggleGroupItem>
      <ToggleGroupItem value="classroom" aria-label={t('timetables.viewByClassroom')}>
        <Building2 className="h-4 w-4 mr-2" />
        {t('timetables.classroom')}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
