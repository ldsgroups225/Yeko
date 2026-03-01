import { IconCalendar, IconCheck, IconSelector } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { useState } from 'react'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getSchoolYears } from '@/school/functions/school-years'

export function SchoolYearSwitcher() {
  const t = useTranslations()
  const {
    schoolYearId,
    switchSchoolYear,
    isSwitching,
    isPending: isContextPending,
  }
    = useSchoolYearContext()
  const [open, setOpen] = useState(false)

  const { data: schoolYearsResult, isPending: isPendingYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: async () => await getSchoolYears(),
  })
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []

  const currentYear = schoolYears?.find(
    sy => sy.id === schoolYearId,
  )

  const handleSelect = (yearId: string) => {
    if (yearId !== schoolYearId) {
      switchSchoolYear(yearId)
    }
    setOpen(false)
  }

  if (isPendingYears || isContextPending) {
    return (
      <div className="
        border-input bg-background flex h-9 w-[156px] items-center gap-2
        rounded-md border px-3
      "
      >
        <IconCalendar className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground text-sm">
          {t.common.loading()}
        </span>
      </div>
    )
  }

  if (!schoolYears || schoolYears.length === 0) {
    return (
      <div className="
        border-input bg-background flex h-9 w-[156px] items-center gap-2
        rounded-md border px-3
      "
      >
        <IconCalendar className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground text-xs">
          {t.schoolYear.noYears()}
        </span>
      </div>
    )
  }

  const listboxId = 'school-year-listbox'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(
          <Button
            variant="outline"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            disabled={isSwitching}
            className="h-9 w-[156px] justify-between"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <IconCalendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="truncate text-sm">
                {currentYear?.template?.name || t.schoolYear.select()}
              </span>
            </div>
            <IconSelector className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList id={listboxId}>
            <CommandEmpty>{t.schoolYear.noYears()}</CommandEmpty>
            <CommandGroup>
              {schoolYears.map(year => (
                <CommandItem
                  key={year.id}
                  value={year.id}
                  onSelect={() => handleSelect(year.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>{year.template?.name}</span>
                    {year.isActive && (
                      <span className="
                        rounded-sm bg-green-500/20 px-1.5 py-0.5 text-xs
                        text-green-600
                      "
                      >
                        {t.schoolYear.active()}
                      </span>
                    )}
                  </div>
                  <IconCheck
                    className={cn(
                      'h-4 w-4',
                      schoolYearId === year.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
