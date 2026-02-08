import type { ColumnDef } from '@tanstack/react-table'
import {
  IconCalendar,
  IconDots,
  IconEdit,
  IconLoader2,
  IconMail,
  IconPhone,
  IconSearch,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/hr/empty-state'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteExistingUser, getUsers } from '@/school/functions/users'
import { formatDate } from '@/utils/formatDate'
import { formatPhone } from '@/utils/formatPhone'

interface IconUser {
  id: string
  name: string
  email: string
  phone: string | null
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: Date | null
  roles: string[]
}

interface UsersTableProps {
  filters: {
    page?: number
    search?: string
    roleId?: string
    status?: 'active' | 'inactive' | 'suspended'
  }
}

export function UsersTable({ filters }: UsersTableProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [userToDelete, setUserToDelete] = useState<IconUser | null>(null)
  const debouncedSearch = useDebounce(searchInput, 500)

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.users.delete,
    mutationFn: (userId: string) => deleteExistingUser({ data: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t.hr.users.deleteSuccess())
      setUserToDelete(null)
    },
    onError: () => {
      toast.error(t.hr.users.deleteError())
    },
  })

  const { data, isPending } = useQuery({
    queryKey: ['users', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getUsers({
        data: {
          filters: {
            search: debouncedSearch,
            roleId: filters.roleId,
            status: filters.status,
          },
          pagination: {
            page: filters.page || 1,
            limit: 20,
          },
        },
      })
      return result
    },
  })

  const columns = useMemo<ColumnDef<IconUser>[]>(
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
    [t, navigate],
  )

  const usersData = data?.success ? data.data : undefined

  const table = useReactTable({
    data: usersData?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: usersData?.totalPages || 0,
  })

  if (isPending) {
    return <TableSkeleton columns={6} rows={5} />
  }

  const hasNoData = !usersData?.users || usersData.users.length === 0
  const hasNoResults
    = hasNoData && (debouncedSearch || filters.roleId || filters.status)

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-serif">
              {t.hr.users.listTitle()}
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.hr.users.searchPlaceholder()}
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)}
                className="pl-10 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          {hasNoData && !hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconUsers}
                title={t.hr.users.noUsers()}
                description={t.hr.users.noUsersDescription()}
                action={{
                  label: t.hr.users.addUser(),
                  onClick: () => navigate({ to: '/users/users/new' }),
                }}
              />
            </div>
          )}

          {/* No Results State */}
          {hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconSearch}
                title={t.common.noResults()}
                description={t.common.noResultsDescription()}
              />
            </div>
          )}

          {/* Table */}
          {!hasNoData && (
            <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50 backdrop-blur-md">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-border/40"
                    >
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className="text-xs uppercase tracking-wider font-semibold py-4"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                          ease: 'easeOut',
                        }}
                        className="group hover:bg-primary/5 transition-colors border-border/40 cursor-pointer"
                        onClick={() =>
                          navigate({ to: `/users/users/${row.original.id}` })}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!hasNoData && usersData && usersData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {t.common.showing()}
                {' '}
                <span className="text-foreground">
                  {(usersData.page - 1) * usersData.limit + 1}
                </span>
                {' '}
                -
                {' '}
                <span className="text-foreground">
                  {Math.min(usersData.page * usersData.limit, usersData.total)}
                </span>
                {' '}
                {t.common.of()}
                {' '}
                <span className="text-foreground">{usersData.total}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/users/users',
                      search: { ...filters, page: usersData.page - 1 },
                    })
                  }}
                  disabled={usersData.page === 1}
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/users/users',
                      search: { ...filters, page: usersData.page + 1 },
                    })
                  }}
                  disabled={usersData.page === usersData.totalPages}
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={open => !open && setUserToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl border-border/40 bg-card/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">
              {t.common.deleteConfirmTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t.common.deleteConfirmDescription({ name: userToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-border/40 bg-background/50 hover:bg-background">
              {t.common.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (userToDelete) {
                  deleteMutation.mutate(userToDelete.id)
                }
              }}
            >
              {deleteMutation.isPending
                ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )
                : (
                    <IconTrash className="mr-2 h-4 w-4" />
                  )}
              {deleteMutation.isPending
                ? t.common.deleting()
                : t.common.delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
