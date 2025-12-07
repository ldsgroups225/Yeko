import type { GradeStatus, GradeType } from '@/schemas/grade'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Cloud, CloudOff, Loader2, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [pendingChanges, setPendingChanges] = useState<Map<string, number>>(() => new Map())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_SAVE_DELAY = 30000 // 30 seconds

  // Map existing grades by student ID
  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade>()
    for (const grade of existingGrades) {
      map.set(grade.studentId, grade)
    }
    return map
  }, [existingGrades])

  // Calculate statistics
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

  // Mutations
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
      // Reset status after 3 seconds
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

  // Save pending changes function
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

  // Auto-save effect
  useEffect(() => {
    if (pendingChanges.size === 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      return
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      savePendingChanges()
    }, AUTO_SAVE_DELAY)

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [pendingChanges, savePendingChanges, AUTO_SAVE_DELAY])

  const handleGradeChange = (studentId: string, value: number) => {
    const existingGrade = gradesByStudent.get(studentId)

    if (existingGrade) {
      // Update existing grade
      updateMutation.mutate({ id: existingGrade.id, value })
    }
    else {
      // Track pending new grade
      setPendingChanges(prev => new Map(prev).set(studentId, value))
    }
  }

  const handleSavePending = () => {
    // Clear auto-save timer when manually saving
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
    <div className="space-y-4">
      <GradeStatisticsCard statistics={statistics} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allDraftsSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label={t('common.select')}
                  disabled={draftGrades.length === 0}
                  className={cn(someDraftsSelected && !allDraftsSelected && 'data-[state=checked]:bg-primary/50')}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">{t('academic.grades.averages.student')}</TableHead>
              <TableHead className="w-20">{t('academic.grades.averages.matricule')}</TableHead>
              <TableHead className="w-24 text-center">{t('academic.grades.averages.average')}</TableHead>
              <TableHead className="w-24 text-center">{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const grade = gradesByStudent.get(student.id)
              const pendingValue = pendingChanges.get(student.id)
              const currentValue = grade ? Number.parseFloat(grade.value) : pendingValue ?? null
              const status = grade?.status ?? 'draft'
              const canSelect = grade?.status === 'draft'

              return (
                <TableRow key={student.id}>
                  <TableCell>
                    {grade && (
                      <Checkbox
                        checked={selectedIds.has(grade.id)}
                        onCheckedChange={checked => handleSelectOne(grade.id, !!checked)}
                        disabled={!canSelect}
                        aria-label={`${t('common.select')} ${student.lastName} ${student.firstName}`}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.lastName}
                    {' '}
                    {student.firstName}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {student.matricule}
                  </TableCell>
                  <TableCell className="text-center">
                    <GradeCell
                      value={currentValue}
                      status={status}
                      onChange={value => handleGradeChange(student.id, value)}
                      disabled={isLoading}
                      rejectionReason={grade?.rejectionReason ?? undefined}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <GradeStatusBadge status={status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {pendingChanges.size > 0 && (
            <span className="text-sm text-amber-600">
              {t('academic.grades.validations.pendingCount', { count: pendingChanges.size })}
            </span>
          )}
          {/* Auto-save status indicator */}
          {autoSaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              {t('academic.grades.autoSave.saving')}
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Cloud className="size-3" />
              {t('academic.grades.autoSave.saved')}
            </span>
          )}
          {autoSaveStatus === 'error' && (
            <span className="flex items-center gap-1 text-sm text-red-600">
              <CloudOff className="size-3" />
              {t('academic.grades.autoSave.error')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {pendingChanges.size > 0 && (
            <Button
              onClick={handleSavePending}
              disabled={isLoading}
            >
              {createBulkMutation.isPending
                ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )
                : (
                    <Save className="mr-2 size-4" />
                  )}
              {t('common.save')}
            </Button>
          )}
          <Button
            onClick={handleSubmitForValidation}
            disabled={selectedIds.size === 0 || isLoading}
            variant="default"
          >
            {submitMutation.isPending
              ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )
              : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
            {t('common.submit')}
            {' '}
            (
            {selectedIds.size}
            )
          </Button>
        </div>
      </div>
    </div>
  )
}
