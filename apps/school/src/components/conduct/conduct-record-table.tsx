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
        className="
          border-border/60 bg-card/20 flex flex-col items-center rounded-3xl
          border border-dashed p-20 text-center backdrop-blur-sm
        "
      >
        <div className="bg-background/50 mb-6 rounded-full p-6 shadow-inner">
          <IconFileAlert className="text-muted-foreground/20 size-12" />
        </div>
        <h3 className="text-muted-foreground mb-2 text-xl font-bold">
          {t.conduct.noRecords()}
        </h3>
        <p className="text-muted-foreground max-w-xs text-sm">
          {t.conduct.noRecordsDescription()}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        border-border/40 bg-card/30 overflow-hidden rounded-3xl border
        shadow-2xl backdrop-blur-xl
      "
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="
                  border-border/20 bg-muted/20 border-b
                  hover:bg-transparent
                "
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="
                      text-muted-foreground/60 h-14 px-6 text-[10px] font-black
                      tracking-[0.2em] uppercase
                    "
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
                className="
                  group border-border/10
                  hover:bg-primary/5
                  data-[selected=true]:bg-primary/5
                  cursor-pointer border-b transition-colors
                "
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
        <div className="
          bg-muted/10 border-border/20 flex items-center justify-between
          border-t px-6 py-4
        "
        >
          <div className="
            text-muted-foreground/40 text-[10px] font-black tracking-widest
            uppercase
          "
          >
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
              className="
                border-border/40 bg-background/50
                hover:bg-background
                h-10 rounded-xl px-6 text-[10px] font-black tracking-widest
                uppercase transition-all
              "
            >
              {t.common.previous()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="
                border-border/40 bg-background/50
                hover:bg-background
                h-10 rounded-xl px-6 text-[10px] font-black tracking-widest
                uppercase transition-all
              "
            >
              {t.common.next()}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
