import { IconBuilding, IconCheck, IconSelector } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getUserSchools } from '@/school/functions/school-context'

export function SchoolSwitcher() {
  const t = useTranslations()
  const { schoolId, isSwitching, switchSchool } = useSchoolContext()

  const { data: result, isPending } = useQuery({
    queryKey: ['user-schools'],
    queryFn: async () => await getUserSchools(),
  })

  /* Safe unwrapping of schools Result */
  const schools = result?.success ? result.data : []

  const currentSchool = schools.length > 0
    ? schools.find(school => school.id === schoolId)
    : null

  if (isPending) {
    return (
      <div className="flex h-10 w-[200px] items-center gap-2 rounded-md border border-input bg-background px-3">
        <IconBuilding className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">{t.school.switcher.loading()}</span>
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className="flex h-10 w-[200px] items-center gap-2 rounded-md border border-input bg-background px-3">
        <IconBuilding className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t.school.switcher.noSchools()}</span>
      </div>
    )
  }

  // If only one school, show as a non-interactive element
  if (schools.length === 1) {
    return (
      <div className="flex h-10 w-[200px] items-center gap-2 rounded-md border border-input bg-muted/30 px-3 opacity-90 cursor-default">
        <IconBuilding className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{currentSchool?.name || t.common.select()}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={props => (
          <button
            {...props}
            type="button"
            disabled={isSwitching}
            className={cn(
              'flex h-10 w-[200px] items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all outline-none',
              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
              'disabled:pointer-events-none disabled:opacity-50',
              props.className,
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <IconBuilding className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{currentSchool?.name || t.common.select()}</span>
            </div>
            <IconSelector className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        )}
      />
      <DropdownMenuContent className="w-[200px]" align="start" sideOffset={8}>
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t.school.switcher.title()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schools.map(school => (
          <DropdownMenuItem
            key={school.id}
            onSelect={() => {
              if (school.id !== schoolId) {
                switchSchool(school.id)
              }
            }}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <span className={cn('truncate', school.id === schoolId && 'font-semibold text-primary')}>
              {school.name}
            </span>
            {school.id === schoolId && <IconCheck className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
