import type { AssignmentItem, SubjectItem, TeacherItem } from './types'
import { createContext, use } from 'react'

export interface AssignmentMatrixContextValue {
  state: {
    matrixData: AssignmentItem[]
    teachers: TeacherItem[]
    subjects: SubjectItem[]
    classes: { id: string, name: string }[]
    editingCell: { classId: string, subjectId: string } | null
    isPending: boolean
    assignmentMap: Map<string, { teacherId: string | null, teacherName: string | null }>
  }
  actions: {
    setEditingCell: (cell: { classId: string, subjectId: string } | null) => void
    assignTeacher: (data: { classId: string, subjectId: string, teacherId: string }) => void
    removeTeacher: (data: { classId: string, subjectId: string }) => void
    isTeacherOverloaded: (teacherId: string) => boolean
  }
}

export const AssignmentMatrixContext = createContext<AssignmentMatrixContextValue | null>(null)

export function useAssignmentMatrix() {
  const context = use(AssignmentMatrixContext)
  if (!context) {
    throw new Error('useAssignmentMatrix must be used within an AssignmentMatrixProvider')
  }
  return context
}
