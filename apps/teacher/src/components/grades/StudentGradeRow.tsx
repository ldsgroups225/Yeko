import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { useCallback, useState } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

// ============================================================================
// Types
// ============================================================================

export interface StudentGradeRowProps {
  studentId: string
  studentName: string
  initials: string
  email?: string
  totalPoints: number
  currentGrade?: string
  onGradeChange: (studentId: string, value: string) => void
  disabled?: boolean
}

// ============================================================================
// StudentGradeRow Component
// ============================================================================

export function StudentGradeRow({
  studentId,
  studentName,
  initials,
  email,
  totalPoints,
  currentGrade = '',
  onGradeChange,
  disabled = false,
}: StudentGradeRowProps) {
  const { LL } = useI18nContext()
  const [localValue, setLocalValue] = useState(currentGrade)
  const [isFocused, setIsFocused] = useState(false)

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      // Allow empty string or valid numeric values
      if (value === '' || /^\d*(?:\.\d*)?$/.test(value)) {
        const numValue = Number.parseFloat(value)

        // Validate range (0 to totalPoints)
        if (value === '' || (numValue >= 0 && numValue <= totalPoints)) {
          setLocalValue(value)
        }
      }
    },
    [totalPoints],
  )

  // Handle blur - save the value
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    if (localValue !== currentGrade) {
      onGradeChange(studentId, localValue)
    }
  }, [localValue, currentGrade, onGradeChange, studentId])

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  // Calculate grade color based on percentage
  const gradePercentage = localValue
    ? (Number.parseFloat(localValue) / totalPoints) * 100
    : null

  const getGradeColorClass = () => {
    if (gradePercentage === null)
      return ''
    if (gradePercentage >= 80)
      return 'text-green-600 dark:text-green-400'
    if (gradePercentage >= 60)
      return 'text-emerald-600 dark:text-emerald-400'
    if (gradePercentage >= 50)
      return 'text-yellow-600 dark:text-yellow-400'
    if (gradePercentage >= 40)
      return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-3 transition-all duration-200',
        isFocused && 'border-primary ring-1 ring-primary/20',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {/* Student Info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-sm">
          {initials}
        </div>
        <div>
          <p className="font-medium text-sm">{studentName}</p>
          {email && (
            <p className="text-muted-foreground text-xs">{email}</p>
          )}
        </div>
      </div>

      {/* Grade Input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min="0"
          max={totalPoints}
          step="0.5"
          placeholder={LL.common.notAvailable()}
          className={cn(
            'w-20 text-center font-medium',
            getGradeColorClass(),
          )}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
        />
        <span className="text-muted-foreground text-sm font-medium">
          /
          {' '}
          {totalPoints}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// StudentGradeList Component
// ============================================================================

export interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export interface StudentGradeListProps {
  students: Student[]
  grades: Map<string, string>
  totalPoints: number
  onGradeChange: (studentId: string, value: string) => void
  disabled?: boolean
  emptyMessage?: string
}

export function StudentGradeList({
  students,
  grades,
  totalPoints,
  onGradeChange,
  disabled = false,
  emptyMessage,
}: StudentGradeListProps) {
  const { LL } = useI18nContext()
  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage || LL.grades.noStudents()}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {students.map((student) => {
        const initials
          = `${student.firstName?.[0]?.toUpperCase() || '?'}${student.lastName?.[0]?.toUpperCase() || '?'}`
        const studentName = `${student.firstName} ${student.lastName}`
        const currentGrade = grades.get(student.id) ?? ''

        return (
          <StudentGradeRow
            key={student.id}
            studentId={student.id}
            studentName={studentName}
            initials={initials}
            email={student.email}
            totalPoints={totalPoints}
            currentGrade={currentGrade}
            onGradeChange={onGradeChange}
            disabled={disabled}
          />
        )
      })}
    </div>
  )
}
