import type { ClassroomItem } from './types'
import {
  IconBuilding,
  IconSearch,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteClassroom, getClassrooms } from '@/school/functions/classrooms'
import { useClassroomsTableColumns } from './classrooms-table-columns'
import { ClassroomsTableDeleteDialog } from './classrooms-table-delete-dialog'
import { ClassroomsTableMobileView } from './classrooms-table-mobile-view'

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

  const { data: result, isPending: isPendingQuery } = useQuery({
    queryKey: ['classrooms', { search: debouncedSearch }],
    queryFn: async () => {
      const res = await getClassrooms({
        data: {
          search: debouncedSearch,
        },
      })
      return res
    },
  })

  const data = result?.success ? (result.data as unknown as ClassroomItem[]) : []
  const isPending = isPendingQuery

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.classrooms.delete,
    mutationFn: (id: string) => deleteClassroom({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success(t.common.deleteSuccess())
      setItemToDelete(null)
    },
    onError: () => {
      toast.error(t.common.error())
    },
  })

  const handleDelete = () => {
    if (!itemToDelete)
      return
    deleteMutation.mutate(itemToDelete.id)
  }

  const columns = useClassroomsTableColumns({ setItemToDelete })

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

  if (isPending) {
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
      <Card className="
        border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
      "
      >
        <CardHeader className="border-border/40 bg-muted/5 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              {t.spaces.title()}
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <IconSearch className="
                text-muted-foreground absolute top-1/2 left-3 h-4 w-4
                -translate-y-1/2
              "
              />
              <Input
                placeholder={t.common.search()}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="
                  border-border/40 bg-background/50
                  focus:bg-background
                  h-9 rounded-xl pl-9 transition-colors
                "
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {hasNoData && !hasNoResults && (
            <div className="
              text-muted-foreground border-border/40 bg-card/10 flex flex-col
              items-center justify-center border-b py-16 text-center
            "
            >
              <div className="bg-muted/20 mb-4 rounded-full p-4">
                <IconBuilding className="text-muted-foreground/50 size-8" />
              </div>
              <p className="text-lg font-medium">
                {t.tables.noClassroomsFound()}
              </p>
              <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
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
              <div className="
                hidden
                md:block
              "
              >
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow
                        key={headerGroup.id}
                        className="
                          border-border/40
                          hover:bg-transparent
                        "
                      >
                        {headerGroup.headers.map(header => (
                          <TableHead
                            key={header.id}
                            className="text-muted-foreground font-semibold"
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
                          className="
                            group
                            hover:bg-muted/30
                            border-border/40 cursor-pointer transition-colors
                          "
                          onClick={() =>
                            navigate({
                              to: `/spaces/classrooms/${row.original.id}`,
                            })}
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

              <ClassroomsTableMobileView data={data} />
            </>
          )}

          {!hasNoData && table.getPageCount() > 1 && (
            <div className="
              border-border/40 bg-muted/5 flex items-center justify-between
              border-t p-4
            "
            >
              <div className="text-muted-foreground text-sm font-medium">
                {t.common.showing()}
                {' '}
                <span className="text-foreground font-bold">
                  {table.getState().pagination.pageIndex
                    * table.getState().pagination.pageSize
                    + 1}
                </span>
                {' '}
                -
                {' '}
                <span className="text-foreground font-bold">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1)
                    * table.getState().pagination.pageSize,
                    data.length,
                  )}
                </span>
                {' '}
                {t.common.of()}
                {' '}
                <span className="text-foreground font-bold">{data.length}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 rounded-lg"
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 rounded-lg"
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ClassroomsTableDeleteDialog
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        handleDelete={handleDelete}
      />
    </div>
  )
}
