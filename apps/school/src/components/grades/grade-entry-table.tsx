import type { GradeStatus, GradeType } from '@/schemas/grade'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Cloud, CloudOff, Hash, Loader2, Save, Send, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslations } from '@/i18n'
import { gradesKeys } from '@/lib/queries/grades'
import { cn } from '@/lib/utils'
import {
  createBulkGrades,
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
}: GradeEntryTableProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [pendingChanges, setPendingChanges] = useState<Map<string, number>>(() => new Map())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_SAVE_DELAY = 30000

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade>()
    for (const grade of existingGrades) {
      map.set(grade.studentId, grade)
    }
    return map
  }, [existingGrades])

  const statistics = useMemo(() => {
    const values = existingGrades
      .filter(g => g.status === 'validated')
      .map(g => Number.parseFloat(g.value))

    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, below10: 0, above15: 0 }
    }

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      below10: values.filter(v => v < 10).length,
      above15: values.filter(v => v >= 15).length,
    }
  }, [existingGrades])

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

  const submitMutation = useMutation({
    mutationFn: (params: { gradeIds: string[] }) => submitGradesForValidation({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.byClass(classId, subjectId, termId) })
      setSelectedIds(new Set())
    },
  })

  const savePendingChanges = useCallback(() => {
    if (pendingChanges.size === 0)
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
    const draftGradeIds = existingGrades
      .filter(g => g.status === 'draft' && selectedIds.has(g.id))
      .map(g => g.id)

    if (draftGradeIds.length > 0) {
      submitMutation.mutate({ gradeIds: draftGradeIds })
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const draftIds = existingGrades
        .filter(g => g.status === 'draft')
        .map(g => g.id)
      setSelectedIds(new Set(draftIds))
    }
    else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (gradeId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(gradeId)
      }
      else {
        next.delete(gradeId)
      }
      return next
    })
  }

  const draftGrades = existingGrades.filter(g => g.status === 'draft')
  const allDraftsSelected = draftGrades.length > 0 && draftGrades.every(g => selectedIds.has(g.id))
  const someDraftsSelected = draftGrades.some(g => selectedIds.has(g.id))

  const isLoading = updateMutation.isPending || createBulkMutation.isPending || submitMutation.isPending

  return (
    <div className="space-y-6">
      <GradeStatisticsCard statistics={statistics} />

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b-border/40 hover:bg-muted/30">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={allDraftsSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label={t.common.select()}
                  disabled={draftGrades.length === 0}
                  className={cn(
                    'rounded-md border-border/60 transition-all',
                    someDraftsSelected && !allDraftsSelected && 'data-[state=checked]:bg-primary/50',
                  )}
                />
              </TableHead>
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
                const canSelect = grade?.status === 'draft'

                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group border-b border-border/20 last:border-0 hover:bg-primary/5 transition-colors"
                  >
                    <TableCell className="text-center">
                      {grade && (
                        <Checkbox
                          checked={selectedIds.has(grade.id)}
                          onCheckedChange={checked => handleSelectOne(grade.id, !!checked)}
                          disabled={!canSelect}
                          className="rounded-md border-border/60"
                          aria-label={`${t.common.select()} ${student.lastName} ${student.firstName}`}
                        />
                      )}
                    </TableCell>
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
          <AnimatePresence>
            {pendingChanges.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button
                  onClick={handleSavePending}
                  disabled={isLoading}
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
            disabled={selectedIds.size === 0 || isLoading}
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
            {selectedIds.size > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary-foreground/10 text-primary-foreground border-none px-2 rounded-full font-bold">
                {selectedIds.size}
              </Badge>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
