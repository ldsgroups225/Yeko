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
      <SheetContent
        side="right"
        className="
          flex w-full flex-col gap-0 p-0
          sm:max-w-3xl!
        "
      >
        <SheetHeader className="
          bg-muted/10 flex flex-row items-center justify-between border-b px-6
          py-4 pr-12
        "
        >
          <div className="space-y-1 text-left">
            <SheetTitle className="flex items-center gap-2">
              <IconFileText className="text-primary h-5 w-5" />
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
            <span className="
              text-muted-foreground/60 text-[10px] font-black tracking-widest
              uppercase
            "
            >
              NB. ÉLÈVES
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-primary text-2xl font-black">{detailValidation?.pendingCount}</span>
              <span className="text-muted-foreground text-xs font-medium">{t.common.total().toLowerCase()}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              <div className="
                grid grid-cols-1 items-stretch gap-6 text-left
                md:grid-cols-3
              "
              >
                {/* Column 1: Evaluation Info */}
                <div className="flex h-full flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 shrink-0 rounded-full" />
                    <h3 className="
                      text-muted-foreground truncate text-sm font-semibold
                      tracking-wider uppercase
                    "
                    >
                      {t.academic.grades.validations.details.evaluation()}
                    </h3>
                  </div>
                  <div className="
                    bg-card flex-1 space-y-3 rounded-xl border p-4 shadow-sm
                  "
                  >
                    <div className="grid gap-1">
                      <Label className="
                        text-muted-foreground/60 text-[10px] font-black
                        tracking-widest uppercase
                      "
                      >
                        {t.academic.grades.entry.class()}
                      </Label>
                      <p className="truncate text-sm font-bold">
                        {detailValidation?.gradeName}
                        {' '}
                        {detailValidation?.className}
                      </p>
                    </div>

                    <div className="grid gap-1">
                      <Label className="
                        text-muted-foreground/60 text-[10px] font-black
                        tracking-widest uppercase
                      "
                      >
                        {t.academic.grades.entry.subject()}
                      </Label>
                      <div className="flex items-center gap-2 text-left">
                        <IconNotebook className="text-muted-foreground h-3 w-3" />
                        <p className="text-sm font-semibold italic">{detailValidation?.subjectName}</p>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <Label className="
                        text-muted-foreground/60 text-[10px] font-black
                        tracking-widest uppercase
                      "
                      >
                        Type d'évaluation
                      </Label>
                      <div className="flex items-center gap-2">
                        <IconFileText className="text-muted-foreground h-3 w-3" />
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
                <div className="flex h-full flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 shrink-0 rounded-full" />
                    <h3 className="
                      text-muted-foreground truncate text-sm font-semibold
                      tracking-wider uppercase
                    "
                    >
                      {t.academic.grades.validations.details.submission()}
                    </h3>
                  </div>
                  <div className="
                    bg-card flex-1 space-y-3 rounded-xl border p-4 shadow-sm
                  "
                  >
                    <div className="grid gap-1">
                      <Label className="
                        text-muted-foreground/60 text-[10px] font-black
                        tracking-widest uppercase
                      "
                      >
                        {t.academic.grades.validations.submittedBy()}
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="
                          bg-primary/10 flex h-5 w-5 shrink-0 items-center
                          justify-center rounded-full
                        "
                        >
                          <IconUser className="text-primary h-3 w-3" />
                        </div>
                        <p className="truncate text-sm font-bold">{detailValidation?.teacherName}</p>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <Label className="
                        text-muted-foreground/60 text-[10px] font-black
                        tracking-widest uppercase
                      "
                      >
                        {t.academic.grades.validations.submittedAt()}
                      </Label>
                      <div className="flex items-center gap-2">
                        <IconCalendar className="text-muted-foreground h-3 w-3" />
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
                <div className="flex h-full flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 shrink-0 rounded-full" />
                    <h3 className="
                      text-muted-foreground truncate text-sm font-semibold
                      tracking-wider uppercase
                    "
                    >
                      {t.academic.grades.validations.details.stats()}
                    </h3>
                  </div>
                  <div className="
                    bg-card flex flex-1 flex-col justify-between gap-4
                    rounded-xl border p-4 shadow-sm
                  "
                  >
                    <div className="
                      flex flex-1 items-center justify-center text-center
                    "
                    >
                      <div>
                        <Label className="
                          text-muted-foreground/60 mb-2 block text-[10px]
                          font-black tracking-widest uppercase
                        "
                        >
                          Moyenne
                        </Label>
                        <div className="
                          flex items-baseline justify-center gap-1
                        "
                        >
                          <span className="
                            text-primary text-5xl font-black tracking-tight
                          "
                          >
                            {detailValidation?.average}
                          </span>
                          <span className="
                            text-muted-foreground text-sm font-bold
                          "
                          >
                            /
                            {detailValidation?.maxGrade}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="
                      border-border/50 bg-muted/20 -mx-4 mt-auto -mb-4 grid
                      grid-cols-2 gap-4 border-t px-4 py-3 pt-4
                    "
                    >
                      <div className="flex flex-col gap-1">
                        <span className="
                          text-muted-foreground text-[10px] font-bold uppercase
                        "
                        >
                          Coefficient
                        </span>
                        <span className="text-sm font-black">{detailValidation?.coefficient}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="
                          text-muted-foreground text-[10px] font-bold uppercase
                        "
                        >
                          Note sur
                        </span>
                        <span className="text-sm font-black">{detailValidation?.maxGrade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Grades Section */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 h-1 w-8 rounded-full" />
                  <h3 className="
                    text-muted-foreground text-sm font-semibold tracking-wider
                    uppercase
                  "
                  >
                    Notes des élèves
                  </h3>
                </div>
                <div className="
                  bg-card overflow-hidden rounded-xl border shadow-sm
                "
                >
                  {isLoadingGrades
                    ? (
                        <div className="space-y-2 p-4">
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
                                <TableHead className="
                                  text-muted-foreground pl-6 text-[10px]
                                  font-black tracking-widest uppercase
                                "
                                >
                                  Élève
                                </TableHead>
                                <TableHead className="
                                  text-muted-foreground w-32 pr-6 text-center
                                  text-[10px] font-black tracking-widest
                                  uppercase
                                "
                                >
                                  Note
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentGradesData.map((grade: any) => (
                                <TableRow
                                  key={grade.id}
                                  className="border-border/10"
                                >
                                  <TableCell className="pl-6">
                                    <div className="flex items-center gap-3">
                                      <div className="
                                        bg-primary/10 flex h-8 w-8 shrink-0
                                        items-center justify-center rounded-full
                                      "
                                      >
                                        <IconUser className="
                                          text-primary h-4 w-4
                                        "
                                        />
                                      </div>
                                      <span className="text-sm font-bold">
                                        {grade.student?.firstName}
                                        {' '}
                                        {grade.student?.lastName}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="pr-6 text-center">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'px-3 py-1 text-sm font-black',
                                        Number(grade.value) < 10
                                          ? `bg-destructive/10 text-destructive`
                                          : `bg-primary/10 text-primary`,
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
                          <div className="
                            text-muted-foreground p-8 text-center text-sm
                          "
                          >
                            Aucune note trouvée pour cette validation.
                          </div>
                        )}
                </div>
              </div>
            </div>
          </div>

          <div className="
            bg-muted/10 mt-auto flex items-center justify-end gap-3 border-t
            px-6 py-4
          "
          >
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {t.common.close()}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="
                  border-destructive/30 text-destructive
                  hover:bg-destructive hover:text-destructive-foreground
                  rounded-xl shadow-sm transition-all
                "
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
                className="
                  bg-success
                  hover:bg-success/90
                  shadow-success/20 rounded-xl shadow-lg
                "
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
