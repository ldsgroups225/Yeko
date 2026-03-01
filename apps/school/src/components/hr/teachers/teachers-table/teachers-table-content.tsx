import { IconSchool, IconSearch } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { EmptyState } from '@/components/hr/empty-state'
import { useTranslations } from '@/i18n'
import { useTeacherColumns } from './teachers-table-columns'
import { useTeachersTable } from './teachers-table-context'

export function TeachersTableContent() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state } = useTeachersTable()
  const { teachersData, filters, searchInput } = state
  const columns = useTeacherColumns()

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
            onClick: () => navigate({ to: '/teachers/new' }),
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
                  navigate({ to: `/teachers/${row.original.id}` })}
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
