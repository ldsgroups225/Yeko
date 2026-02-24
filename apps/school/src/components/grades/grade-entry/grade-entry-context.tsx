import type { Grade, GradeEntryStatistics, Student } from './types'
import { createContext, use } from 'react'

interface GradeEntryContextType {
  state: {
    classId: string
    subjectId: string
    termId: string
    teacherId: string
    students: Student[]
    gradesByStudent: Map<string, Grade>
    pendingChanges: Map<string, number>
    statistics: GradeEntryStatistics
    isMissingTeacher: boolean
    autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
    isPendingAction: boolean
    isComplete: boolean
    subjectName: string
    teachers: any[]
  }
  actions: {
    handleGradeChange: (studentId: string, value: number) => void
    handleSavePending: () => void
    handleSubmitForValidation: () => void
    handleNewEvaluation: () => void
    confirmAssignment: (teacherId: string) => void
    confirmSubmit: () => void
    confirmReset: () => void
    setPendingAssignment: (assignment: { teacherId: string, teacherName: string } | null) => void
    setIsConfirmingSubmit: (show: boolean) => void
    setIsConfirmingReset: (show: boolean) => void
  }
  dialogs: {
    pendingAssignment: { teacherId: string, teacherName: string } | null
    isConfirmingSubmit: boolean
    isConfirmingReset: boolean
  }
}

export const GradeEntryContext = createContext<GradeEntryContextType | undefined>(undefined)

export function useGradeEntry() {
  const context = use(GradeEntryContext)
  if (!context) {
    throw new Error('useGradeEntry must be used within a GradeEntryProvider')
  }
  return context
}
