import type { GradeStatus, GradeType } from '@/schemas/grade'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Cloud, CloudOff, Hash, Loader2, Plus, Save, Send, User, UserPlus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslations } from '@/i18n'
import {
  classSubjectsKeys,
  classSubjectsOptions,
} from '@/lib/queries/class-subjects'
import { gradesKeys } from '@/lib/queries/grades'
import { teacherOptions } from '@/lib/queries/teachers'
import { assignTeacherToClassSubject } from '@/school/functions/class-subjects'
import {
  createBulkGrades,
  deleteDraftGrades,
  submitGradesForValidation,
  updateGrade,
} from '@/school/functions/student-grades'

import { GradeCell } from './grade-cell'
import { GradeStatisticsCard } from './grade-statistics-card'
import { GradeStatusBadge } from './grade-status-badge'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
}

interface Grade {
  id: string
  studentId: string
  value: string
  status: GradeStatus
  type: GradeType
  description?: string | null
  gradeDate: string
  rejectionReason?: string | null
}

interface GradeEntryTableProps {
  classId: string
  subjectId: string
  termId: string
  teacherId: string
  gradeType: GradeType
  weight: number
  description?: string
  gradeDate?: string
  students: Student[]
  existingGrades: Grade[]
  onSaveComplete?: () => void
  onSubmissionComplete?: () => void
  onReset?: () => void
}

