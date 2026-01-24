import type { ColumnDef } from '@tanstack/react-table'
import {
  IconBuilding,
  IconDots,
  IconEye,
  IconSearch,
  IconStack2,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
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
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
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

export function ClassroomsTable({
  filters = DEFAULT_FILTERS,
}: ClassroomsTableProps) {
  const t = useTranslations()
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
      toast.success(t.common.deleteSuccess())
      refetch()
    }
    catch {
      toast.error(t.common.error())
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
            <div className="font-bold text-foreground">
              {row.original.classroom.name}
            </div>
            <div className="font-mono text-xs font-medium text-muted-foreground">
              {row.original.classroom.code}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            <span className="capitalize">{row.original.classroom.type}</span>
          </Badge>
        ),
      },
      {
        accessorKey: 'classroom.capacity',
        header: 'Capacité',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-muted/20">
              <IconUsers className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="font-medium tabular-nums">
              {row.original.classroom.capacity}
            </span>
          </div>
        ),
      },
      {
        id: 'assigned',
        header: 'Classes assignées',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-muted/20">
              <IconStack2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="font-medium tabular-nums">
              {row.original.assignedClassesCount}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'classroom.status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.classroom.status
          return (
            <Badge
              variant={status === 'active' ? 'default' : 'secondary'}
              className={`rounded-lg capitalize transition-colors ${
                status === 'active'
                  ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status === 'active'
                ? 'Actif'
                : status === 'maintenance'
                  ? 'Maintenance'
                  : 'Inactif'}
            </Badge>
          )
        },
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
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
            >
              <DropdownMenuItem
                className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                onClick={() =>
                  navigate({
                    to: `/spaces/classrooms/${row.original.classroom.id}`,
                  })}
              >
                <IconEye className="mr-2 h-4 w-4 text-muted-foreground" />
                {t.common.view()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                onClick={() => setItemToDelete(row.original)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                {t.common.delete()}
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
    return (
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
        <CardContent className="p-6">
          <TableSkeleton columns={6} rows={5} />
        </CardContent>
      </Card>
    )
  }

  const hasNoData = !data || data.length === 0
  const hasNoResults = hasNoData && debouncedSearch

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              {t.spaces.title()}
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.common.search()}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9 h-9 rounded-xl border-border/40 bg-background/50 focus:bg-background transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {hasNoData && !hasNoResults && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-b border-border/40 bg-card/10">
              <div className="p-4 rounded-full bg-muted/20 mb-4">
                <IconBuilding className="size-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium">
                {t.tables.noClassroomsFound()}
              </p>
              <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
                {t.tables.createFirstClassroom()}
              </p>
            </div>
          )}

          {hasNoResults && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconSearch />
                </EmptyMedia>
                <EmptyTitle>{t.empty.noResults()}</EmptyTitle>
                <EmptyDescription>
                  {t.empty.tryModifyingFilters()}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!hasNoData && (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow
                        key={headerGroup.id}
                        className="hover:bg-transparent border-border/40"
                      >
                        {headerGroup.headers.map(header => (
                          <TableHead
                            key={header.id}
                            className="font-semibold text-muted-foreground"
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
                    <AnimatePresence>
                      {table.getRowModel().rows.map((row, index) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          className="group hover:bg-muted/30 border-border/40 transition-colors"
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
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

              <div className="md:hidden space-y-4 p-4">
                <AnimatePresence>
                  {data?.map((item, index) => (
                    <motion.div
                      key={item.classroom.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                            {item.classroom.code}
                          </div>
                          <Badge
                            variant={
                              item.classroom.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize rounded-md text-[10px]"
                          >
                            {item.classroom.status === 'active'
                              ? 'Actif'
                              : 'Inactif'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg -mr-2 -mt-2 text-muted-foreground"
                          onClick={() =>
                            navigate({
                              to: `/spaces/classrooms/${item.classroom.id}`,
                            })}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <div className="font-bold text-lg">
                          {item.classroom.name}
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-1 font-medium text-xs capitalize"
                        >
                          {item.classroom.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-2 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center">
                          <IconUsers className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            Capacité
                          </span>
                          <span className="font-bold">
                            {item.classroom.capacity}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center">
                          <IconStack2 className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            Classes
                          </span>
                          <span className="font-bold">
                            {item.assignedClassesCount}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {!hasNoData && table.getPageCount() > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/5">
              <div className="text-sm text-muted-foreground font-medium">
                {t.common.showing()}
                {' '}
                <span className="font-bold text-foreground">
                  {table.getState().pagination.pageIndex
                    * table.getState().pagination.pageSize
                    + 1}
                </span>
                {' '}
                -
                {' '}
                <span className="font-bold text-foreground">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1)
                    * table.getState().pagination.pageSize,
                    data.length,
                  )}
                </span>
                {' '}
                {t.common.of()}
                {' '}
                <span className="font-bold text-foreground">{data.length}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="rounded-lg h-8"
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="rounded-lg h-8"
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={open => !open && setItemToDelete(null)}
      >
        <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {t.dialogs.deleteConfirmation.title()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/80">
              {t.dialogs.deleteConfirmation.description({
                item: itemToDelete ? itemToDelete.classroom.name : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl border-border/40">
              {t.dialogs.deleteConfirmation.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
              onClick={handleDelete}
            >
              {t.dialogs.deleteConfirmation.delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
