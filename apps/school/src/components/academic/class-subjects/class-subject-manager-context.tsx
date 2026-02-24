import type { ClassSubjectItem, TeacherItem } from './types'
import { createContext, use } from 'react'

export interface ClassSubjectManagerContextValue {
  state: {
    classId: string
    className: string
    subjects: ClassSubjectItem[]
    teachers: TeacherItem[]
    isPending: boolean
    isDialogOpen: boolean
    isCopyDialogOpen: boolean
    subjectToDelete: { id: string, name: string } | null
    pendingAssignment: {
      subjectId: string
      subjectName: string
      teacherId: string
      teacherName: string
    } | null
    isAssigning: boolean
  }
  actions: {
    setIsDialogOpen: (open: boolean) => void
    setIsCopyDialogOpen: (open: boolean) => void
    setSubjectToDelete: (subject: { id: string, name: string } | null) => void
    setPendingAssignment: (assignment: {
      subjectId: string
      subjectName: string
      teacherId: string
      teacherName: string
    } | null) => void
    handleDelete: () => void
    handleAssign: () => void
  }
}

export const ClassSubjectManagerContext = createContext<ClassSubjectManagerContextValue | null>(null)

export function useClassSubjectManager() {
  const context = use(ClassSubjectManagerContext)
  if (!context) {
    throw new Error('useClassSubjectManager must be used within a ClassSubjectManagerProvider')
  }
  return context
}
