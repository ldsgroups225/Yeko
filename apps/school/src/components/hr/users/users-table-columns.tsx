import type { ColumnDef } from '@tanstack/react-table'
import { formatDate, formatPhone } from '@repo/data-ops'
import {
  IconCalendar,
  IconDots,
  IconEdit,
  IconMail,
  IconPhone,
  IconTrash,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'

export interface IconUser {
  id: string
  name: string
  email: string
  phone: string | null
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: Date | null
  roles: string[]
}

interface UseUsersTableColumnsProps {
  setUserToDelete: (user: IconUser) => void
}

export function useUsersTableColumns({
  setUserToDelete,
}: UseUsersTableColumnsProps) {
  const t = useTranslations()
  const navigate = useNavigate()

  return useMemo<ColumnDef<IconUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t.hr.users.name(),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {row.original.name}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <IconMail className="h-3 w-3" />
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: t.hr.users.phone(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {row.original.phone
              ? (
                  <>
                    <IconPhone className="h-3.5 w-3.5" />
                    {formatPhone(row.original.phone)}
                  </>
                )
              : (
                  '-'
                )}
          </div>
        ),
      },
      {
        accessorKey: 'roles',
        header: t.hr.users.roles(),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {row.original.roles.map(role => (
              <Badge
                key={role}
                variant="outline"
                className="bg-primary/5 border-primary/10 text-primary text-[10px] font-medium px-2 py-0"
              >
                {role}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t.hr.users.status(),
        cell: ({ row }) => {
          const status = row.original.status
          const variants = {
            active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
            suspended:
              'bg-destructive/10 text-destructive border-destructive/20',
          } as const
          return (
            <Badge
              variant="outline"
              className={`rounded-full border ${variants[status]} transition-colors`}
            >
              {{
                active: t.hr.status.active,
                inactive: t.hr.status.inactive,
                suspended: t.hr.status.suspended,
              }[status]()}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'lastLoginAt',
        header: t.hr.users.lastLogin(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="h-3.5 w-3.5" />
            {row.original.lastLoginAt
              ? formatDate(new Date(row.original.lastLoginAt), 'SHORT', 'fr')
              : t.hr.users.neverLoggedIn()}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]"
            >
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() =>
                  navigate({ to: `/users/users/${row.original.id}/edit` })}
              >
                <IconEdit className="h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setUserToDelete(row.original)}
              >
                <IconTrash className="h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate, setUserToDelete],
  )
}
