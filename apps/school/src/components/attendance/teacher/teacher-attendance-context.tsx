import type { TeacherAttendanceEntry, TeacherAttendanceStatus } from './types'
import { createContext, use } from 'react'

interface TeacherAttendanceContextType {
  state: {
    entries: TeacherAttendanceEntry[]
    filteredEntries: TeacherAttendanceEntry[]
    searchQuery: string
    hasChanges: boolean
    isSaving: boolean
    summary: {
      present: number
      late: number
      absent: number
      excused: number
    }
  }
  actions: {
    setSearchQuery: (query: string) => void
    handleStatusChange: (teacherId: string, status: TeacherAttendanceStatus) => void
    handleNotesChange: (teacherId: string, notes: string) => void
    handleMarkAllPresent: () => void
    handleSave: () => void
  }
}

export const TeacherAttendanceContext = createContext<TeacherAttendanceContextType | undefined>(undefined)

export function useTeacherAttendance() {
  const context = use(TeacherAttendanceContext)
  if (!context) {
    throw new Error('useTeacherAttendance must be used within a TeacherAttendanceProvider')
  }
  return context
}
