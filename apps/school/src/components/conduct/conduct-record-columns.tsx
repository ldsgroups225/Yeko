import type { ColumnDef, Row, Table as TanStackTable } from '@tanstack/react-table'
import type { ConductRecord } from './conduct-record-types'
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ConductSeverityBadge } from './conduct-severity-badge'
import { ConductStatusBadge } from './conduct-status-badge'
import { ConductTypeBadge } from './conduct-type-badge'

interface GetColumnsProps {
  t: any
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  selection?: any
}

export function getConductRecordColumns({
  t,
  onEdit,
  onDelete,
  selection,
}: GetColumnsProps): ColumnDef<ConductRecord>[] {
  return [
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
                className="
                  border-primary/50
                  data-[state=checked]:border-primary
                  translate-y-[2px]
                "
              />
            ),
            cell: ({ row }: { row: Row<ConductRecord> }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
                aria-label={t.common.selectRow()}
                className="
                  border-primary/50
                  data-[state=checked]:border-primary
                  translate-y-[2px]
                "
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
            <span className="text-sm font-black tracking-tight">
              {date.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="
              text-muted-foreground/50 text-[10px] font-black tracking-widest
              uppercase
            "
            >
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
          <Avatar className="
            border-primary/10 h-9 w-9 border-2 shadow-inner transition-transform
            duration-500
            group-hover:scale-110
          "
          >
            <AvatarImage
              src={row.original.studentPhoto || undefined}
              alt={row.original.studentName}
            />
            <AvatarFallback className="
              bg-primary/5 text-primary text-[10px] font-black tracking-widest
              uppercase
            "
            >
              {row.original.studentName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              to="/students/$studentId"
              params={{ studentId: row.original.studentId }}
              className="
                hover:text-primary
                font-black tracking-tight transition-colors
              "
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
        <div className="flex max-w-[300px] flex-col">
          <span
            className="truncate text-sm font-bold tracking-tight"
            title={row.original.title}
          >
            {row.original.title}
          </span>
          <span
            className="
              text-muted-foreground/60 truncate text-[10px] font-medium italic
            "
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
              <span className="
                text-muted-foreground/30 text-[10px] font-black tracking-widest
                uppercase
              "
              >
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
                className="
                  hover:bg-primary/10 hover:text-primary
                  rounded-xl transition-colors
                "
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
            className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
          >
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(row.original.id)}
                className="
                  rounded-xl py-2 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                <IconEdit className="text-primary/60 mr-2 h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator className="bg-border/10" />
                <DropdownMenuItem
                  onClick={() => onDelete(row.original.id)}
                  className="
                    text-destructive
                    focus:text-destructive
                    rounded-xl py-2 text-[10px] font-bold tracking-widest
                    uppercase
                  "
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
  ]
}
