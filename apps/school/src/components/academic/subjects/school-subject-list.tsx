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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { schoolSubjectsKeys, schoolSubjectsOptions } from '@/lib/queries/school-subjects'
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

const CATEGORIES = ['Scientifique', 'Littéraire', 'Sportif', 'Autre'] as const

export function SchoolSubjectList({ schoolYearId }: SchoolSubjectListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pickerOpen, setPickerOpen] = useState(false)

  const queryClient = useQueryClient()

  const filters = {
    schoolYearId,
    search: search || undefined,
    category: categoryFilter !== 'all' ? (categoryFilter as typeof CATEGORIES[number]) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
  }

  const { data, isLoading, error } = useQuery(schoolSubjectsOptions.list(filters))

  const toggleStatusMutation = useMutation({
    mutationFn: (params: { id: string, status: 'active' | 'inactive' }) =>
      toggleSchoolSubjectStatus({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success('Subject status updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status')
    },
  })

  const columns = useMemo<ColumnDef<SchoolSubjectItem>[]>(
    () => [
      {
        accessorKey: 'subject.name',
        header: 'Subject Name',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.subject.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.subject.shortName}</div>
          </div>
        ),
      },
      {
        accessorKey: 'subject.category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.subject.category || 'Autre'}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
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
    [toggleStatusMutation],
  )

  // Memoize data to avoid issues
  const subjectsData = useMemo(() => (data?.subjects || []) as SchoolSubjectItem[], [data])

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
          <CardTitle className="text-destructive">Error Loading Subjects</CardTitle>
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
          <CardTitle>Subjects List</CardTitle>
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subjects
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                    <EmptyTitle>No subjects found</EmptyTitle>
                    <EmptyDescription>
                      {search || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Add your first subject to get started'}
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
                                  : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing
                      {' '}
                      {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                      {' '}
                      -
                      {' '}
                      {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, subjectsData.length)}
                      {' '}
                      of
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
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
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
