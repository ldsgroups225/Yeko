import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {

  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Edit, Eye, MoreHorizontal, Search, Shield, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
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
import { useTranslations } from '@/i18n'
import { getRoles } from '@/school/functions/roles'

interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  scope: 'school' | 'system'
  isSystemRole: boolean
  userCount: number
  permissionCount: number
}

interface RolesTableProps {
  filters: {
    page?: number
    search?: string
    scope?: 'school' | 'system'
  }
}

export function RolesTable({ filters }: RolesTableProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading } = useQuery({
    queryKey: ['roles', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getRoles({
        data: {
          filters: {
            search: debouncedSearch,
            scope: filters.scope,
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

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t.hr.roles.name(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.name}</span>
            {row.original.isSystemRole && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                {t.hr.roles.system()}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: t.hr.roles.slug(),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: t.hr.roles.description(),
        cell: ({ row }) => row.original.description || '-',
      },
      {
        accessorKey: 'permissionCount',
        header: t.hr.roles.permissions(),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.permissionCount}</Badge>
        ),
      },
      {
        accessorKey: 'userCount',
        header: t.hr.roles.users(),
        cell: ({ row }) => row.original.userCount || 0,
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
                onClick={() => navigate({ to: `/users/roles/${row.original.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t.common.view()}
              </DropdownMenuItem>
              {!row.original.isSystemRole && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({ to: `/users/roles/${row.original.id}/edit` })}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t.common.edit()}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  )

  const table = useReactTable({
    data: data?.roles || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />
  }

  const hasNoData = !data?.roles || data.roles.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.scope)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t.hr.roles.listTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.hr.roles.searchPlaceholder()}
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
                  <Shield />
                </EmptyMedia>
                <EmptyTitle>{t.hr.roles.noRoles()}</EmptyTitle>
                <EmptyDescription>{t.hr.roles.noRolesDescription()}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate({ to: '/users/roles/new' })}>
                  {t.hr.roles.addRole()}
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
                <EmptyTitle>{t.common.noResults()}</EmptyTitle>
                <EmptyDescription>{t.common.noResultsDescription()}</EmptyDescription>
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
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!hasNoData && data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t.common.showing()}
                {' '}
                {(data.page - 1) * data.limit + 1}
                {' '}
                -
                {' '}
                {Math.min(data.page * data.limit, data.total)}
                {' '}
                {t.common.of()}
                {' '}
                {data.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate({
                      to: '/users/roles',
                      search: { ...filters, page: data.page - 1 },
                    })}
                  disabled={data.page === 1}
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate({
                      to: '/users/roles',
                      search: { ...filters, page: data.page + 1 },
                    })}
                  disabled={data.page === data.totalPages}
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
