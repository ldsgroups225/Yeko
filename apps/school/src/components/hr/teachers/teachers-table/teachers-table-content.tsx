import type {
  ColumnDef,
} from '@tanstack/react-table'
import type { Teacher } from './types'
import { formatDate } from '@repo/data-ops'
import {
  IconBook,
  IconCalendar,
  IconDots,
  IconEdit,
  IconMail,
  IconSchool,
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
import { useTeachersTable } from './teachers-table-context'

export function TeachersTableContent() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useTeachersTable()
  const { teachersData, filters, searchInput } = state

  const columns = useMemo<ColumnDef<Teacher>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: t.hr.teachers.name(),
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
        accessorKey: 'subjects',
        header: t.hr.teachers.subjects(),
        cell: ({ row }) => (
          <div className="flex max-w-[240px] flex-wrap gap-1.5">
            {row.original.subjects && row.original.subjects.length > 0
              ? (
                  row.original.subjects.slice(0, 3).map((subject: string) => (
                    <Badge
                      key={subject}
                      variant="outline"
                      className="
                        bg-primary/5 border-primary/10 text-primary px-2 py-0
                        text-[10px] font-medium
                      "
                    >
                      {subject}
                    </Badge>
                  ))
                )
              : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
            {row.original.subjects && row.original.subjects.length > 3 && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                +
                {' '}
                {row.original.subjects.length - 3}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'specialization',
        header: t.hr.teachers.specialization(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm">
            <IconBook className="text-muted-foreground h-3.5 w-3.5" />
            <span className="font-medium">
              {row.original.specialization || '-'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t.hr.teachers.status(),
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
        header: t.hr.teachers.hireDate(),
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
                  navigate({ to: `/users/teachers/${row.original.id}/edit` })}
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
    data: teachersData?.teachers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: teachersData?.totalPages || 0,
  })

  const hasNoData = !teachersData?.teachers || teachersData.teachers.length === 0
  const hasNoResults = hasNoData && (searchInput || filters.subjectId || filters.status)

  if (hasNoData && !hasNoResults) {
    return (
      <div className="py-12">
        <EmptyState
          icon={IconSchool}
          title={t.hr.teachers.noTeachers()}
          description={t.hr.teachers.noTeachersDescription()}
          action={{
            label: t.hr.teachers.addTeacher(),
            onClick: () => navigate({ to: '/users/teachers/new' }),
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
                  navigate({ to: `/users/teachers/${row.original.id}` })}
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
