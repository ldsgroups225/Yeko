import { useQuery } from '@tanstack/react-query'
import { Building2, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSchoolContext } from '@/hooks/use-school-context'
import { cn } from '@/lib/utils'
import { getUserSchools } from '@/school/functions/school-context'

export function SchoolSwitcher() {
  const { t } = useTranslation()
  const { schoolId, isSwitching } = useSchoolContext()

  const { data: schools, isLoading } = useQuery({
    queryKey: ['user-schools'],
    queryFn: async () => await getUserSchools(),
  })

  const currentSchool = schools?.find((school: { id: string }) => school.id === schoolId)

  if (isLoading) {
    return (
      <div className="flex h-10 w-[200px] items-center gap-2 rounded-md border border-input bg-background px-3">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
      </div>
    )
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="flex h-10 w-[200px] items-center gap-2 rounded-md border border-input bg-background px-3">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t('common.noSchool')}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={isSwitching}
        className={cn(
          'flex h-10 w-[200px] items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{currentSchool?.name || t('common.select')}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* TODO: Add dropdown menu with school list */}
      {/* For now, this is a placeholder. Will be implemented with Radix UI Select */}
    </div>
  )
}
