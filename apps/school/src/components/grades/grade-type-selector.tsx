import type { GradeType } from '@/schemas/grade'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  return (
    <Select
      value={value}
      onValueChange={onValueChange as (value: string) => void}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Type de note" />
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
