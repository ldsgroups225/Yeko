import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getUsers } from '@/school/functions/users'

interface User {
  id: string
  name: string
  email: string
}

interface UserComboboxProps {
  value?: string
  onSelect: (userId: string) => void
  placeholder?: string
  disabled?: boolean
}

export function UserCombobox({
  value,
  onSelect,
  placeholder,
  disabled,
}: UserComboboxProps) {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users-for-staff', search],
    queryFn: async () => {
      const result = await getUsers({
        data: {
          filters: { search: search || undefined, status: 'active' },
          pagination: { page: 1, limit: 50 },
        },
      })
      return result.users as User[]
    },
  })

  const users = data ?? []
  const selectedUser = users.find(u => u.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls="user-combobox-list"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedUser
            ? (
                <span className="truncate">
                  {selectedUser.name}
                  <span className="ml-2 text-muted-foreground">
                    (
                    {selectedUser.email}
                    )
                  </span>
                </span>
              )
            : (
                <span className="text-muted-foreground">
                  {placeholder || t.hr.staff.selectUser()}
                </span>
              )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t.hr.staff.searchUser()}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList id="user-combobox-list">
            {isLoading
              ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )
              : users.length === 0
                ? (
                    <CommandEmpty>{t.hr.staff.noUsersFound()}</CommandEmpty>
                  )
                : (
                    <CommandGroup>
                      {users.map(user => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => {
                            onSelect(user.id)
                            setOpen(false)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === user.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
