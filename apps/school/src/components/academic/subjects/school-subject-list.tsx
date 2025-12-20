import type { ColumnDef } from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { BookOpen, Filter, Plus, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslations } from '@/i18n'
import {
  schoolSubjectsKeys,
  schoolSubjectsOptions,
} from '@/lib/queries/school-subjects'
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

const SUBJECT_CATEGORY_KEYS = ['litteraire', 'scientifique', 'sportif', 'autre'] as const
type SubjectCategoryKey = (typeof SUBJECT_CATEGORY_KEYS)[number]

const SUBJECT_CATEGORY_FILTER_MAP: Record<SubjectCategoryKey, 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'> = {
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

  const { data, isLoading, error } = useQuery(
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

  const columns = useMemo<ColumnDef<SchoolSubjectItem>[]>(
    () => [
      {
        accessorKey: 'subject.name',
        header: t.academic.subjects.messages.subjectName(),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.subject.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.subject.shortName}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'subject.category',
        header: t.academic.subjects.filterByCategory(),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.subject.category || 'Autre'}
          </Badge>
        ),
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

  // Memoize data to avoid issues
  const subjectsData = useMemo(
    () => (data?.subjects || []) as SchoolSubjectItem[],
    [data],
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
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t.academic.subjects.messages.listError()}
          </CardTitle>
          <CardContent>{(error as Error).message}</CardContent>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return <TableSkeleton columns={3} rows={5} />
  }

  const hasNoData = subjectsData.length === 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{t.academic.subjects.title()}</CardTitle>
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.academic.subjects.addSubjects()}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.academic.subjects.searchPlaceholder()}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue
                  placeholder={t.academic.subjects.filterByCategory()}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t.academic.subjects.allCategories()}
                </SelectItem>
                {SUBJECT_CATEGORY_KEYS.map((cat) => {
                  const categoryTranslations = {
                    scientifique:
                      t.academic.subjects.categories.scientifique,
                    litteraire: t.academic.subjects.categories.litteraire,
                    sportif: t.academic.subjects.categories.sportif,
                    autre: t.academic.subjects.categories.autre,
                  }
                  return (
                    <SelectItem key={cat} value={cat}>
                      {categoryTranslations[cat]()}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue
                  placeholder={t.academic.subjects.filterByStatus()}
                />
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

          {hasNoData
            ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpen />
                    </EmptyMedia>
                    <EmptyTitle>{t.academic.subjects.noSubjects()}</EmptyTitle>
                    <EmptyDescription>
                      {search
                        || categoryFilter !== 'all'
                        || statusFilter !== 'all'
                        ? t.academic.subjects.messages.adjustFilters()
                        : t.academic.subjects.noSubjectsDescription()}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            : (
                <>
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
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      {t.common.showing()}
                      {' '}
                      {table.getState().pagination.pageIndex
                        * table.getState().pagination.pageSize
                        + 1}
                      {' '}
                      -
                      {' '}
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1)
                        * table.getState().pagination.pageSize,
                        subjectsData.length,
                      )}
                      {' '}
                      {t.common.of()}
                      {' '}
                      {subjectsData.length}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        {t.common.previous()}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        {t.common.next()}
                      </Button>
                    </div>
                  </div>
                </>
              )}
        </CardContent>
      </Card>

      <SubjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        schoolYearId={schoolYearId}
      />
    </div>
  )
}
