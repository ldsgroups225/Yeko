import type { GradeType } from '@/schemas/grade'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from '@/i18n'
import { gradeTypeLabels, gradeTypes } from '@/schemas/grade'

interface GradeTypeSelectorProps {
  value: GradeType
  onValueChange: (value: GradeType) => void
  disabled?: boolean
  className?: string
}

export function GradeTypeSelector({
  value,
  onValueChange,
  disabled,
  className,
}: GradeTypeSelectorProps) {
  const t = useTranslations()

  return (
    <Select
      value={value}
      onValueChange={onValueChange as (value: string) => void}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={t.academic.grades.entry.selectGradeType()} />
      </SelectTrigger>
      <SelectContent>
        {gradeTypes.map(type => (
          <SelectItem key={type} value={type}>
            {gradeTypeLabels[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
