import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Edit, Eye, FileWarning, MoreHorizontal, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableSkeleton } from '@/components/hr/table-skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ConductSeverityBadge } from './conduct-severity-badge'
import { ConductStatusBadge } from './conduct-status-badge'
import { ConductTypeBadge } from './conduct-type-badge'

type ConductType = 'incident' | 'sanction' | 'reward' | 'note'
type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'
type ConductStatus = 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'

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
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ConductRecordTable({
  records,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ConductRecordTableProps) {
  const { t } = useTranslation()

  const columns = useMemo<ColumnDef<ConductRecord>[]>(
    () => [
      {
        accessorKey: 'incidentDate',
        header: t('conduct.date'),
        cell: ({ row }) => {
          const date = row.original.incidentDate
            ? new Date(row.original.incidentDate)
            : new Date(row.original.createdAt)

          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {date.toLocaleDateString()}
              </span>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'studentName',
        header: t('conduct.student'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.studentPhoto || undefined} alt={row.original.studentName} />
              <AvatarFallback>{row.original.studentName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                to="/students/$studentId"
                params={{ studentId: row.original.studentId }}
                className="font-medium hover:underline"
              >
                {row.original.studentName}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t('conduct.form.type'),
        cell: ({ row }) => <ConductTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: 'title',
        header: t('conduct.title'),
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[300px]">
            <span className="font-medium truncate" title={row.original.title}>{row.original.title}</span>
            <span className="text-xs text-muted-foreground truncate" title={row.original.description}>
              {row.original.description}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'severity',
        header: t('conduct.form.severity'),
        cell: ({ row }) => row.original.severity
          ? <ConductSeverityBadge severity={row.original.severity} />
          : <span className="text-muted-foreground">-</span>,
      },
      {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => <ConductStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('common.view')}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('common.edit')}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(row.original.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, onView, onEdit, onDelete],
  )

  const table = useReactTable({
    data: records,
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
    return <TableSkeleton columns={7} rows={5} />
  }

  if (records.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarning className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>{t('conduct.noRecords')}</EmptyTitle>
          <EmptyDescription>{t('conduct.noRecordsDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
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
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
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
      )}
    </div>
  )
}
