import { Checkbox } from '@workspace/ui/components/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table'
import { AnimatePresence } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useStudentsList } from './students-list-context'
import { StudentEmptyState } from './table/student-empty-state'
import { StudentMobileCard } from './table/student-mobile-card'
import { StudentMobileSkeleton, StudentTableRowSkeleton } from './table/student-skeleton'
import { StudentTableRow } from './table/student-table-row'

export function StudentsListTable() {
  const t = useTranslations()
  const { state, actions } = useStudentsList()
  const { data, isPending, selectedRows } = state
  const { handleSelectAll } = actions

  if (!isPending && (!data?.data || data.data.length === 0)) {
    return <StudentEmptyState />
  }

  return (
    <>
      <div className="
        space-y-3
        md:hidden
      "
      >
        {isPending
          ? (
              Array.from({ length: 5 }, (_, i) => <StudentMobileSkeleton key={`mobile-skeleton-${i}`} />)
            )
          : (
              <AnimatePresence>
                {data?.data.map((item, index: number) => (
                  <StudentMobileCard key={item.student.id} item={item} index={index} />
                ))}
              </AnimatePresence>
            )}
      </div>

      <div className="
        border-border/40 bg-card/40 hidden overflow-hidden rounded-xl border
        backdrop-blur-xl
        md:block
      "
      >
        <Table>
          <TableHeader className="bg-card/20">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={!!(data?.data && data.data.length > 0 && selectedRows.length === data.data.length)}
                  onCheckedChange={checked => handleSelectAll(!!checked)}
                  className="
                    border-primary/50
                    data-[state=checked]:border-primary
                  "
                />
              </TableHead>
              <TableHead className="text-foreground w-[250px] font-semibold">{t.students.student()}</TableHead>
              <TableHead className="text-foreground font-semibold">{t.students.matricule()}</TableHead>
              <TableHead className="text-foreground font-semibold">{t.students.class()}</TableHead>
              <TableHead className="text-foreground font-semibold">{t.students.gender()}</TableHead>
              <TableHead className="text-foreground font-semibold">{t.students.status()}</TableHead>
              <TableHead className="text-foreground font-semibold">{t.students.parents()}</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? (
                  Array.from({ length: 10 }, (_, i) => <StudentTableRowSkeleton key={`table-skeleton-${i}`} />)
                )
              : (
                  <AnimatePresence>
                    {data?.data.map((item, index: number) => (
                      <StudentTableRow key={item.student.id} item={item} index={index} />
                    ))}
                  </AnimatePresence>
                )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
