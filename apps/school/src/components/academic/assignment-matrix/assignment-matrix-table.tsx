import { CardContent } from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useTranslations } from '@/i18n'
import { AssignmentMatrixCell } from './assignment-matrix-cell'
import { useAssignmentMatrix } from './assignment-matrix-context'

export function AssignmentMatrixTable() {
  const t = useTranslations()
  const { state } = useAssignmentMatrix()
  const { classes, subjects } = state

  return (
    <CardContent className="p-0">
      <div
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10"
        role="region"
        aria-label={t.assignmentMatrix.ariaLabel()}
      >
        <Table aria-label={t.assignmentMatrix.ariaLabel()}>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead
                className="sticky left-0 bg-background/80 backdrop-blur-md z-20 min-w-[140px] border-r border-border/10"
                scope="col"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                  {t.common.classes()}
                </span>
              </TableHead>
              {subjects.map(subject => (
                <TableHead
                  key={subject.id}
                  className="text-center min-w-[160px] border-b border-border/10 py-4"
                  scope="col"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-foreground">
                      {subject.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {subject.shortName}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map(cls => (
              <TableRow
                key={cls.id}
                className="border-border/5 hover:bg-white/5 transition-colors group"
              >
                <TableCell
                  className="sticky left-0 bg-card/60 backdrop-blur-md z-10 font-medium border-r border-border/10 py-4 group-hover:bg-primary/5 transition-colors"
                  scope="row"
                >
                  {cls.name}
                </TableCell>
                {subjects.map(subject => (
                  <AssignmentMatrixCell
                    key={`${cls.id}-${subject.id}`}
                    classId={cls.id}
                    className={cls.name}
                    subjectId={subject.id}
                    subjectName={subject.name}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  )
}
