import type { IconUser } from './users-table-columns'
import {
  IconSearch,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/hr/empty-state'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteExistingUser, getUsers } from '@/school/functions/users'
import { useUsersTableColumns } from './users-table-columns'
import { UsersTableDeleteDialog } from './users-table-delete-dialog'
import { UsersTableRenderer } from './users-table-renderer'

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

  const columns = useUsersTableColumns({ setUserToDelete })

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
      <Card className="
        border-border/40 bg-card/50 overflow-hidden shadow-sm backdrop-blur-xl
      "
      >
        <CardHeader className="pb-4">
          <div className="
            flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          "
          >
            <CardTitle className="font-serif text-2xl">
              {t.hr.users.listTitle()}
            </CardTitle>
            <div className="
              relative w-full
              sm:w-72
            "
            >
              <IconSearch className="
                text-muted-foreground absolute top-1/2 left-3 h-4 w-4
                -translate-y-1/2
              "
              />
              <Input
                placeholder={t.hr.users.searchPlaceholder()}
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)}
                className="
                  bg-background/50 border-border/40
                  focus:bg-background
                  rounded-xl pl-10 transition-all
                "
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
                  onClick: () => navigate({ to: '/settings/personnel/users/new' }),
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
            <UsersTableRenderer table={table} />
          )}

          {/* Pagination */}
          {!hasNoData && usersData && usersData.totalPages > 1 && (
            <div className="
              mt-6 flex flex-col items-center justify-between gap-4
              sm:flex-row
            "
            >
              <div className="text-muted-foreground text-sm font-medium">
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
                  className="
                    border-border/40 bg-background/50
                    hover:bg-background
                    rounded-xl px-4 transition-all
                  "
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/settings/personnel/users',
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
                  className="
                    border-border/40 bg-background/50
                    hover:bg-background
                    rounded-xl px-4 transition-all
                  "
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate({
                      to: '/settings/personnel/users',
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

      <UsersTableDeleteDialog
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
        deleteMutation={deleteMutation}
      />
    </div>
  )
}
