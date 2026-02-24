import type { ConductRecord } from './conduct-record-types'
import {
  IconFileAlert,
} from '@tabler/icons-react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { useTranslations } from '@/i18n'
import { getConductRecordColumns } from './conduct-record-columns'

interface ConductRecordTableProps {
  records: ConductRecord[]
  isPending?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  selection?: {
    selectedIds: Set<string>
    onSelectionChange: (ids: Set<string>) => void
  }
}

export function ConductRecordTable({
  records,
  isPending,
  onView,
  onEdit,
  onDelete,
  selection,
}: ConductRecordTableProps) {
  const t = useTranslations()

  const columns = useMemo(
    () => getConductRecordColumns({ t, onEdit, onDelete, selection }),
    [t, onEdit, onDelete, selection],
  )

  const rowSelection = useMemo(() => {
    if (!selection)
      return {}
    const selections: Record<string, boolean> = {}
    selection.selectedIds.forEach((id) => {
      selections[id] = true
    })
    return selections
  }, [selection])

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: row => row.id,
    enableRowSelection: !!selection,
    state: {
      rowSelection: selection ? rowSelection : {},
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onRowSelectionChange: (updater) => {
      if (!selection)
        return
      if (typeof updater === 'function') {
        const newSelection = updater(rowSelection)
        const newSet = new Set(
          Object.keys(newSelection).filter(k => newSelection[k]),
        )
        selection.onSelectionChange(newSet)
      }
      else {
        const newSet = new Set(Object.keys(updater).filter(k => updater[k]))
        selection.onSelectionChange(newSet)
      }
    },
  })

  if (isPending) {
    return <TableSkeleton columns={7} rows={5} />
  }

  if (records.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm p-20 flex flex-col items-center text-center"
      >
        <div className="p-6 rounded-full bg-background/50 mb-6 shadow-inner">
          <IconFileAlert className="size-12 text-muted-foreground/20" />
        </div>
        <h3 className="text-xl font-bold text-muted-foreground mb-2">
          {t.conduct.noRecords()}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t.conduct.noRecordsDescription()}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border/20 bg-muted/20"
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-6"
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
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className="group border-b border-border/10 hover:bg-primary/5 transition-colors data-[selected=true]:bg-primary/5 cursor-pointer"
                onClick={() => onView?.(row.original.id)}
                data-selected={row.getIsSelected()}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between py-4 px-6 bg-muted/10 border-t border-border/20">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            Page
            {' '}
            {table.getState().pagination.pageIndex + 1}
            {' '}
            of
            {' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-xl border-border/40 bg-background/50 hover:bg-background h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
            >
              {t.common.previous()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-xl border-border/40 bg-background/50 hover:bg-background h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
            >
              {t.common.next()}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
