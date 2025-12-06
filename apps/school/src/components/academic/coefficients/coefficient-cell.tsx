import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface CoefficientCellProps {
  templateId: string
  templateWeight: number
  effectiveWeight: number
  isOverride: boolean
  overrideId: string | null
  isEdited: boolean
  onEdit: (value: number) => void
  onReset: () => void
}

export function CoefficientCell({
  templateWeight,
  effectiveWeight,
  isOverride,
  overrideId,
  isEdited,
  onEdit,
  onReset,
}: CoefficientCellProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(effectiveWeight.toString())

  const handleSave = () => {
    const value = Number.parseInt(inputValue, 10)
    if (Number.isNaN(value) || value < 0 || value > 20) {
      return
    }
    onEdit(value)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setInputValue(effectiveWeight.toString())
    setIsOpen(false)
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full h-10 rounded-md border-2 font-medium transition-all hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            isEdited && 'border-amber-500 bg-amber-500/10',
            isOverride && !isEdited && 'border-primary bg-primary/10',
            !isOverride && !isEdited && 'border-border',
          )}
        >
          {effectiveWeight}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="center">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('academic.coefficients.cell.edit')}
            </h4>
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('academic.coefficients.cell.template')}
                </span>
                <span className="font-medium">{templateWeight}</span>
              </div>
              {isOverride && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t('academic.coefficients.cell.currentOverride')}
                  </span>
                  <span className="font-medium text-primary">
                    {effectiveWeight}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="coefficient-input"
              className="text-sm font-medium"
            >
              {t('academic.coefficients.cell.newValue')}
            </label>
            <Input
              id="coefficient-input"
              type="number"
              min="0"
              max="20"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave()
                }
                else if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              <X className="mr-1 h-3 w-3" />
              {t('academic.coefficients.cell.cancel')}
            </Button>
            {isOverride && overrideId && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                {t('academic.coefficients.cell.reset')}
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
            >
              <Check className="mr-1 h-3 w-3" />
              {t('academic.coefficients.cell.save')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
