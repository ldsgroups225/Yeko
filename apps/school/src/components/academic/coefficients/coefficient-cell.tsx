import { IconCheck, IconRotate, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()
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
      <PopoverTrigger
        render={(
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className={cn(
              'w-full h-9 rounded-lg border font-medium transition-all relative overflow-hidden group',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 focus:ring-offset-background',
              isEdited
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                : isOverride
                  ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                  : 'border-border/60 bg-white/5 hover:border-primary/40 hover:bg-white/10 text-muted-foreground hover:text-foreground',
            )}
          >
            {effectiveWeight}
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      />
      <PopoverContent
        className="w-72 p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
        align="center"
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t.academic.coefficients.cell.edit()}
            </h4>
            <div className="grid gap-2 p-3 rounded-lg bg-white/5 border border-white/5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t.academic.coefficients.cell.template()}
                </span>
                <span className="font-mono font-bold">{templateWeight}</span>
              </div>
              {isOverride && (
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-muted-foreground">
                    {t.academic.coefficients.cell.currentOverride()}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {effectiveWeight}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="coefficient-input"
              className="text-xs font-medium text-muted-foreground pl-1"
            >
              {t.academic.coefficients.cell.newValue()}
            </label>
            <Input
              id="coefficient-input"
              type="number"
              min="0"
              max="20"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="h-10 bg-white/5 border-white/10 focus:ring-primary/40 text-center font-mono text-lg font-bold"
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

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-9 hover:bg-white/10"
              onClick={handleCancel}
            >
              <IconX className="mr-1.5 h-3.5 w-3.5" />
              {t.academic.coefficients.cell.cancel()}
            </Button>
            <div className="flex gap-1 flex-1">
              {isOverride && overrideId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2 border-border/40"
                  onClick={handleReset}
                  title={t.academic.coefficients.cell.reset()}
                >
                  <IconRotate className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 h-9 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={handleSave}
              >
                <IconCheck className="mr-1.5 h-3.5 w-3.5" />
                {t.academic.coefficients.cell.save()}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
