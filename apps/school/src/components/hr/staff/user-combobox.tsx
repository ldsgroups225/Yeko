import {
  IconCheck,
  IconLoader2,
  IconSearch,
  IconSelector,
  IconUser,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getUsers } from '@/school/functions/users'

interface UserComboboxProps {
  id?: string
  value?: string
  onSelect: (userId: string) => void
  placeholder?: string
  disabled?: boolean
}

interface User {
  id: string
  name: string
  email: string
}

export function UserCombobox({
  id,
  value,
  onSelect,
  placeholder,
  disabled,
}: UserComboboxProps) {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { data, isPending } = useQuery({
    queryKey: ['users-for-staff', search],
    queryFn: async () => {
      const result = await getUsers({
        data: {
          filters: { search: search || undefined, status: 'active' },
          pagination: { page: 1, limit: 50 },
        },
      })
      if (!result.success)
        return []
      return result.data.users as User[]
    },
  })

  const users = data ?? []
  const selectedUser = users.find(u => u.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="user-combobox-list"
            disabled={disabled}
            className={cn(
              `
                border-border/40 bg-background/50
                hover:bg-background
                h-11 w-full justify-between rounded-xl font-medium shadow-sm
                transition-all
              `,
              open && 'ring-primary/20 border-primary/50 bg-background ring-2',
            )}
          >
            {selectedUser
              ? (
                  <div className="flex items-center gap-2 truncate">
                    <div className="
                      bg-primary/10 text-primary flex h-6 w-6 items-center
                      justify-center rounded-full
                    "
                    >
                      <IconUser className="h-3 w-3" />
                    </div>
                    <span className="truncate">
                      {selectedUser.name}
                      <span className="
                        text-muted-foreground ml-2 text-xs font-normal
                      "
                      >
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
            <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent
        className="
          bg-popover/90 border-border/40 w-(--radix-popover-trigger-width)
          overflow-hidden rounded-xl p-0 shadow-xl backdrop-blur-2xl
        "
        align="start"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <div className="border-border/40 relative border-b">
            <IconSearch className="
              text-muted-foreground absolute top-1/2 left-3 h-4 w-4
              -translate-y-1/2
            "
            />
            <CommandInput
              placeholder={t.hr.staff.searchUser()}
              value={search}
              onValueChange={setSearch}
              className="
                h-11 border-none bg-transparent py-4 pl-9
                focus:ring-0
              "
            />
          </div>
          <CommandList id="user-combobox-list">
            <AnimatePresence mode="wait">
              {isPending
                ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-8"
                    >
                      <IconLoader2 className="
                        text-primary/60 h-5 w-5 animate-spin
                      "
                      />
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
                        <CommandEmpty className="text-muted-foreground text-sm">
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
                            className="
                              data-[selected=true]:bg-primary/10
                              cursor-pointer rounded-lg px-3 py-3
                              transition-colors
                            "
                          >
                            <div className="flex w-full items-center">
                              <div
                                className={cn(
                                  `
                                    mr-3 flex h-8 w-8 shrink-0 items-center
                                    justify-center rounded-full border
                                    transition-colors
                                  `,
                                  value === user.id
                                    ? `
                                      bg-primary border-primary
                                      text-primary-foreground
                                    `
                                    : `
                                      bg-muted border-border/40
                                      text-muted-foreground
                                      group-hover:bg-primary/10
                                    `,
                                )}
                              >
                                {value === user.id
                                  ? (
                                      <IconCheck className="h-4 w-4" />
                                    )
                                  : (
                                      <IconUser className="h-4 w-4" />
                                    )}
                              </div>
                              <div className="flex flex-1 flex-col truncate">
                                <span className="
                                  text-foreground truncate font-semibold
                                "
                                >
                                  {user.name}
                                </span>
                                <span className="
                                  text-muted-foreground truncate text-xs
                                "
                                >
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
