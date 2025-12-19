import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {

  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { BookOpen, Eye, MoreHorizontal, Search, Trash2, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/hr/table-skeleton'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { deleteClass, getClasses } from '@/school/functions/classes'

interface ClassItem {
  class: {
    id: string
    section: string
    maxStudents: number
    status: 'active' | 'archived'
  }
  grade: {
    name: string
  }
  series?: {
    name: string
  }
  classroom?: {
    name: string
  }
  homeroomTeacher?: {
    name: string
  }
  studentsCount: number
  subjectsCount: number
}

interface ClassesTableProps {
  filters?: {
    search?: string
    status?: string
  }
}

const DEFAULT_FILTERS = {}

export function ClassesTable({ filters = DEFAULT_FILTERS }: ClassesTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null)
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classes', { search: debouncedSearch, status: filters.status }],
    queryFn: async () => {
      const result = await getClasses({
        data: {
          search: debouncedSearch,
          status: filters.status,
        },
      })
      return result as unknown as ClassItem[]
    },
  })

  const handleDelete = async () => {
    if (!classToDelete)
      return
    try {
      await deleteClass({ data: classToDelete.class.id })
      toast.success(t('common.deleteSuccess'))
      refetch()
    }
    catch {
      toast.error(t('common.error'))
    }
    finally {
      setClassToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<ClassItem>[]>(
    () => [
      {
        accessorFn: row => `${row.grade.name} ${row.series?.name || ''} ${row.class.section}`,
        id: 'name',
        header: 'Nom de la classe',
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.grade.name}
            {' '}
            {row.original.series?.name}
            {' '}
            <span className="text-muted-foreground">{row.original.class.section}</span>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.name',
        header: 'Salle',
        cell: ({ row }) => row.original.classroom?.name || '-',
      },
      {
        id: 'students',
        header: 'Élèves',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>
              {row.original.studentsCount}
              {' '}
              /
              {row.original.class.maxStudents}
            </span>
          </div>
        ),
      },
      {
        id: 'subjects',
        header: 'Matières',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.subjectsCount}</span>
          </div>
        ),
      },
      {
        accessorKey: 'homeroomTeacher.name',
        header: 'Prof. Principal',
        cell: ({ row }) => row.original.homeroomTeacher?.name || '-',
      },
      {
        accessorKey: 'class.status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.class.status
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? 'Actif' : 'Archivé'}
            </Badge>
          )
        },
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
                onClick={() => navigate({ to: `/app/academic/classes/${row.original.class.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setClassToDelete(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate, t],
  )

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />
  }

  const hasNoData = !data || data.length === 0
  const hasNoResults = hasNoData && (debouncedSearch || filters.status)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('nav.classes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {hasNoData && !hasNoResults && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>{t('tables.noClassesFound')}</EmptyTitle>
                <EmptyDescription>{t('tables.createFirstClass')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {hasNoResults && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>{t('empty.noResults')}</EmptyTitle>
                <EmptyDescription>{t('empty.tryModifyingFilters')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

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

          {!hasNoData && table.getPageCount() > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t('common.showing')}
                {' '}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                {' '}
                -
                {' '}
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}
                {' '}
                {t('common.of')}
                {' '}
                {data.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <AlertDialog open={!!classToDelete} onOpenChange={open => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteConfirmation.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.deleteConfirmation.description', {
                item: classToDelete ? `${classToDelete.grade.name} ${classToDelete.class.section}` : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialogs.deleteConfirmation.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t('dialogs.deleteConfirmation.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
