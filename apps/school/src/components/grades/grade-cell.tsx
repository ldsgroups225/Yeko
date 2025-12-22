import type { GradeStatus } from '@/schemas/grade'
import { AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  draft: 'bg-background/50 border-border/40 focus:bg-background',
  submitted: 'bg-blue-500/5 border-blue-500/20 text-blue-600',
  validated: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
  rejected: 'bg-destructive/5 border-destructive/20 text-destructive',
}

function getValueColor(value: number | null): string {
  if (value === null)
    return ''
  if (value >= 16)
    return 'text-emerald-600 font-bold'
  if (value >= 14)
    return 'text-indigo-600 font-bold'
  if (value >= 10)
    return 'text-foreground font-semibold'
  return 'text-destructive font-bold'
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
  const [editingValue, setEditingValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditing = editingValue !== null
  const displayValue = isEditing ? editingValue : value?.toString() ?? ''

  const validateAndUpdate = useCallback(
    (inputValue: string) => {
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

      if ((numValue * 4) % 1 !== 0) {
        setError(t.academic.grades.errors.invalidGrade())
        return
      }

      setError(null)
      onChange(numValue)
    },
    [onChange, t],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value)
  }

  const handleFocus = () => {
    setEditingValue(value?.toString() ?? '')
  }

  const handleBlur = () => {
    if (editingValue !== null) {
      validateAndUpdate(editingValue)
    }
    setEditingValue(null)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentRow = inputRef.current?.closest('tr')

    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (editingValue !== null) {
        validateAndUpdate(editingValue)
      }
      const nextInput
        = currentRow?.nextElementSibling?.querySelector('input[type="text"]')
      if (nextInput instanceof HTMLInputElement) {
        nextInput.focus()
        // nextInput.select() is handled by onFocus
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (editingValue !== null) {
        validateAndUpdate(editingValue)
      }
      const prevInput
        = currentRow?.previousElementSibling?.querySelector(
          'input[type="text"]',
        )
      if (prevInput instanceof HTMLInputElement) {
        prevInput.focus()
        // prevInput.select() is handled by onFocus
      }
    }

    if (e.key === 'Tab') {
      if (editingValue !== null) {
        validateAndUpdate(editingValue)
      }
    }

    if (e.key === 'Escape') {
      setEditingValue(null)
      setError(null)
      inputRef.current?.blur()
    }
  }

  const isEditable = !disabled && (status === 'draft' || status === 'rejected')

  const cell = (
    <div className={cn('relative group', className)}>
      <motion.div
        animate={isEditing ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={!isEditable}
          className={cn(
            'h-10 w-20 text-center font-mono text-sm transition-all focus-visible:ring-primary/30 rounded-lg shadow-sm',
            statusStyles[status],
            !isEditing && getValueColor(value),
            error && 'border-destructive focus-visible:ring-destructive/30',
            !isEditable
            && 'cursor-not-allowed opacity-80 backdrop-blur-none bg-muted/30',
          )}
          aria-label={t.ui.grade()}
          aria-invalid={!!error}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -bottom-6 left-0 z-50 pointer-events-none"
          >
            <div className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-white/10 uppercase tracking-tight whitespace-nowrap">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'rejected' && !isEditing && !error && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground border-2 border-background flex items-center justify-center shadow-lg">
          <AlertCircle className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  )

  if (status === 'rejected' && rejectionReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cell}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs rounded-xl backdrop-blur-xl bg-destructive/90 text-destructive-foreground border-none p-4 shadow-xl"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider">
                  {t.academic.grades.validations.rejectReason()}
                </p>
                <p className="text-sm leading-relaxed">{rejectionReason}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return cell
}
