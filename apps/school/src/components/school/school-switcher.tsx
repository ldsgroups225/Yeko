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
      <div className="
        border-input bg-background flex h-10 w-[200px] items-center gap-2
        rounded-md border px-3
      "
      >
        <IconBuilding className="text-muted-foreground h-4 w-4 animate-pulse" />
        <span className="text-muted-foreground text-sm">{t.school.switcher.loading()}</span>
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className="
        border-input bg-background flex h-10 w-[200px] items-center gap-2
        rounded-md border px-3
      "
      >
        <IconBuilding className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground text-sm">{t.school.switcher.noSchools()}</span>
      </div>
    )
  }

  // If only one school, show as a non-interactive element
  if (schools.length === 1) {
    return (
      <div className="
        border-input bg-muted/30 flex h-10 w-[200px] cursor-default items-center
        gap-2 rounded-md border px-3 opacity-90
      "
      >
        <IconBuilding className="text-muted-foreground h-4 w-4 shrink-0" />
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
              `
                border-input bg-background ring-offset-background flex h-10
                w-[200px] items-center justify-between gap-2 rounded-md border
                px-3 text-sm transition-all outline-none
              `,
              `
                hover:bg-accent hover:text-accent-foreground
                focus:bg-accent focus:text-accent-foreground
              `,
              `
                data-[state=open]:bg-accent
                data-[state=open]:text-accent-foreground
              `,
              'disabled:pointer-events-none disabled:opacity-50',
              props.className,
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <IconBuilding className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="truncate font-medium">{currentSchool?.name || t.common.select()}</span>
            </div>
            <IconSelector className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        )}
      />
      <DropdownMenuContent className="w-[200px]" align="start" sideOffset={8}>
        <DropdownMenuLabel className="
          text-muted-foreground/70 text-xs font-semibold tracking-wider
          uppercase
        "
        >
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
            className="flex cursor-pointer items-center justify-between py-2"
          >
            <span className={cn('truncate', school.id === schoolId && `
              text-primary font-semibold
            `)}
            >
              {school.name}
            </span>
            {school.id === schoolId && (
              <IconCheck className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
