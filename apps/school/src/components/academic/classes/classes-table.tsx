import type { ColumnDef } from '@tanstack/react-table'
import { IconAdjustmentsHorizontal, IconBook, IconChevronLeft, IconChevronRight, IconDots, IconDownload, IconEye, IconPlus, IconSearch, IconTrash, IconUsers, IconX } from '@tabler/icons-react'
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
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ClassForm } from '@/components/academic/class-form'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
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

export function ClassesTable({ filters: initialFilters = DEFAULT_FILTERS }: ClassesTableProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState(initialFilters.search || '')
  const [status, setStatus] = useState<string>(initialFilters.status || '')
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 500)

  const isFiltered = !!searchInput || (!!status && status !== 'all')

  const handleClearFilters = () => {
    setSearchInput('')
    setStatus('')
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classes', { search: debouncedSearch, status }],
    queryFn: async () => {
      const result = await getClasses({
        data: {
          search: debouncedSearch,
          status: status === 'all' ? undefined : status,
        },
      })
      return result as unknown as ClassItem[]
    },
  })

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && data) {
      setSelectedRows(data.map(item => item.class.id))
    }
    else {
      setSelectedRows([])
    }
  }, [data])

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    }
    else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }, [])

  const handleDelete = async () => {
    if (!classToDelete)
      return
    try {
      await deleteClass({ data: classToDelete.class.id })
      toast.success(t.common.deleteSuccess())
      setSelectedRows(prev => prev.filter(id => id !== classToDelete.class.id))
      refetch()
    }
    catch {
      toast.error(t.common.error())
    }
    finally {
      setClassToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<ClassItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => handleSelectAll(!!value)}
            aria-label="Select all"
            className="translate-y-[2px] border-primary/50 data-[state=checked]:border-primary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.includes(row.original.class.id)}
            onCheckedChange={value => handleSelectRow(row.original.class.id, !!value)}
            aria-label="Select row"
            className="translate-y-[2px] border-primary/50 data-[state=checked]:border-primary"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: row => `${row.grade.name} ${row.series?.name || ''} ${row.class.section}`,
        id: 'name',
        header: t.classes.name(),
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
        header: t.classes.room(),
        cell: ({ row }) => row.original.classroom?.name || '-',
      },
      {
        id: 'students',
        header: t.classes.students(),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <IconUsers className="h-3 w-3 text-muted-foreground" />
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
        header: t.classes.subjects(),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <IconBook className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.subjectsCount}</span>
          </div>
        ),
      },
      {
        accessorKey: 'homeroomTeacher.name',
        header: t.classes.homeroomTeacher(),
        cell: ({ row }) => row.original.homeroomTeacher?.name || '-',
      },
      {
        accessorKey: 'class.status',
        header: t.classes.status(),
        cell: ({ row }) => {
          const status = row.original.class.status
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status === 'active' ? t.common.active() : t.common.archived()}
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
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-xl bg-popover/90 border border-border/40">
              <DropdownMenuItem
                onClick={() => navigate({ to: `/classes/${row.original.class.id}` })}
              >
                <IconEye className="mr-2 h-4 w-4" />
                {t.common.view()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setClassToDelete(row.original)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate, t, handleSelectAll, selectedRows, handleSelectRow],
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
  const hasResults = !hasNoData

  return (
    <div className="space-y-6">
      {/* Filters & Actions - Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.common.search()}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="border-border/40 bg-card/50 pl-9 transition-all focus:bg-card/80 shadow-none"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none hover:bg-card/80">
                <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                {t.common.actions()}
                {status && status !== 'all' && (
                  <Badge variant="secondary" className="ml-2 h-5 rounded-full px-1.5 text-xs">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4 backdrop-blur-2xl bg-popover/90 border border-border/40" align="start">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">{t.common.filters()}</h4>
                <Label>{t.classes.status()}</Label>
                <Select value={status} onValueChange={val => val && setStatus(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.classes.status()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all()}</SelectItem>
                    <SelectItem value="active">{t.common.active()}</SelectItem>
                    <SelectItem value="archived">{t.common.archived()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(status && status !== 'all') && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleClearFilters}
                >
                  {t.common.refresh()}
                </Button>
              )}

              <div className="pt-4 border-t border-border/40 space-y-2">
                <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">{t.common.quickActions()}</h4>
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: '/classes/assignments' })}
                  className="w-full justify-start text-sm"
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t.academic.assignments.title()}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => toast.info(t.common.comingSoon())}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  {t.common.export()}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
            >
              <IconX className="mr-2 h-4 w-4" />
              {t.common.refresh()}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedRows.length > 0 && (
            <Button variant="secondary" size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none">
              {selectedRows.length}
              {' '}
              {t.common.selected()}
            </Button>
          )}

          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <IconPlus className="mr-2 h-4 w-4" />
            {t.classes.addClass()}
          </Button>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {isLoading
          ? (
              Array.from({ length: 5 }, () => (
                <div key={`card-skeleton-${Math.random()}`} className="rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))
            )
          : data?.length === 0
            ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/50 p-8 text-center backdrop-blur-sm">
                  <IconUsers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">{t.tables.noClassesFound()}</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.tables.createFirstClass()}</p>
                </div>
              )
            : (
                <AnimatePresence>
                  {data?.map((item, index) => (
                    <motion.div
                      key={item.class.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-border/40 bg-card/50 p-4 shadow-sm backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRows.includes(item.class.id)}
                            onCheckedChange={checked => handleSelectRow(item.class.id, !!checked)}
                            className="mr-2 border-primary/50 data-[state=checked]:border-primary"
                          />
                          <div
                            onClick={() => navigate({ to: `/classes/${item.class.id}` })}
                            className="cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                navigate({ to: `/classes/${item.class.id}` })
                              }
                            }}
                          >
                            <p className="font-medium text-foreground">
                              {item.grade.name}
                              {' '}
                              {item.series?.name}
                              {' '}
                              <span className="text-muted-foreground">{item.class.section}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.classroom?.name || t.classes.noClassroom()}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-card/20">
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="backdrop-blur-xl bg-popover/90 border border-border/40">
                            <DropdownMenuItem onClick={() => navigate({ to: `/classes/${item.class.id}` })}>
                              <IconEye className="mr-2 h-4 w-4" />
                              {t.common.view()}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setClassToDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              {t.common.delete()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant={item.class.status === 'active' ? 'default' : 'secondary'} className="border-0 shadow-none">
                          {item.class.status === 'active' ? t.common.active() : t.common.archived()}
                        </Badge>
                        <Badge variant="outline" className="border-border/40 bg-card/20 backdrop-blur-md">
                          <IconUsers className="mr-1 h-3 w-3" />
                          {item.studentsCount}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-card/20">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-foreground font-semibold">
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
            {data?.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-96">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-white/10 p-6 backdrop-blur-xl mb-4">
                          <IconUsers className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold">{t.tables.noClassesFound()}</h3>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.tables.createFirstClass()}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : (
                  <AnimatePresence>
                    {table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-border/10 group hover:bg-card/30 transition-colors"
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {hasResults && table.getPageCount() > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            <IconChevronLeft className="h-4 w-4 mr-1" />
            {t.common.previous()}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t.common.showing()}
            {' '}
            {table.getState().pagination.pageIndex + 1}
            {' '}
            {t.common.of()}
            {' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            {t.common.next()}
            <IconChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <AlertDialog open={!!classToDelete} onOpenChange={open => !open && setClassToDelete(null)}>
        <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.deleteConfirmation.title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.dialogs.deleteConfirmation.description({
                item: classToDelete ? `${classToDelete.grade.name} ${classToDelete.class.section}` : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/40 bg-card/50">{t.dialogs.deleteConfirmation.cancel()}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t.dialogs.deleteConfirmation.delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl backdrop-blur-xl bg-card/95 border-border/40">
          <DialogHeader>
            <DialogTitle>{t.dialogs.createClass.title()}</DialogTitle>
            <DialogDescription>{t.dialogs.createClass.description()}</DialogDescription>
          </DialogHeader>
          <ClassForm onSuccess={() => {
            setIsAddDialogOpen(false)
            refetch()
          }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
