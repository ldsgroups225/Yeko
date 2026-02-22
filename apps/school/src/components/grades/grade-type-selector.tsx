import type { GradeType } from '@/schemas/grade'
import { IconBriefcase, IconFileText, IconHelpCircle, IconHome, IconSchool, IconUserCheck } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'
import { gradeTypeLabels, gradeTypes } from '@/schemas/grade'

interface GradeTypeSelectorProps {
  value: GradeType
  onValueChange: (value: GradeType) => void
  disabled?: boolean
  className?: string
}

const gradeTypeIcons: Record<GradeType, React.ElementType> = {
  quiz: IconHelpCircle,
  test: IconFileText,
  exam: IconSchool,
  participation: IconUserCheck,
  homework: IconHome,
  project: IconBriefcase,
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
      onValueChange={val => val && onValueChange(val as GradeType)}
      disabled={disabled}
    >
      <SelectTrigger className={`rounded-xl h-11 w-full border-border/40 bg-background/50 focus:bg-background transition-all ${className || ''}`}>
        <SelectValue placeholder={t.academic.grades.entry.selectGradeType()}>
          {value
            ? (() => {
                const Icon = gradeTypeIcons[value]
                return Icon
                  ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">{gradeTypeLabels[value]}</span>
                      </div>
                    )
                  : null
              })()
            : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
        {gradeTypes.map((type) => {
          const Icon = gradeTypeIcons[type]
          return (
            <SelectItem key={type} value={type} className="rounded-lg py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">{gradeTypeLabels[type]}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
