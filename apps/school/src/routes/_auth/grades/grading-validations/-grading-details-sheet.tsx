import {
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconFileText,
  IconNotebook,
  IconUser,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { cn } from '@/lib/utils'

// Grade type for UI display
type GradeType = 'quiz' | 'test' | 'exam' | 'participation' | 'homework' | 'project'

// Grade type mapping with proper typing
const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  quiz: 'Interrogation',
  test: 'Devoir',
  exam: 'Examen',
  participation: 'Participation',
  homework: 'Devoir Maison',
  project: 'Projet',
} as const

interface GradingDetailsSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  detailValidation: any
  studentGradesData: any[]
  isLoadingGrades: boolean
  onValidate: (validation: any) => void
  onReject: (validation: any) => void
  t: any
}

export function GradingDetailsSheet({
  isOpen,
  onOpenChange,
  detailValidation,
  studentGradesData,
  isLoadingGrades,
  onValidate,
  onReject,
  t,
}: GradingDetailsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-3xl! w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b bg-muted/10 px-6 py-4 pr-12">
          <div className="space-y-1 text-left">
            <SheetTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5 text-primary" />
              {t.academic.grades.validations.viewDetails()}
            </SheetTitle>
            <SheetDescription>
              {detailValidation?.gradeName}
              {' '}
              -
              {' '}
              {detailValidation?.className}
            </SheetDescription>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              NB. ÉLÈVES
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">{detailValidation?.pendingCount}</span>
              <span className="text-xs font-medium text-muted-foreground">{t.common.total().toLowerCase()}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
                {/* Column 1: Evaluation Info */}
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {t.academic.grades.validations.details.evaluation()}
                    </h3>
                  </div>
                  <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm space-y-3">
                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {t.academic.grades.entry.class()}
                      </Label>
                      <p className="text-sm font-bold truncate">
                        {detailValidation?.gradeName}
                        {' '}
                        {detailValidation?.className}
                      </p>
                    </div>

                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {t.academic.grades.entry.subject()}
                      </Label>
                      <div className="flex items-center gap-2 text-left">
                        <IconNotebook className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-semibold italic">{detailValidation?.subjectName}</p>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Type d'évaluation
                      </Label>
                      <div className="flex items-center gap-2">
                        <IconFileText className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-semibold">
                          {studentGradesData?.[0]?.type
                            ? (GRADE_TYPE_LABELS[studentGradesData[0].type as GradeType] || studentGradesData[0].type)
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Submission Info */}
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {t.academic.grades.validations.details.submission()}
                    </h3>
                  </div>
                  <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm space-y-3">
                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {t.academic.grades.validations.submittedBy()}
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <IconUser className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-sm font-bold truncate">{detailValidation?.teacherName}</p>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {t.academic.grades.validations.submittedAt()}
                      </Label>
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {detailValidation?.submittedAt
                            ? new Date(detailValidation.submittedAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Stats */}
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1 w-8 rounded-full bg-primary/20 shrink-0" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {t.academic.grades.validations.details.stats()}
                    </h3>
                  </div>
                  <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex flex-1 items-center justify-center text-center">
                      <div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2">
                          Moyenne
                        </Label>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-black text-primary tracking-tight">{detailValidation?.average}</span>
                          <span className="text-sm font-bold text-muted-foreground">
                            /
                            {detailValidation?.maxGrade}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 bg-muted/20 -mx-4 -mb-4 px-4 py-3 mt-auto">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Coefficient</span>
                        <span className="text-sm font-black">{detailValidation?.coefficient}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Note sur</span>
                        <span className="text-sm font-black">{detailValidation?.maxGrade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Grades Section */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-primary/20" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes des élèves
                  </h3>
                </div>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  {isLoadingGrades
                    ? (
                        <div className="p-4 space-y-2">
                          {[1, 2, 3, 4, 5].map(item => (
                            <Skeleton key={item} className="h-10 w-full" />
                          ))}
                        </div>
                      )
                    : studentGradesData && studentGradesData.length > 0
                      ? (
                          <Table>
                            <TableHeader className="bg-muted/20">
                              <TableRow>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-6">
                                  Élève
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center w-32 pr-6">
                                  Note
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentGradesData.map((grade: any) => (
                                <TableRow key={grade.id} className="border-border/10">
                                  <TableCell className="pl-6">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <IconUser className="h-4 w-4 text-primary" />
                                      </div>
                                      <span className="text-sm font-bold">
                                        {grade.student?.firstName}
                                        {' '}
                                        {grade.student?.lastName}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center pr-6">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'font-black text-sm px-3 py-1',
                                        Number(grade.value) < 10 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                                      )}
                                    >
                                      {Number(grade.value).toFixed(2)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )
                      : (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            Aucune note trouvée pour cette validation.
                          </div>
                        )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-3 border-t bg-muted/10 px-6 py-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {t.common.close()}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                onClick={() => {
                  if (detailValidation) {
                    onOpenChange(false)
                    onReject(detailValidation)
                  }
                }}
              >
                <IconCircleX className="mr-2 size-4" />
                {t.academic.grades.validations.reject()}
              </Button>
              <Button
                variant="default"
                className="rounded-xl bg-success hover:bg-success/90 shadow-lg shadow-success/20"
                onClick={() => {
                  if (detailValidation) {
                    onOpenChange(false)
                    onValidate(detailValidation)
                  }
                }}
              >
                <IconCircleCheck className="mr-2 size-4" />
                {t.academic.grades.validations.validate()}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
