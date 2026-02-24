import type { StudentAttendanceEntry, StudentAttendanceStatus } from './types'
import { createContext, use } from 'react'

interface StudentAttendanceContextType {
  state: {
    entries: StudentAttendanceEntry[]
    filteredEntries: StudentAttendanceEntry[]
    searchQuery: string
    hasChanges: boolean
    isSaving: boolean
    className: string
    summary: {
      present: number
      late: number
      absent: number
      excused: number
    }
  }
  actions: {
    setSearchQuery: (query: string) => void
    handleStatusChange: (studentId: string, status: StudentAttendanceStatus) => void
    handleMarkAllPresent: () => void
    handleSave: () => void
  }
}

export const StudentAttendanceContext = createContext<StudentAttendanceContextType | undefined>(undefined)

export function useStudentAttendance() {
  const context = use(StudentAttendanceContext)
  if (!context) {
    throw new Error('useStudentAttendance must be used within a StudentAttendanceProvider')
  }
  return context
}
