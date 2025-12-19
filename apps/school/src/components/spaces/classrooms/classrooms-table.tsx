import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, Layers, MoreHorizontal, Search, Trash2, Users } from 'lucide-react'
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
import { deleteClassroom, getClassrooms } from '@/school/functions/classrooms'

interface ClassroomItem {
  classroom: {
    id: string
    name: string
    code: string
    type: string
    capacity: number
    status: 'active' | 'maintenance' | 'inactive'
  }
  assignedClassesCount: number
}

interface ClassroomsTableProps {
  filters?: {
    search?: string
    status?: string
  }
}

const DEFAULT_FILTERS = {}

export function ClassroomsTable({ filters = DEFAULT_FILTERS }: ClassroomsTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [itemToDelete, setItemToDelete] = useState<ClassroomItem | null>(null)
  const debouncedSearch = useDebounce(searchInput, 500)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classrooms', { search: debouncedSearch }],
    queryFn: async () => {
      const result = await getClassrooms({
        data: {
          search: debouncedSearch,
          // status: filters.status, // API supports status but let's stick to search for now as layout
        },
      })
      return result as unknown as ClassroomItem[]
    },
  })

  const handleDelete = async () => {
    if (!itemToDelete)
      return
    try {
      await deleteClassroom({ data: itemToDelete.classroom.id })
      toast.success(t('common.deleteSuccess'))
      refetch()
    }
    catch {
      toast.error(t('common.error'))
    }
    finally {
      setItemToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<ClassroomItem>[]>(
    () => [
      {
        accessorKey: 'classroom.name',
        header: 'Nom',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.classroom.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.classroom.code}</div>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.type',
        header: 'Type',
        cell: ({ row }) => <span className="capitalize">{row.original.classroom.type}</span>,
      },
      {
        accessorKey: 'classroom.capacity',
        header: 'Capacité',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.classroom.capacity}</span>
          </div>
        ),
      },
      {
        id: 'assigned',
        header: 'Classes assignées',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.assignedClassesCount}</span>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.classroom.status
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? 'Actif' : status === 'maintenance' ? 'Maintenance' : 'Inactif'}
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
                onClick={() => navigate({ to: `/spaces/classrooms/${row.original.classroom.id}` })}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('common.view')}
              </DropdownMenuItem>
              {/* Add Edit later when dialog support is better */}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setItemToDelete(row.original)}
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
  const hasNoResults = hasNoData && debouncedSearch

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('spaces.title')}</CardTitle>
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
                  <Layers />
                </EmptyMedia>
                <EmptyTitle>{t('tables.noClassroomsFound')}</EmptyTitle>
                <EmptyDescription>{t('tables.createFirstClassroom')}</EmptyDescription>
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

      <AlertDialog open={!!itemToDelete} onOpenChange={open => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.deleteConfirmation.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.deleteConfirmation.description', {
                item: itemToDelete ? itemToDelete.classroom.name : '',
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
