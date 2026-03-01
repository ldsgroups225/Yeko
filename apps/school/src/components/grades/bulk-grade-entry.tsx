import type { GradeType } from '@/schemas/grade'
import {
  IconFileSpreadsheet,
  IconHash,
  IconLoader2,
  IconUpload,
  IconUser,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
import { gradesKeys } from '@/lib/queries/grades'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { cn } from '@/lib/utils'
import { createBulkGrades } from '@/school/functions/student-grades'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
}

interface BulkGradeEntryProps {
  classId: string
  subjectId: string
  termId: string
  teacherId: string
  gradeType: GradeType
  weight: number
  description?: string
  gradeDate?: string
  students: Student[]
  onSuccess?: () => void
}

export function BulkGradeEntry({
  classId,
  subjectId,
  termId,
  teacherId,
  gradeType,
  weight,
  description,
  gradeDate,
  students,
  onSuccess,
}: BulkGradeEntryProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<Map<string, number | null>>(
    () => new Map(),
  )

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.bulkSave,
    mutationFn: (params: Parameters<typeof createBulkGrades>[0]['data']) =>
      createBulkGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.byClass(classId, subjectId, termId),
      })
      setOpen(false)
      setEntries(new Map())
      onSuccess?.()
    },
  })

  const handleValueChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : Number.parseFloat(value)
    if (
      numValue !== null
      && (Number.isNaN(numValue) || numValue < 0 || numValue > 20)
    ) {
      return
    }
    setEntries(prev => new Map(prev).set(studentId, numValue))
  }

  const handleSubmit = () => {
    const grades = Array.from(entries.entries())
      .filter(([_, value]) => value !== null)
      .map(([studentId, value]) => ({
        studentId,
        value: value as number,
      }))

    if (grades.length === 0)
      return

    createMutation.mutate({
      classId,
      subjectId,
      termId,
      teacherId,
      type: gradeType,
      weight,
      description,
      gradeDate,
      grades,
    })
  }

  const filledCount = Array.from(entries.values()).filter(
    v => v !== null,
  ).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(
          <Button
            variant="outline"
            className="
              border-border/40 bg-background/50
              hover:bg-background
              group h-10 rounded-xl px-4 shadow-sm
            "
          >
            <IconFileSpreadsheet className="
              text-primary mr-2 size-4 transition-transform
              group-hover:scale-110
            "
            />
            <span className="text-xs font-bold tracking-tight uppercase">
              {t.academic.grades.bulk.title()}
            </span>
          </Button>
        )}
      />
      <DialogContent className="
        border-border/40 bg-popover/90 max-h-[90vh] max-w-2xl overflow-hidden
        rounded-3xl p-0 shadow-2xl backdrop-blur-2xl
      "
      >
        <DialogHeader className="p-6 pb-0">
          <div className="mb-2 flex items-center gap-3">
            <div className="
              bg-primary/10 text-primary flex h-10 w-10 items-center
              justify-center rounded-2xl shadow-inner
            "
            >
              <IconFileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {t.academic.grades.bulk.title()}
              </DialogTitle>
              <DialogDescription className="
                text-muted-foreground text-xs font-medium tracking-widest
                uppercase opacity-70
              "
              >
                {t.academic.grades.bulk.description()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-border/20 overflow-hidden border-y px-6 py-4">
          <div className="custom-scrollbar max-h-[50vh] overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow className="
                  border-b-border/40
                  hover:bg-transparent
                "
                >
                  <TableHead className="py-4">
                    <div className="flex items-center gap-2">
                      <IconUser className="text-muted-foreground size-3.5" />
                      <span className="
                        text-[10px] font-bold tracking-tight uppercase
                      "
                      >
                        {t.academic.grades.averages.student()}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center gap-2">
                      <IconHash className="text-muted-foreground size-3.5" />
                      <span className="
                        text-[10px] font-bold tracking-tight uppercase
                      "
                      >
                        {t.academic.grades.averages.matricule()}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    <span className="
                      text-[10px] font-bold tracking-tight uppercase
                    "
                    >
                      {t.academic.grades.averages.average()}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="
                        group border-border/10
                        hover:bg-primary/5
                        border-b transition-colors
                        last:border-0
                      "
                    >
                      <TableCell className="
                        text-foreground py-4 text-sm font-bold
                      "
                      >
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="
                            bg-muted/40 border-border/20 rounded-md font-mono
                            text-[9px] font-bold tracking-widest
                          "
                        >
                          {student.matricule}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-center py-4">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          step={0.5}
                          placeholder="--"
                          className={cn(
                            `
                              border-border/40
                              focus-visible:ring-primary/30
                              group-hover:bg-background
                              h-10 w-24 rounded-xl text-center font-mono text-sm
                              transition-all
                            `,
                            entries.get(student.id) !== undefined
                            && entries.get(student.id) !== null
                            && 'border-primary/40 bg-primary/5 font-bold',
                          )}
                          value={entries.get(student.id) ?? ''}
                          onChange={e =>
                            handleValueChange(student.id, e.target.value)}
                          aria-label={`${t.academic.grades.averages.average()} ${student.lastName}`}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="
          bg-muted/20 gap-4 p-6
          sm:flex-row sm:items-center sm:justify-between
        "
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                `
                  flex h-8 items-center gap-2 rounded-full border px-3
                  text-[10px] font-bold tracking-widest uppercase shadow-sm
                  transition-all
                `,
                filledCount > 0
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-muted/50 border-border/40 text-muted-foreground',
              )}
            >
              <div
                className={cn(
                  'size-2 animate-pulse rounded-full',
                  filledCount > 0 ? 'bg-success' : 'bg-muted-foreground/40',
                )}
              />
              {t.academic.grades.bulk.filled({
                count: filledCount,
                total: students.length,
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="
                hover:bg-background/80
                rounded-xl text-[10px] font-bold tracking-widest uppercase
              "
            >
              {t.common.cancel()}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={filledCount === 0 || createMutation.isPending}
              className="
                shadow-primary/20 bg-primary
                hover:bg-primary/90
                rounded-xl px-6 text-[10px] font-bold tracking-widest uppercase
                shadow-lg
              "
            >
              {createMutation.isPending
                ? (
                    <IconLoader2 className="mr-2 size-3.5 animate-spin" />
                  )
                : (
                    <IconUpload className="mr-2 size-3.5" />
                  )}
              {t.common.save()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