export function GradeEntryTable({
  classId,
  subjectId,
  termId,
  teacherId,
  gradeType,
  weight,
  description,
  gradeDate,
  students,
  existingGrades,
  onSaveComplete,
  onSubmissionComplete,
  onReset,
}: GradeEntryTableProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isMissingTeacher = !teacherId
  const [pendingChanges, setPendingChanges] = useState<Map<string, number>>(() => new Map())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pendingAssignment, setPendingAssignment] = useState<{
    teacherId: string
    teacherName: string
  } | null>(null)
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_SAVE_DELAY = 30000

  // Reset internal state when evaluation parameters change
  useEffect(() => {
    setPendingChanges(new Map())
  }, [gradeType, description, gradeDate])

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade>()
    for (const grade of existingGrades) {
      // Only show draft grades in editable cells - submitted/validated grades should not appear
      // This allows starting a fresh evaluation even if previous grades exist with same parameters
      if (
        grade.status === 'draft'
        && grade.type === gradeType
        && (grade.description || '') === (description || '')
        && grade.gradeDate === gradeDate
      ) {
        map.set(grade.studentId, grade)
      }
    }
    return map
  }, [existingGrades, gradeType, description, gradeDate])

  const isComplete = useMemo(() => {
    return students.length > 0 && students.every((student) => {
      const grade = gradesByStudent.get(student.id)
      const pendingValue = pendingChanges.get(student.id)
      const value = grade ? Number.parseFloat(grade.value) : pendingValue
      return value !== undefined && value !== null && !Number.isNaN(value) && value >= 0
    })
  }, [students, gradesByStudent, pendingChanges])

  // Realtime statistics including pending changes and draft grades
  const statistics = useMemo(() => {
    // Collect all values: from draft grades and from pending changes
    const allValues: number[] = []

    // Add values from draft grades in gradesByStudent
    for (const grade of gradesByStudent.values()) {
      allValues.push(Number.parseFloat(grade.value))
    }

    // Add pending changes (new grades not yet saved)
    for (const [studentId, value] of pendingChanges.entries()) {
      // Only add if student doesn't already have a grade (to avoid duplicates)
      if (!gradesByStudent.has(studentId)) {
        allValues.push(value)
      }
    }

    if (allValues.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, below10: 0, above15: 0 }
    }

    return {
      count: allValues.length,
      average: allValues.reduce((a, b) => a + b, 0) / allValues.length,
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      below10: allValues.filter(v => v < 10).length,
      above15: allValues.filter(v => v >= 15).length,
    }
  }, [gradesByStudent, pendingChanges])

  const updateMutation = useMutation({
    mutationFn: (params: { id: string, value: number }) => updateGrade({ data: { id: params.id, value: params.value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
    },
  })

  const createBulkMutation = useMutation({
    mutationFn: (params: Parameters<typeof createBulkGrades>[0]['data']) => createBulkGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
      setPendingChanges(new Map())
      setAutoSaveStatus('saved')
      onSaveComplete?.()
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    },
    onError: () => {
      setAutoSaveStatus('error')
    },
  })

  // Quick Teacher Assignment
  const { data: teachersData } = useQuery({
    ...teacherOptions.list({}, { page: 1, limit: 100 }),
    enabled: isMissingTeacher,
  })

  const { data: classSubjectsData } = useQuery(
    classSubjectsOptions.list({ classId }),
  )
  const currentSubject = classSubjectsData?.find(cs => cs.subject.id === subjectId)
  const subjectName = currentSubject?.subject.name || ''

  const assignMutation = useMutation({
    mutationFn: (teacherId: string) =>
      assignTeacherToClassSubject({ data: { classId, subjectId, teacherId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classSubjectsKeys.list({ classId }) })
      toast.success(t.academic.grades.assignment.success())
      setPendingAssignment(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.common.error())
    },
  })

  const teachers = teachersData?.teachers || []

  const submitMutation = useMutation({
    mutationFn: (params: { gradeIds: string[] }) => submitGradesForValidation({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
      toast.success(t.academic.grades.actions.submitSuccess())
      onSubmissionComplete?.()
    },
  })

  const effectiveGradeDate = gradeDate ?? new Date().toISOString().slice(0, 10)

  const deleteDraftMutation = useMutation({
    mutationFn: () => deleteDraftGrades({
      data: {
        classId,
        subjectId,
        termId,
        type: gradeType,
        gradeDate: effectiveGradeDate,
        description: description || undefined,
      },
    }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
      setPendingChanges(new Map())
      setIsConfirmingReset(false)
      onReset?.()
    },
  })

  const savePendingChanges = useCallback(() => {
    if (pendingChanges.size === 0 || !teacherId)
      return

    setAutoSaveStatus('saving')
    const grades = Array.from(pendingChanges.entries()).map(([studentId, value]) => ({
      studentId,
      value,
    }))

    createBulkMutation.mutate({
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
  }, [pendingChanges, classId, subjectId, termId, teacherId, gradeType, weight, description, gradeDate, createBulkMutation])

  useEffect(() => {
    if (pendingChanges.size === 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      return
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      savePendingChanges()
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [pendingChanges, savePendingChanges, AUTO_SAVE_DELAY])

  const handleGradeChange = (studentId: string, value: number) => {
    const existingGrade = gradesByStudent.get(studentId)

    if (existingGrade) {
      updateMutation.mutate({ id: existingGrade.id, value })
    }
    else {
      setPendingChanges(prev => new Map(prev).set(studentId, value))
    }
  }

  const handleSavePending = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    savePendingChanges()
  }

  const handleSubmitForValidation = () => {
    if (!isComplete) {
      toast.error(t.academic.grades.errors.incompleteGrades())
      return
    }
    setIsConfirmingSubmit(true)
  }

  const confirmSubmit = () => {
    // Get all draft grade IDs for the current evaluation
    const draftGradeIds = Array.from(gradesByStudent.values())
      .filter(g => g.status === 'draft')
      .map(g => g.id)

    if (draftGradeIds.length > 0) {
      submitMutation.mutate({ gradeIds: draftGradeIds })
    }
    setIsConfirmingSubmit(false)
  }

  const handleNewEvaluation = () => {
    // Check if there are pending changes OR draft grades in the database
    const hasDraftGrades = gradesByStudent.size > 0
    if (pendingChanges.size > 0 || hasDraftGrades) {
      setIsConfirmingReset(true)
    }
    else {
      onReset?.()
    }
  }

  const confirmReset = () => {
    // Delete draft grades from the database if they exist
    if (gradesByStudent.size > 0) {
      deleteDraftMutation.mutate()
    }
    else {
      // Just clear local state
      setPendingChanges(new Map())
      setIsConfirmingReset(false)
      onReset?.()
    }
  }

  const isLoading = updateMutation.isPending || createBulkMutation.isPending || submitMutation.isPending

  return (
    <div className="space-y-6">
      <GradeStatisticsCard statistics={statistics} />

      {isMissingTeacher && pendingChanges.size > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center flex-wrap gap-4 text-destructive"
        >
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <AlertTriangle className="size-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">{t.academic.grades.errors.noTeacherTitle()}</p>
              <p className="text-xs opacity-80 font-medium">
                {t.academic.grades.errors.noTeacherDescription()}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Select
              disabled={assignMutation.isPending}
              onValueChange={(val) => {
                const teacher = teachers.find(t => t.id === val)
                if (teacher) {
                  setPendingAssignment({
                    teacherId: val,
                    teacherName: teacher.user.name,
                  })
                }
              }}
            >
              <SelectTrigger className="bg-destructive/10 border-destructive/20 h-9 min-w-[200px] text-xs font-bold ring-offset-background focus:ring-destructive/30">
                <div className="flex items-center gap-2">
                  {assignMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <UserPlus className="size-3" />}
                  <SelectValue placeholder={t.academic.grades.assignment.quickAssign()} />
                </div>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-card/95 border-border/40">
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id} className="text-xs font-medium focus:bg-primary/5 focus:text-primary">
                    {teacher.user.name}
                  </SelectItem>
                ))}
                {teachers.length === 0 && (
                  <div className="p-2 text-center text-xs text-muted-foreground italic">
                    {t.common.noResults()}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b-border/40 hover:bg-muted/30">
              <TableHead className="min-w-[240px]">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-bold uppercase tracking-tight text-xs">{t.academic.grades.averages.student()}</span>
                </div>
              </TableHead>
              <TableHead className="w-24">
                <div className="flex items-center gap-1.5">
                  <Hash className="size-3.5 text-muted-foreground" />
                  <span className="font-bold uppercase tracking-tight text-xs">{t.academic.grades.averages.matricule()}</span>
                </div>
              </TableHead>
              <TableHead className="w-32 text-center">
                <span className="font-bold uppercase tracking-tight text-xs">{t.academic.grades.averages.average()}</span>
              </TableHead>
              <TableHead className="w-32 text-center">
                <span className="font-bold uppercase tracking-tight text-xs">{t.common.status()}</span>
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
                    className="group border-b border-border/20 last:border-0 hover:bg-primary/5 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {student.lastName}
                          {' '}
                          {student.firstName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] font-bold tracking-widest bg-muted/50 border-border/40 px-2 rounded-md">
                        {student.matricule}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <GradeCell
                          value={currentValue}
                          status={status}
                          onChange={value => handleGradeChange(student.id, value)}
                          disabled={isLoading}
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

      <motion.div
        layout
        className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md shadow-inner"
      >
        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {pendingChanges.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600"
              >
                <AlertTriangle className="size-4" />
                <span className="text-xs font-bold uppercase tracking-tight">
                  {t.academic.grades.validations.pendingCount({ count: pendingChanges.size })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {autoSaveStatus === 'saving' && (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
                >
                  <Loader2 className="size-3.5 animate-spin" />
                  {t.academic.grades.autoSave.saving()}
                </motion.span>
              )}
              {autoSaveStatus === 'saved' && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-600"
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Cloud className="size-3" />
                  </div>
                  {t.academic.grades.autoSave.saved()}
                </motion.span>
              )}
              {autoSaveStatus === 'error' && (
                <motion.span
                  key="error"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-xs font-bold text-destructive"
                >
                  <div className="p-1 rounded-full bg-destructive/10 border border-destructive/20">
                    <CloudOff className="size-3" />
                  </div>
                  {t.academic.grades.autoSave.error()}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleNewEvaluation}
            variant="outline"
            className="rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary"
          >
            <Plus className="mr-2 size-4" />
            {t.academic.grades.entry.newEvaluation()}
          </Button>

          <AnimatePresence>
            {pendingChanges.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button
                  onClick={handleSavePending}
                  disabled={isLoading || isMissingTeacher}
                  variant="outline"
                  className="rounded-xl border-amber-500/30 font-bold bg-amber-500/5 hover:bg-amber-500/10 text-amber-700"
                >
                  {createBulkMutation.isPending
                    ? (
                        <Loader2 className="mr-2 size-4 animate-spin text-amber-600" />
                      )
                    : (
                        <Save className="mr-2 size-4 text-amber-600" />
                      )}
                  {t.common.save()}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleSubmitForValidation}
            disabled={!isComplete || isLoading}
            className="rounded-xl font-bold shadow-lg shadow-primary/20 px-6"
          >
            {submitMutation.isPending
              ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )
              : (
                  <Send className="mr-2 size-4" />
                )}
            {t.common.submit()}
            {gradesByStudent.size > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary-foreground/10 text-primary-foreground border-none px-2 rounded-full font-bold">
                {gradesByStudent.size}
              </Badge>
            )}
          </Button>

        </div>
      </motion.div>

      <ConfirmationDialog
        open={!!pendingAssignment}
        onOpenChange={open => !open && setPendingAssignment(null)}
        title={t.dialogs.updateAssignment.title()}
        description={t.dialogs.updateAssignment.description({
          teacherName: pendingAssignment?.teacherName || '',
          subjectName,
        })}
        confirmLabel={t.dialogs.updateAssignment.confirm()}
        onConfirm={() => {
          if (pendingAssignment) {
            assignMutation.mutate(pendingAssignment.teacherId)
          }
        }}
        isLoading={assignMutation.isPending}
      />

      <ConfirmationDialog
        open={isConfirmingSubmit}
        onOpenChange={setIsConfirmingSubmit}
        title={t.academic.grades.validations.confirmSubmitTitle()}
        description={t.academic.grades.validations.confirmSubmitDescription({ count: gradesByStudent.size })}
        onConfirm={confirmSubmit}
        isLoading={submitMutation.isPending}
      />

      <ConfirmationDialog
        open={isConfirmingReset}
        onOpenChange={setIsConfirmingReset}
        title={t.academic.grades.entry.confirmResetTitle()}
        description={t.academic.grades.entry.confirmResetDescription({ count: pendingChanges.size + gradesByStudent.size })}
        onConfirm={confirmReset}
        variant="destructive"
        isLoading={deleteDraftMutation.isPending}
      />

    </div>
  )
}
