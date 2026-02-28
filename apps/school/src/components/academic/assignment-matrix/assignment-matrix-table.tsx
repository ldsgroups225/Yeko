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
        className="scrollbar-thin scrollbar-thumb-white/10 overflow-x-auto"
        role="region"
        aria-label={t.assignmentMatrix.ariaLabel()}
      >
        <Table aria-label={t.assignmentMatrix.ariaLabel()}>
          <TableHeader>
            <TableRow className="
              border-border/10
              hover:bg-transparent
            "
            >
              <TableHead
                className="
                  bg-background/80 border-border/10 sticky left-0 z-20
                  min-w-[140px] border-r backdrop-blur-md
                "
                scope="col"
              >
                <span className="
                  text-muted-foreground/70 text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.common.classes()}
                </span>
              </TableHead>
              {subjects.map(subject => (
                <TableHead
                  key={subject.id}
                  className="
                    border-border/10 min-w-[160px] border-b py-4 text-center
                  "
                  scope="col"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-foreground font-semibold">
                      {subject.name}
                    </span>
                    <span className="
                      text-muted-foreground text-[10px] uppercase
                    "
                    >
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
                className="
                  border-border/5 group transition-colors
                  hover:bg-white/5
                "
              >
                <TableCell
                  className="
                    bg-card/60 border-border/10
                    group-hover:bg-primary/5
                    sticky left-0 z-10 border-r py-4 font-medium
                    backdrop-blur-md transition-colors
                  "
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
