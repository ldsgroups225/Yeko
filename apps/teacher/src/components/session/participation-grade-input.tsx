import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ParticipationGradeInputProps {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

const grades = [1, 2, 3, 4, 5] as const

export function ParticipationGradeInput({
  value,
  onChange,
  disabled,
}: ParticipationGradeInputProps) {
  const { t } = useTranslation()

  const gradeLabels: Record<number, string> = {
    1: t('participation.grade1'),
    2: t('participation.grade2'),
    3: t('participation.grade3'),
    4: t('participation.grade4'),
    5: t('participation.grade5'),
  }

  const gradeColors: Record<number, string> = {
    1: 'bg-red-500 hover:bg-red-600 border-red-600',
    2: 'bg-orange-500 hover:bg-orange-600 border-orange-600',
    3: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
    4: 'bg-lime-500 hover:bg-lime-600 border-lime-600',
    5: 'bg-green-500 hover:bg-green-600 border-green-600',
  }

  return (
    <div className="flex gap-1.5">
      {grades.map(grade => (
        <button
          key={grade}
          type="button"
          disabled={disabled}
          onClick={() => onChange(grade)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
            value === grade
              ? `${gradeColors[grade]} text-white scale-110`
              : 'border-muted-foreground/30 bg-muted/50 text-muted-foreground hover:border-muted-foreground/50',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          title={gradeLabels[grade]}
          aria-label={`${grade} - ${gradeLabels[grade]}`}
        >
          {grade}
        </button>
      ))}
    </div>
  )
}
