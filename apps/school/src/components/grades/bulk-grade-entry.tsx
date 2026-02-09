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
            className="rounded-xl border-border/40 bg-background/50 hover:bg-background shadow-sm h-10 px-4 group"
          >
            <IconFileSpreadsheet className="mr-2 size-4 text-primary transition-transform group-hover:scale-110" />
            <span className="font-bold tracking-tight uppercase text-xs">
              {t.academic.grades.bulk.title()}
            </span>
          </Button>
        )}
      />
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl border-border/40 bg-popover/90 backdrop-blur-2xl shadow-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <IconFileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {t.academic.grades.bulk.title()}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">
                {t.academic.grades.bulk.description()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 overflow-hidden border-y border-border/20">
          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border/40 hover:bg-transparent">
                  <TableHead className="py-4">
                    <div className="flex items-center gap-2">
                      <IconUser className="size-3.5 text-muted-foreground" />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t.academic.grades.averages.student()}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center gap-2">
                      <IconHash className="size-3.5 text-muted-foreground" />
                      <span className="font-bold uppercase tracking-tight text-[10px]">
                        {t.academic.grades.averages.matricule()}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center">
                    <span className="font-bold uppercase tracking-tight text-[10px]">
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
                      className="group border-b border-border/10 last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="py-4 font-bold text-sm text-foreground">
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] font-bold tracking-widest bg-muted/40 border-border/20 rounded-md"
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
                            'h-10 w-24 text-center font-mono text-sm rounded-xl border-border/40 transition-all focus-visible:ring-primary/30 group-hover:bg-background',
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

        <DialogFooter className="p-6 bg-muted/20 sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 px-3 items-center gap-2 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all',
                filledCount > 0
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-muted/50 border-border/40 text-muted-foreground',
              )}
            >
              <div
                className={cn(
                  'size-2 rounded-full animate-pulse',
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
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-background/80"
            >
              {t.common.cancel()}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={filledCount === 0 || createMutation.isPending}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 px-6"
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
