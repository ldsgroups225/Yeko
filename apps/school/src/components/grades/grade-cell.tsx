import type { GradeStatus } from '@/schemas/grade'
import { useCallback, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface GradeCellProps {
  value: number | null
  status: GradeStatus
  onChange: (value: number) => void
  onBlur?: () => void
  disabled?: boolean
  rejectionReason?: string
  className?: string
}

const statusStyles: Record<GradeStatus, string> = {
  draft: 'bg-background border-input',
  submitted: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
  validated: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
  rejected: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
}

function getValueColor(value: number | null): string {
  if (value === null)
    return ''
  if (value >= 16)
    return 'text-green-600 dark:text-green-400'
  if (value >= 14)
    return 'text-emerald-600 dark:text-emerald-400'
  if (value >= 10)
    return 'text-foreground'
  return 'text-red-600 dark:text-red-400'
}

export function GradeCell({
  value,
  status,
  onChange,
  onBlur,
  disabled,
  rejectionReason,
  className,
}: GradeCellProps) {
  const t = useTranslations()
  // Use value as initial state - component should be keyed by studentId for proper reset
  const [localValue, setLocalValue] = useState(() => value?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndUpdate = useCallback((inputValue: string) => {
    if (inputValue === '') {
      setError(null)
      return
    }

    const numValue = Number.parseFloat(inputValue)

    if (Number.isNaN(numValue)) {
      setError(t.academic.grades.errors.invalidGrade())
      return
    }

    if (numValue < 0 || numValue > 20) {
      setError(t.academic.grades.errors.invalidGrade())
      return
    }

    // Check quarter points
    if ((numValue * 4) % 1 !== 0) {
      setError(t.academic.grades.errors.invalidGrade())
      return
    }

    setError(null)
    onChange(numValue)
  }, [onChange, t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
  }

  const handleBlur = () => {
    validateAndUpdate(localValue)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRow = inputRef.current?.closest('tr')

    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      validateAndUpdate(localValue)
      // Move to next row
      const nextInput = currentRow?.nextElementSibling?.querySelector('input[type="text"]')
      if (nextInput instanceof HTMLInputElement) {
        nextInput.focus()
        nextInput.select()
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      validateAndUpdate(localValue)
      // Move to previous row
      const prevInput = currentRow?.previousElementSibling?.querySelector('input[type="text"]')
      if (prevInput instanceof HTMLInputElement) {
        prevInput.focus()
        prevInput.select()
      }
    }

    if (e.key === 'Tab') {
      validateAndUpdate(localValue)
    }

    if (e.key === 'Escape') {
      // Reset to original value
      setLocalValue(value?.toString() ?? '')
      setError(null)
      inputRef.current?.blur()
    }
  }

  const isEditable = !disabled && (status === 'draft' || status === 'rejected')

  const cell = (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={!isEditable}
        className={cn(
          'h-9 w-16 text-center font-mono text-sm',
          statusStyles[status],
          getValueColor(value),
          error && 'border-red-500 focus-visible:ring-red-500',
        )}
        aria-label={t.ui.grade()}
        aria-invalid={!!error}
      />
      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )

  if (status === 'rejected' && rejectionReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cell}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm font-medium">
            {t.academic.grades.validations.rejectReason()}
            :
          </p>
          <p className="text-sm text-muted-foreground">{rejectionReason}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return cell
}
