import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {

  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit, Eye, MoreHorizontal, Search, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/hr/empty-state'
import { TableSkeleton } from '@/components/hr/table-skeleton'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { getUsers } from '@/school/functions/users'

interface User {
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading } = useQuery({
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

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('hr.users.name'),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: t('hr.users.email'),
      },
      {
        accessorKey: 'phone',
        header: t('hr.users.phone'),
        cell: ({ row }) => row.original.phone || '-',
      },
      {
        accessorKey: 'roles',
        header: t('hr.users.roles'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('hr.users.status'),
        cell: ({ row }) => {
          const status = row.original.status
          const variants = {
            active: 'default',
            inactive: 'secondary',
            suspended: 'destructive',
          } as const
          return (
            <Badge variant={variants[status]}>
              {t(`hr.status.${status}`)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'lastLoginAt',
        header: t('hr.users.lastLogin'),
        cell: ({ row }) =>
          row.original.lastLoginAt
            ? format(new Date(row.original.lastLoginAt), 'dd/MM/yyyy HH:mm')
            : t('hr.users.neverLoggedIn'),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate({ to: `/app/hr/users/${row.original.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: `/app/hr/users/${row.original.id}/edit` })}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  )

  const table = useReactTable({
    data: data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />
  }

  const hasNoData = !data?.users || data.users.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.roleId || filters.status)

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('hr.users.searchPlaceholder')}
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Empty State */}
      {hasNoData && !hasNoResults && (
        <EmptyState
          icon={Users}
          title={t('hr.users.noUsers')}
          description={t('hr.users.noUsersDescription')}
          action={{
            label: t('hr.users.addUser'),
            onClick: () => navigate({ to: '/app/hr/users/new' }),
          }}
        />
      )}

      {/* No Results State */}
      {hasNoResults && (
        <EmptyState
          icon={Search}
          title={t('common.noResults')}
          description={t('common.noResultsDescription')}
        />
      )}

      {/* Table */}
      {!hasNoData && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
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
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!hasNoData && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('common.showing')}
            {' '}
            {(data.page - 1) * data.limit + 1}
            {' '}
            -
            {' '}
            {Math.min(data.page * data.limit, data.total)}
            {' '}
            {t('common.of')}
            {' '}
            {data.total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  to: '/app/hr/users',
                  search: { ...filters, page: data.page - 1 },
                })}
              disabled={data.page === 1}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  to: '/app/hr/users',
                  search: { ...filters, page: data.page + 1 },
                })}
              disabled={data.page === data.totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
