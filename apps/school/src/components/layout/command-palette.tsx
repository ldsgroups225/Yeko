import {
  IconBook,
  IconBuilding,
  IconCalendar,
  IconCreditCard,
  IconLayoutDashboard,
  IconSchool,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@workspace/ui/components/command'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '@/hooks/use-search'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const { query, setQuery, results, isPending } = useSearch()

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={`${t('common.search')}...`}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{t('common.noResults')}</CommandEmpty>

        {query.length > 0 && (
          <CommandGroup heading={t('students.title')}>
            {isPending
              ? (
                  <CommandItem disabled>{t('common.loading')}</CommandItem>
                )
              : (
                  results.students.map(item => (
                    <CommandItem
                      key={item.student.id}
                      onSelect={() =>
                        runCommand(() =>
                          navigate({
                            to: '/students/$studentId',
                            params: { studentId: item.student.id },
                          }),
                        )}
                    >
                      <IconUser className="mr-2 h-4 w-4" />
                      <span>
                        {item.student.firstName}
                        {' '}
                        {item.student.lastName}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        (
                        {item.student.matricule}
                        )
                      </span>
                      {item.currentClass && (
                        <span className="text-muted-foreground ml-auto text-xs">
                          {item.currentClass.gradeName}
                          {' '}
                          {item.currentClass.section}
                        </span>
                      )}
                    </CommandItem>
                  ))
                )}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading={t('nav.spaces')}>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: '/dashboard' }))}
          >
            <IconLayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('nav.dashboard')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                navigate({ to: '/students', search: { page: 1 } }),
              )}
          >
            <IconSchool className="mr-2 h-4 w-4" />
            <span>{t('nav.students')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: '/classes' }))}
          >
            <IconBook className="mr-2 h-4 w-4" />
            <span>{t('nav.classes')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: '/accounting' }))}
          >
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>{t('nav.accounting')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('nav.settings')}>
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate({ to: '/settings/profile' }))}
          >
            <IconBuilding className="mr-2 h-4 w-4" />
            <span>{t('school.profile')}</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate({ to: '/settings/school-years' }))}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            <span>{t('nav.schoolYears')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: '/settings' }))}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            <span>{t('nav.settings')}</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
