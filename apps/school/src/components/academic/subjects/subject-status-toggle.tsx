import { motion } from 'motion/react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
        'flex items-center space-x-3 px-3 py-1.5 rounded-full transition-colors',
        isActive ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border/40',
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
          'text-xs font-semibold cursor-pointer transition-colors uppercase tracking-wider',
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
