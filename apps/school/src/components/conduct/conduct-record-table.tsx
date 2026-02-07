import type {
  ColumnDef,
  Row,
  Table as TanStackTable,
} from '@tanstack/react-table'
import {
  IconDots,
  IconEdit,
  IconFileAlert,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
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

import { ConductSeverityBadge } from './conduct-severity-badge'
import { ConductStatusBadge } from './conduct-status-badge'
import { ConductTypeBadge } from './conduct-type-badge'

type ConductType = 'incident' | 'sanction' | 'reward' | 'note'
type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'
type ConductStatus
  = | 'open'
    | 'investigating'
    | 'pending_decision'
    | 'resolved'
    | 'closed'
    | 'appealed'

export interface ConductRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string | null
  type: ConductType
  category: string
  title: string
  description: string
  severity?: ConductSeverity | null
  status: ConductStatus
  incidentDate?: string | null
  location?: string | null
  createdAt: string
}

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

  const columns = useMemo<ColumnDef<ConductRecord>[]>(
    () => [
      ...(selection
        ? [
            {
              id: 'select',
              header: ({ table }: { table: TanStackTable<ConductRecord> }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={value =>
                    table.toggleAllPageRowsSelected(!!value)}
                  aria-label={t.common.selectAll()}
                  className="translate-y-[2px] border-primary/50 data-[state=checked]:border-primary"
                />
              ),
              cell: ({ row }: { row: Row<ConductRecord> }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                  aria-label={t.common.selectRow()}
                  className="translate-y-[2px] border-primary/50 data-[state=checked]:border-primary"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
      {
        accessorKey: 'incidentDate',
        header: t.conduct.date(),
        cell: ({ row }) => {
          const date = row.original.incidentDate
            ? new Date(row.original.incidentDate)
            : new Date(row.original.createdAt)

          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-black tracking-tight text-sm">
                {date.toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                {date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'studentName',
        header: t.conduct.student(),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <AvatarImage
                src={row.original.studentPhoto || undefined}
                alt={row.original.studentName}
              />
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                {row.original.studentName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                to="/students/$studentId"
                params={{ studentId: row.original.studentId }}
                className="font-black tracking-tight hover:text-primary transition-colors"
              >
                {row.original.studentName}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t.conduct.form.type(),
        cell: ({ row }) => <ConductTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: 'title',
        header: t.conduct.title(),
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[300px]">
            <span
              className="font-bold tracking-tight text-sm truncate"
              title={row.original.title}
            >
              {row.original.title}
            </span>
            <span
              className="text-[10px] font-medium text-muted-foreground/60 truncate italic"
              title={row.original.description}
            >
              {row.original.description}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'severity',
        header: t.conduct.form.severity(),
        cell: ({ row }) =>
          row.original.severity
            ? (
                <ConductSeverityBadge severity={row.original.severity} />
              )
            : (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                  -
                </span>
              ),
      },
      {
        accessorKey: 'status',
        header: t.common.status(),
        cell: ({ row }) => <ConductStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconDots className="h-5 w-5" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40"
            >
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(row.original.id)}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-2"
                >
                  <IconEdit className="mr-2 h-4 w-4 text-primary/60" />
                  {t.common.edit()}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator className="bg-border/10" />
                  <DropdownMenuItem
                    onClick={() => onDelete(row.original.id)}
                    className="rounded-xl text-destructive focus:text-destructive font-bold uppercase tracking-widest text-[10px] py-2"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
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
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group border-b border-border/10 hover:bg-primary/5 transition-colors data-[selected=true]:bg-primary/5 cursor-pointer"
                onClick={() => onView?.(row.original.id)}
                data-selected={row.getIsSelected()}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </motion.tr>
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
