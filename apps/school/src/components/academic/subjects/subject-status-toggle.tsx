import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface SubjectStatusToggleProps {
  status: 'active' | 'inactive'
  onToggle: (status: 'active' | 'inactive') => void
  disabled?: boolean
  className?: string
}

export function SubjectStatusToggle({
  status,
  onToggle,
  disabled = false,
  className,
}: SubjectStatusToggleProps) {
  const t = useTranslations()
  const isActive = status === 'active'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center space-x-3 rounded-full px-3 py-1.5 transition-colors',
        isActive
          ? 'bg-primary/10 border-primary/20 border'
          : `bg-muted/50 border-border/40 border`,
        className,
      )}
    >
      <Switch
        id="subject-status"
        checked={isActive}
        onCheckedChange={checked => onToggle(checked ? 'active' : 'inactive')}
        disabled={disabled}
        className={cn(
          'data-[state=checked]:bg-primary',
        )}
      />
      <Label
        htmlFor="subject-status"
        className={cn(
          `
            cursor-pointer text-xs font-semibold tracking-wider uppercase
            transition-colors
          `,
          isActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {isActive
          ? t.academic.subjects.status.active()
          : t.academic.subjects.status.inactive()}
      </Label>
    </motion.div>
  )
}
