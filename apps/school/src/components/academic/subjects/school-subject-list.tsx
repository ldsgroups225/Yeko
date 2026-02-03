import type { ColumnDef } from '@tanstack/react-table'
import {
  IconAdjustmentsHorizontal,
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
import { useTranslations } from '@/i18n'
import {
  schoolSubjectsKeys,
  schoolSubjectsOptions,
} from '@/lib/queries/school-subjects'
import { cn } from '@/lib/utils'
import { toggleSchoolSubjectStatus } from '@/school/functions/school-subjects'
import { SubjectPickerDialog } from './subject-picker-dialog'
import { SubjectStatusToggle } from './subject-status-toggle'

interface SchoolSubjectListProps {
  schoolYearId?: string
}

interface SchoolSubjectItem {
  id: string
  schoolId: string
  subjectId: string
  schoolYearId: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  subject: {
    id: string
    name: string
    shortName: string
    category: string | null
  }
}

const SUBJECT_CATEGORY_KEYS = [
  'litteraire',
  'scientifique',
  'sportif',
  'autre',
] as const
type SubjectCategoryKey = (typeof SUBJECT_CATEGORY_KEYS)[number]

const CATEGORY_STYLES: Record<string, { className: string, icon: React.ReactNode }> = {
  Scientifique: {
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: <span className="mr-1.5">🔬</span>,
  },
  Littéraire: {
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: <span className="mr-1.5">📖</span>,
  },
  Sportif: {
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: <span className="mr-1.5">⚽</span>,
  },
  Autre: {
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: <span className="mr-1.5">🎨</span>,
  },
}

const SUBJECT_CATEGORY_FILTER_MAP: Record<
  SubjectCategoryKey,
  'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
> = {
  litteraire: 'Littéraire',
  scientifique: 'Scientifique',
  sportif: 'Sportif',
  autre: 'Autre',
}

export function SchoolSubjectList({ schoolYearId }: SchoolSubjectListProps) {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pickerOpen, setPickerOpen] = useState(false)

  const queryClient = useQueryClient()

  const filters = {
    schoolYearId,
    search: search || undefined,
    category:
      categoryFilter !== 'all'
        ? SUBJECT_CATEGORY_FILTER_MAP[categoryFilter as SubjectCategoryKey]
        : undefined,
    status:
      statusFilter !== 'all'
        ? (statusFilter as 'active' | 'inactive')
        : undefined,
  }

  const { data: result, isLoading, error } = useQuery(
    schoolSubjectsOptions.list(filters),
  )

  const toggleStatusMutation = useMutation({
    mutationFn: (params: { id: string, status: 'active' | 'inactive' }) =>
      toggleSchoolSubjectStatus({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success(t.academic.subjects.messages.statusUpdated())
    },
    onError: () => {
      toast.error(t.academic.subjects.messages.statusError())
    },
  })

  const isFiltered
    = !!search || categoryFilter !== 'all' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const subjectsData = useMemo(
    () => {
      if (result?.success) {
        return result.data.subjects as unknown as SchoolSubjectItem[]
      }
      return [] as SchoolSubjectItem[]
    },
    [result],
  )

  const columns = useMemo<ColumnDef<SchoolSubjectItem>[]>(
    () => [
      {
        accessorKey: 'subject.name',
        header: t.academic.subjects.messages.subjectName(),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border/40 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
              <IconBook className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {row.original.subject.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {row.original.subject.shortName}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'subject.category',
        header: t.academic.subjects.filterByCategory(),
        cell: ({ row }) => {
          const category = row.original.subject.category || 'Autre'
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Autre
          if (!style)
            return category // Fallback if something is very wrong
          return (
            <Badge
              variant="outline"
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all duration-300 group-hover:shadow-sm',
                style.className,
              )}
            >
              {style.icon}
              {category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: t.academic.subjects.filterByStatus(),
        cell: ({ row }) => (
          <SubjectStatusToggle
            status={row.original.status}
            onToggle={status =>
              toggleStatusMutation.mutate({
                id: row.original.id,
                status,
              })}
            disabled={toggleStatusMutation.isPending}
          />
        ),
      },
    ],
    [toggleStatusMutation, t],
  )

  const table = useReactTable({
    data: subjectsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-destructive">
          {t.academic.subjects.messages.listError()}
        </h3>
        <p className="mt-2 text-sm text-destructive/80">
          {(error as Error).message}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full rounded-2xl bg-white/5 animate-pulse" />
        <TableSkeleton columns={3} rows={5} />
      </div>
    )
  }

  const hasNoData = subjectsData.length === 0

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
              placeholder={t.academic.subjects.searchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-border/40 bg-card/50 pl-9 transition-all focus:bg-card/80 shadow-none"
            />
          </div>

          <Popover>
            <PopoverTrigger
              render={(
                <Button
                  variant="outline"
                  className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none hover:bg-card/80"
                >
                  <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                  {t.common.actions()}
                  {isFiltered && (
                    <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                  )}
                </Button>
              )}
            />
            <PopoverContent
              className="w-80 p-4 space-y-4 backdrop-blur-2xl bg-popover/90 border border-border/40"
              align="start"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none text-muted-foreground text-xs uppercase tracking-wider">
                    {t.common.filters()}
                  </h4>
                  {isFiltered && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-6 px-2 text-[10px] text-primary"
                    >
                      {t.common.clearFilters()}
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">
                      {t.academic.subjects.filterByCategory()}
                    </Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={val => val && setCategoryFilter(val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-card/50 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t.academic.subjects.allCategories()}
                        </SelectItem>
                        {SUBJECT_CATEGORY_KEYS.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {t.academic.subjects.categories[cat]()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">
                      {t.academic.subjects.filterByStatus()}
                    </Label>
                    <Select
                      value={statusFilter}
                      onValueChange={val => val && setStatusFilter(val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-card/50 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t.academic.subjects.allStatus()}
                        </SelectItem>
                        <SelectItem value="active">
                          {t.academic.subjects.status.active()}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t.academic.subjects.status.inactive()}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-2">
                  <h4 className="font-medium leading-none text-muted-foreground text-xs mb-3 uppercase tracking-wider">
                    {t.common.quickActions()}
                  </h4>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => toast.info(t.common.comingSoon())}
                  >
                    <IconDownload className="mr-2 h-4 w-4" />
                    {t.common.export()}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={() => setPickerOpen(true)}
          className="shadow-lg shadow-primary/20"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.academic.subjects.addSubjects()}
        </Button>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl md:block overflow-hidden">
        {hasNoData
          ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-full bg-white/10 p-6 backdrop-blur-xl mb-4">
                  <IconBook className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold">
                  {t.academic.subjects.noSubjects()}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {isFiltered
                    ? t.academic.subjects.messages.adjustFilters()
                    : t.academic.subjects.noSubjectsDescription()}
                </p>
              </div>
            )
          : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-border/10"
                    >
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className="h-14 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70"
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.03 }}
                        className="group border-border/5 hover:bg-primary/2 transition-colors"
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
            )}
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {hasNoData
          ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/40 bg-card/50 p-6">
                <IconBook className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold">
                  {t.academic.subjects.noSubjects()}
                </h3>
              </div>
            )
          : (
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="overflow-hidden rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {row.original.subject.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {row.original.subject.shortName}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-card/30 border-0 shadow-none text-[10px]"
                      >
                        {row.original.subject.category || 'Autre'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-3">
                      <span className="text-xs text-muted-foreground">
                        {t.common.status()}
                      </span>
                      <SubjectStatusToggle
                        status={row.original.status}
                        onToggle={status =>
                          toggleStatusMutation.mutate({
                            id: row.original.id,
                            status,
                          })}
                        disabled={toggleStatusMutation.isPending}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
      </div>

      {/* Pagination */}
      {!hasNoData && table.getPageCount() > 1 && (
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
            {table.getState().pagination.pageIndex + 1}
            {' '}
            /
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

      <SubjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        schoolYearId={schoolYearId}
      />
    </div>
  )
}
