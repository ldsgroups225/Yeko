import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon, Loader2, Search, User as UserIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
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
          className={cn(
            'w-full justify-between font-medium rounded-xl h-11 border-border/40 bg-background/50 hover:bg-background transition-all shadow-sm',
            open && 'ring-2 ring-primary/20 border-primary/50 bg-background',
          )}
        >
          {selectedUser
            ? (
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="h-3 w-3" />
                  </div>
                  <span className="truncate">
                    {selectedUser.name}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      {selectedUser.email}
                    </span>
                  </span>
                </div>
              )
            : (
                <span className="text-muted-foreground font-normal">
                  {placeholder || t.hr.staff.selectUser()}
                </span>
              )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40 shadow-xl overflow-hidden" align="start">
        <Command shouldFilter={false} className="bg-transparent">
          <div className="relative border-b border-border/40">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <CommandInput
              placeholder={t.hr.staff.searchUser()}
              value={search}
              onValueChange={setSearch}
              className="border-none focus:ring-0 pl-9 py-4 h-11 bg-transparent"
            />
          </div>
          <CommandList id="user-combobox-list">
            <AnimatePresence mode="wait">
              {isLoading
                ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-8"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
                    </motion.div>
                  )
                : users.length === 0
                  ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-10 text-center"
                      >
                        <CommandEmpty className="text-sm text-muted-foreground">
                          {t.hr.staff.noUsersFound()}
                        </CommandEmpty>
                      </motion.div>
                    )
                  : (
                      <CommandGroup className="p-2">
                        {users.map(user => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              onSelect(user.id)
                              setOpen(false)
                            }}
                            className="rounded-lg py-3 px-3 cursor-pointer data-[selected=true]:bg-primary/10 transition-colors"
                          >
                            <div className="flex items-center w-full">
                              <div className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mr-3 border transition-colors',
                                value === user.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border/40 text-muted-foreground group-hover:bg-primary/10',
                              )}
                              >
                                {value === user.id
                                  ? (
                                      <CheckIcon className="h-4 w-4" />
                                    )
                                  : (
                                      <UserIcon className="h-4 w-4" />
                                    )}
                              </div>
                              <div className="flex flex-col flex-1 truncate">
                                <span className="font-semibold text-foreground truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
            </AnimatePresence>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
