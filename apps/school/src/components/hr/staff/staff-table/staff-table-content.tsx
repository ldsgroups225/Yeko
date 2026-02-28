import type {
  ColumnDef,
} from '@tanstack/react-table'
import type { StaffMember } from './types'
import { formatDate } from '@repo/data-ops'
import {
  IconBriefcase,
  IconCalendar,
  IconDots,
  IconEdit,
  IconMail,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { EmptyState } from '@/components/hr/empty-state'
import { useTranslations } from '@/i18n'
import { useStaffTable } from './staff-table-context'

export function StaffTableContent() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useStaffTable()
  const { staffData, filters, searchInput } = state

  const columns = useMemo<ColumnDef<StaffMember>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t.hr.staff.name(),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-foreground font-semibold">
              {row.original.user.name}
            </span>
            <div className="
              text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs
            "
            >
              <IconMail className="h-3 w-3" />
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'position',
        header: t.hr.staff.position(),
        cell: ({ row }) => {
          const positionTranslations = {
            academic_coordinator: t.hr.positions.academic_coordinator,
            discipline_officer: t.hr.positions.discipline_officer,
            accountant: t.hr.positions.accountant,
            cashier: t.hr.positions.cashier,
            registrar: t.hr.positions.registrar,
            other: t.hr.positions.other,
          }
          return (
            <div className="
              bg-muted/50 border-border/40 inline-flex items-center gap-2
              rounded-full border px-2.5 py-0.5 text-xs font-medium
            "
            >
              <IconBriefcase className="text-primary h-3 w-3" />
              {positionTranslations[
                row.original.position as keyof typeof positionTranslations
              ]()}
            </div>
          )
        },
      },
      {
        accessorKey: 'department',
        header: t.hr.staff.department(),
        cell: ({ row }) => (
          <span className="text-foreground text-sm font-medium">
            {row.original.department || t.common.none()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t.hr.staff.status(),
        cell: ({ row }) => {
          const status = row.original.status
          const variants = {
            active: 'bg-success/10 text-success border-success/20',
            inactive: 'bg-muted text-muted-foreground border-muted',
            on_leave: 'bg-accent/10 text-accent-foreground border-accent/20',
          } as const
          return (
            <Badge
              variant="outline"
              className={`
                rounded-full border
                ${variants[status]}
                transition-colors
              `}
            >
              {{
                active: t.hr.status.active,
                inactive: t.hr.status.inactive,
                on_leave: t.hr.status.on_leave,
              }[status]()}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'hireDate',
        header: t.hr.staff.hireDate(),
        cell: ({ row }) => (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <IconCalendar className="h-3.5 w-3.5" />
            {row.original.hireDate
              ? formatDate(row.original.hireDate, 'MEDIUM')
              : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    hover:bg-primary/10 hover:text-primary
                    transition-colors
                  "
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              )}
            />
            <DropdownMenuContent
              align="end"
              className="
                bg-popover/90 border-border/40 min-w-[160px] backdrop-blur-2xl
              "
            >
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() =>
                  navigate({ to: `/users/staff/${row.original.id}/edit` })}
              >
                <IconEdit className="h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
              <DropdownMenuItem className="
                text-destructive
                focus:text-destructive focus:bg-destructive/10
                cursor-pointer gap-2
              "
              >
                <IconTrash className="h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  )

  const table = useReactTable({
    data: staffData?.staff || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: staffData?.totalPages || 0,
  })

  const hasNoData = !staffData?.staff || staffData.staff.length === 0
  const hasNoResults = hasNoData && (searchInput || filters.position || filters.status)

  if (hasNoData && !hasNoResults) {
    return (
      <div className="py-12">
        <EmptyState
          icon={IconBriefcase}
          title={t.hr.staff.noStaff()}
          description={t.hr.staff.noStaffDescription()}
          action={{
            label: t.hr.staff.addStaff(),
            onClick: () => navigate({ to: '/users/staff/new' }),
          }}
        />
      </div>
    )
  }

  if (hasNoResults) {
    return (
      <div className="py-12">
        <EmptyState
          icon={IconSearch}
          title={t.common.noResults()}
          description={t.common.noResultsDescription()}
        />
      </div>
    )
  }

  return (
    <div className="
      border-border/40 bg-background/30 overflow-hidden rounded-xl border
    "
    >
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-md">
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
                  className="
                    py-4 text-xs font-semibold tracking-wider uppercase
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
          <AnimatePresence mode="popLayout">
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.03,
                  ease: 'easeOut',
                }}
                className="
                  group
                  hover:bg-primary/5
                  border-border/40 cursor-pointer transition-colors
                "
                onClick={() =>
                  navigate({ to: `/users/staff/${row.original.id}` })}
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
    </div>
  )
}
