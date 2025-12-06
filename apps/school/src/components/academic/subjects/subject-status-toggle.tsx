import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  const isActive = status === 'active'

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Switch
        id="subject-status"
        checked={isActive}
        onCheckedChange={checked => onToggle(checked ? 'active' : 'inactive')}
        disabled={disabled}
        className={cn(
          isActive && 'data-[state=checked]:bg-green-500',
        )}
      />
      <Label
        htmlFor="subject-status"
        className={cn(
          'text-sm cursor-pointer transition-colors',
          isActive ? 'text-green-600' : 'text-muted-foreground',
        )}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Label>
    </div>
  )
}
