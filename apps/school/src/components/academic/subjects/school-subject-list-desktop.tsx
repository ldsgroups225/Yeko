import { IconBook } from '@tabler/icons-react'
import { flexRender } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useSchoolSubjectList } from './school-subject-list-context'

export function SchoolSubjectListDesktop() {
  const t = useTranslations()
  const { state } = useSchoolSubjectList()
  const { table, subjectsData, isFiltered } = state

  const hasNoData = subjectsData.length === 0

  if (hasNoData) {
    return (
      <div className="hidden rounded-xl border border-border/40 md:flex flex-col items-center justify-center py-24 text-center bg-card/40 backdrop-blur-xl">
        <div className="rounded-full bg-white/10 p-6 backdrop-blur-xl mb-4">
          <IconBook className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">
          {t.academic.subjects.noSubjects()}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {isFiltered
            ? t.academic.subjects.messages.adjustFilters()
            : t.academic.subjects.noSubjectsDescription()}
        </p>
      </div>
    )
  }

  return (
    <div className="hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl md:block overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-border/10"
            >
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="h-14 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70"
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.03 }}
                className="group border-border/5 hover:bg-primary/2 transition-colors"
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
