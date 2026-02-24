import { Badge } from '@workspace/ui/components/badge'
import { useTranslations } from '@/i18n'

/* eslint-disable react-refresh/only-export-components */
export const statusColors = {
  active: 'bg-success/10 text-success dark:bg-success/20 dark:text-success/80',
  graduated: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary/80',
  transferred: 'bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground/80',
  withdrawn: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80',
}

export function useStudentStatus() {
  const t = useTranslations()

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'active': return t.students.statusActive()
      case 'graduated': return t.students.statusGraduated()
      case 'transferred': return t.students.statusTransferred()
      case 'withdrawn': return t.students.statusWithdrawn()
      default: return value
    }
  }

  return { getStatusLabel }
}

interface StudentStatusBadgeProps {
  status: string
  className?: string
}

export function StudentStatusBadge({ status, className }: StudentStatusBadgeProps) {
  const { getStatusLabel } = useStudentStatus()
  const colorClass = statusColors[status as keyof typeof statusColors] || ''

  return (
    <Badge className={`${colorClass} border-0 shadow-none ${className}`}>
      {getStatusLabel(status)}
    </Badge>
  )
}
