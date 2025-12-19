import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {

  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit, Eye, GraduationCap, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
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
import { getTeachers } from '@/school/functions/teachers'

interface Teacher {
  id: string
  user: {
    name: string
    email: string
  }
  specialization: string | null
  status: 'active' | 'inactive' | 'on_leave'
  hireDate: Date | null
  subjects: string[]
}

interface TeachersTableProps {
  filters: {
    page?: number
    search?: string
    subjectId?: string
    status?: 'active' | 'inactive' | 'on_leave'
  }
}

export function TeachersTable({ filters }: TeachersTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getTeachers({
        data: {
          filters: {
            search: debouncedSearch,
            subjectId: filters.subjectId,
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

  const columns = useMemo<ColumnDef<Teacher>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t('hr.teachers.name'),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.user.name}</div>
        ),
      },
      {
        accessorKey: 'user.email',
        header: t('hr.teachers.email'),
        cell: ({ row }) => row.original.user.email,
      },
      {
        accessorKey: 'subjects',
        header: t('hr.teachers.subjects'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.subjects && row.original.subjects.length > 0
              ? (
                row.original.subjects.slice(0, 3).map(subject => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))
              )
              : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            {row.original.subjects && row.original.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +
                {row.original.subjects.length - 3}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'specialization',
        header: t('hr.teachers.specialization'),
        cell: ({ row }) => row.original.specialization || '-',
      },
      {
        accessorKey: 'status',
        header: t('hr.teachers.status'),
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
        header: t('hr.teachers.hireDate'),
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
                onClick={() => navigate({ to: `/users/teachers/${row.original.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: `/users/teachers/${row.original.id}/edit` })}
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
    data: data?.teachers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />
  }

  const hasNoData = !data?.teachers || data.teachers.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.subjectId || filters.status)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('hr.teachers.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('hr.teachers.searchPlaceholder')}
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
                  <GraduationCap />
                </EmptyMedia>
                <EmptyTitle>{t('hr.teachers.noTeachers')}</EmptyTitle>
                <EmptyDescription>{t('hr.teachers.noTeachersDescription')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate({ to: '/users/teachers/new' })}>
                  {t('hr.teachers.addTeacher')}
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
                      to: '/users/teachers',
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
                      to: '/users/teachers',
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
