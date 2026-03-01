import { IconHash, IconUser } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
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
import { GradeCell } from '../grade-cell'
import { GradeStatusBadge } from '../grade-status-badge'
import { useGradeEntry } from './grade-entry-context'

export function GradeEntryTableContent() {
  const t = useTranslations()
  const { state, actions } = useGradeEntry()
  const { students, gradesByStudent, pendingChanges, isPendingAction } = state
  const { handleGradeChange } = actions

  return (
    <div className="
      border-border/40 bg-card/30 overflow-hidden overflow-x-auto rounded-2xl
      border shadow-xl backdrop-blur-xl
    "
    >
      <Table>
        <TableHeader>
          <TableRow className="
            bg-muted/30 border-b-border/40
            hover:bg-muted/30
          "
          >
            <TableHead className="min-w-[240px]">
              <div className="flex items-center gap-2">
                <IconUser className="text-muted-foreground size-4" />
                <span className="text-xs font-bold tracking-tight uppercase">{t.academic.grades.averages.student()}</span>
              </div>
            </TableHead>
            <TableHead className="w-24">
              <div className="flex items-center gap-1.5">
                <IconHash className="text-muted-foreground size-3.5" />
                <span className="text-xs font-bold tracking-tight uppercase">{t.academic.grades.averages.matricule()}</span>
              </div>
            </TableHead>
            <TableHead className="w-32 text-center">
              <span className="text-xs font-bold tracking-tight uppercase">{t.academic.grades.averages.average()}</span>
            </TableHead>
            <TableHead className="w-32 text-center">
              <span className="text-xs font-bold tracking-tight uppercase">{t.common.status()}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {students.map((student, index) => {
              const grade = gradesByStudent.get(student.id)
              const pendingValue = pendingChanges.get(student.id)
              const currentValue = grade ? Number.parseFloat(grade.value) : pendingValue ?? null
              const status = grade?.status ?? 'draft'

              return (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="
                    group border-border/20
                    hover:bg-primary/5
                    border-b transition-colors
                    last:border-0
                  "
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="
                        text-foreground
                        group-hover:text-primary
                        font-bold transition-colors
                      "
                      >
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="
                        bg-muted/50 border-border/40 rounded-md px-2 font-mono
                        text-[10px] font-bold tracking-widest
                      "
                    >
                      {student.matricule}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <GradeCell
                        value={currentValue}
                        status={status}
                        onChange={value => handleGradeChange(student.id, value)}
                        disabled={isPendingAction}
                        rejectionReason={grade?.rejectionReason ?? undefined}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <GradeStatusBadge status={status} />
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  )
}
