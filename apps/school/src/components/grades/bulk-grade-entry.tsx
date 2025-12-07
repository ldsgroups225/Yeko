import type { GradeType } from '@/schemas/grade'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { gradesKeys } from '@/lib/queries/grades'
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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<Map<string, number | null>>(() => new Map())

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof createBulkGrades>[0]['data']) =>
      createBulkGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
      setOpen(false)
      setEntries(new Map())
      onSuccess?.()
    },
  })

  const handleValueChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : Number.parseFloat(value)
    if (numValue !== null && (Number.isNaN(numValue) || numValue < 0 || numValue > 20)) {
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

  const filledCount = Array.from(entries.values()).filter(v => v !== null).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 size-4" />
          {t('academic.grades.bulk.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('academic.grades.bulk.title')}</DialogTitle>
          <DialogDescription>
            {t('academic.grades.bulk.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('academic.grades.averages.student')}</TableHead>
                <TableHead className="w-24">{t('academic.grades.averages.matricule')}</TableHead>
                <TableHead className="w-28 text-center">{t('academic.grades.averages.average')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.lastName}
                    {' '}
                    {student.firstName}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {student.matricule}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      placeholder="--"
                      className="h-8 w-20 text-center"
                      value={entries.get(student.id) ?? ''}
                      onChange={e => handleValueChange(student.id, e.target.value)}
                      aria-label={`${t('academic.grades.averages.average')} ${student.lastName}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t('academic.grades.bulk.filled', { count: filledCount, total: students.length })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={filledCount === 0 || createMutation.isPending}
            >
              {createMutation.isPending
                ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )
                : (
                    <Upload className="mr-2 size-4" />
                  )}
              {t('common.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
