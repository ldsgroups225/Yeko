import type { Grade, Student } from './types'
import type { GradeType } from '@/schemas/grade'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { classSubjectsOptions } from '@/lib/queries/class-subjects'
import { teacherOptions } from '@/lib/queries/teachers'
import { GradeEntryContext } from './grade-entry-context'
import { useGradeEntryMutations } from './use-grade-entry-mutations'
import { useGradeEntryStatistics } from './use-grade-entry-statistics'

interface GradeEntryProviderProps {
  children: React.ReactNode
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

export function GradeEntryProvider({
  children,
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
}: GradeEntryProviderProps) {
  const t = useTranslations()
  const isMissingTeacher = !teacherId
  const [pendingChanges, setPendingChanges] = useState<Map<string, number>>(() => new Map())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pendingAssignment, setPendingAssignment] = useState<{ teacherId: string, teacherName: string } | null>(null)
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_SAVE_DELAY = 30000

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade>()
    for (const grade of existingGrades) {
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
    return (
      students.length > 0
      && students.every((student) => {
        const grade = gradesByStudent.get(student.id)
        const pendingValue = pendingChanges.get(student.id)
        const value = grade ? Number.parseFloat(grade.value) : pendingValue
        return value !== undefined && value !== null && !Number.isNaN(value) && value >= 0
      })
    )
  }, [students, gradesByStudent, pendingChanges])

  const statistics = useGradeEntryStatistics(gradesByStudent, pendingChanges)

  const {
    updateMutation,
    createBulkMutation,
    submitMutation,
    deleteDraftMutation,
    assignMutation,
  } = useGradeEntryMutations({
    classId,
    subjectId,
    termId,
    gradeType,
    gradeDate,
    description,
    onSaveSuccess: () => {
      setPendingChanges(new Map())
      setAutoSaveStatus('saved')
      onSaveComplete?.()
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    },
    onSubmissionSuccess: () => onSubmissionComplete?.(),
    onResetSuccess: () => {
      setPendingChanges(new Map())
      setIsConfirmingReset(false)
      onReset?.()
    },
  })

  const { data: teachersData } = useQuery({
    ...teacherOptions.list({}, { page: 1, limit: 100 }),
    enabled: isMissingTeacher,
  })

  const { data: classSubjectsData } = useQuery(classSubjectsOptions.list({ classId }))
  const teachers = teachersData ? teachersData.teachers : []
  const currentSubject = classSubjectsData?.find(cs => cs.subject.id === subjectId)
  const subjectName = currentSubject?.subject.name || ''

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
    if (autoSaveTimerRef.current)
      clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => savePendingChanges(), AUTO_SAVE_DELAY)
    return () => {
      if (autoSaveTimerRef.current)
        clearTimeout(autoSaveTimerRef.current)
    }
  }, [pendingChanges, savePendingChanges, AUTO_SAVE_DELAY])

  const actions = {
    handleGradeChange: (studentId: string, value: number) => {
      const existingGrade = gradesByStudent.get(studentId)
      if (existingGrade)
        updateMutation.mutate({ id: existingGrade.id, value })
      else setPendingChanges(prev => new Map(prev).set(studentId, value))
    },
    handleSavePending: () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      savePendingChanges()
    },
    handleSubmitForValidation: () => {
      if (!isComplete) {
        toast.error(t.academic.grades.errors.incompleteGrades())
        return
      }
      setIsConfirmingSubmit(true)
    },
    handleNewEvaluation: () => {
      if (pendingChanges.size > 0 || gradesByStudent.size > 0)
        setIsConfirmingReset(true)
      else onReset?.()
    },
    confirmAssignment: (newTeacherId: string) => {
      assignMutation.mutate(newTeacherId, {
        onSuccess: () => setPendingAssignment(null),
      })
    },
    confirmSubmit: () => {
      const draftGradeIds = Array.from(gradesByStudent.values())
        .filter(g => g.status === 'draft')
        .map(g => g.id)
      if (draftGradeIds.length > 0)
        submitMutation.mutate({ gradeIds: draftGradeIds })
      setIsConfirmingSubmit(false)
    },
    confirmReset: () => {
      if (gradesByStudent.size > 0) {
        deleteDraftMutation.mutate()
      }
      else {
        setPendingChanges(new Map())
        setIsConfirmingReset(false)
        onReset?.()
      }
    },
    setPendingAssignment,
    setIsConfirmingSubmit,
    setIsConfirmingReset,
  }

  const isPendingAction = updateMutation.isPending || createBulkMutation.isPending || submitMutation.isPending

  return (
    <GradeEntryContext
      value={{
        state: {
          classId,
          subjectId,
          termId,
          teacherId,
          students,
          gradesByStudent,
          pendingChanges,
          statistics,
          isMissingTeacher,
          autoSaveStatus,
          isPendingAction,
          isComplete,
          subjectName,
          teachers,
        },
        actions,
        dialogs: {
          pendingAssignment,
          isConfirmingSubmit,
          isConfirmingReset,
        },
      }}
    >
      {children}
    </GradeEntryContext>
  )
}
