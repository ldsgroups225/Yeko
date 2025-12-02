import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {

  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { Briefcase, Edit, Eye, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '@/components/hr/table-skeleton'

import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
import { getStaffList } from '@/school/functions/staff'

interface StaffMember {
  id: string
  user: {
    name: string
    email: string
  }
  position: string
  department: string | null
  status: 'active' | 'inactive' | 'on_leave'
  hireDate: Date | null
}

interface StaffTableProps {
  filters: {
    page?: number
    search?: string
    position?: string
    status?: 'active' | 'inactive' | 'on_leave'
  }
}

export function StaffTable({ filters }: StaffTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading } = useQuery({
    queryKey: ['staff', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getStaffList({
        data: {
          filters: {
            search: debouncedSearch,
            position: filters.position,
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

  const columns = useMemo<ColumnDef<StaffMember>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t('hr.staff.name'),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.user.name}</div>
        ),
      },
      {
        accessorKey: 'user.email',
        header: t('hr.staff.email'),
        cell: ({ row }) => row.original.user.email,
      },
      {
        accessorKey: 'position',
        header: t('hr.staff.position'),
        cell: ({ row }) => t(`hr.positions.${row.original.position}`),
      },
      {
        accessorKey: 'department',
        header: t('hr.staff.department'),
        cell: ({ row }) => row.original.department || '-',
      },
      {
        accessorKey: 'status',
        header: t('hr.staff.status'),
        cell: ({ row }) => {
          const status = row.original.status
          const variants = {
            active: 'default',
            inactive: 'secondary',
            on_leave: 'outline',
          } as const
          return (
            <Badge variant={variants[status]}>
              {t(`hr.status.${status}`)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'hireDate',
        header: t('hr.staff.hireDate'),
        cell: ({ row }) =>
          row.original.hireDate
            ? format(new Date(row.original.hireDate), 'dd/MM/yyyy')
            : '-',
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
                onClick={() => navigate({ to: `/app/hr/staff/${row.original.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: `/app/hr/staff/${row.original.id}/edit` })}
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
    data: data?.staff || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />
  }

  const hasNoData = !data?.staff || data.staff.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.position || filters.status)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('hr.staff.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('hr.staff.searchPlaceholder')}
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Empty State */}
          {hasNoData && !hasNoResults && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase />
                </EmptyMedia>
                <EmptyTitle>{t('hr.staff.noStaff')}</EmptyTitle>
                <EmptyDescription>{t('hr.staff.noStaffDescription')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate({ to: '/app/hr/staff/new' })}>
                  {t('hr.staff.addStaff')}
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {/* No Results State */}
          {hasNoResults && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>{t('common.noResults')}</EmptyTitle>
                <EmptyDescription>{t('common.noResultsDescription')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
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
            <div className="flex items-center justify-between mt-4">
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
                      to: '/app/hr/staff',
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
                      to: '/app/hr/staff',
                      search: { ...filters, page: data.page + 1 },
                    })}
                  disabled={data.page === data.totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
