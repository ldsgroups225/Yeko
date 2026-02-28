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
              `
                group relative h-9 w-full overflow-hidden rounded-lg border
                font-medium transition-all
              `,
              `
                focus:ring-primary/20 focus:ring-offset-background focus:ring-2
                focus:ring-offset-1 focus:outline-none
              `,
              isEdited
                ? `
                  border-accent/50 bg-accent/10 text-accent
                  hover:bg-accent/20
                `
                : isOverride
                  ? `
                    border-primary/50 bg-primary/10 text-primary
                    hover:bg-primary/20
                  `
                  : `
                    border-border/60
                    hover:border-primary/40
                    text-muted-foreground
                    hover:text-foreground
                    bg-white/5
                    hover:bg-white/10
                  `,
            )}
          >
            {effectiveWeight}
            <div className="
              from-background/10 absolute inset-0 bg-linear-to-br to-transparent
              opacity-0 transition-opacity
              group-hover:opacity-100
            "
            />
          </motion.button>
        )}
      />
      <PopoverContent
        className="
          border-border/40 bg-card/95 w-72 overflow-hidden p-0 shadow-2xl
          backdrop-blur-xl
        "
        align="center"
        sideOffset={8}
      >
        <div className="space-y-4 p-4">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              {t.academic.coefficients.cell.edit()}
            </h4>
            <div className="
              border-border/5 grid gap-2 rounded-lg border bg-white/5 p-3
              text-[11px]
            "
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t.academic.coefficients.cell.template()}
                </span>
                <span className="font-mono font-bold">{templateWeight}</span>
              </div>
              {isOverride && (
                <div className="
                  border-border/5 flex items-center justify-between border-t
                  pt-2
                "
                >
                  <span className="text-muted-foreground">
                    {t.academic.coefficients.cell.currentOverride()}
                  </span>
                  <span className="text-primary font-mono font-bold">
                    {effectiveWeight}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="coefficient-input"
              className="text-muted-foreground pl-1 text-xs font-medium"
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
              className="
                border-border/10
                focus:ring-primary/40
                h-10 bg-white/5 text-center font-mono text-lg font-bold
              "
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
              className="
                h-9 flex-1
                hover:bg-white/10
              "
              onClick={handleCancel}
            >
              <IconX className="mr-1.5 h-3.5 w-3.5" />
              {t.academic.coefficients.cell.cancel()}
            </Button>
            <div className="flex flex-1 gap-1">
              {isOverride && overrideId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border/40 h-9 px-2"
                  onClick={handleReset}
                  title={t.academic.coefficients.cell.reset()}
                >
                  <IconRotate className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                className="
                  bg-primary
                  hover:bg-primary/90
                  shadow-primary/20 h-9 flex-1 shadow-lg
                "
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
