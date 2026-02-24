import type { StudentFilters, StudentItem } from './types'
import { createContext, use } from 'react'

interface StudentsListContextType {
  state: {
    filters: StudentFilters
    search: string
    status: string
    gender: string
    page: number
    selectedStudent: StudentItem | null
    selectedRows: string[]
    deleteDialogOpen: boolean
    statusDialogOpen: boolean
    reEnrollDialogOpen: boolean
    importDialogOpen: boolean
    autoMatchDialogOpen: boolean
    isExporting: boolean
    data?: {
      data: StudentItem[]
      totalPages: number
      total: number
    }
    isPending: boolean
    isFiltered: boolean
  }
  actions: {
    setSearch: (val: string) => void
    setStatus: (val: string) => void
    setGender: (val: string) => void
    setPage: (val: number | ((prev: number) => number)) => void
    setSelectedStudent: (student: StudentItem | null) => void
    setSelectedRows: (rows: string[] | ((prev: string[]) => string[])) => void
    setDeleteDialogOpen: (open: boolean) => void
    setStatusDialogOpen: (open: boolean) => void
    setReEnrollDialogOpen: (open: boolean) => void
    setImportDialogOpen: (open: boolean) => void
    setAutoMatchDialogOpen: (open: boolean) => void
    handleClearFilters: () => void
    handleSelectAll: (checked: boolean) => void
    handleSelectRow: (id: string, checked: boolean) => void
    handleDelete: (student: StudentItem) => void
    handleStatusChange: (student: StudentItem) => void
    handleExport: () => Promise<void>
    handlePrefetchStudent: (studentId: string) => void
  }
}

export const StudentsListContext = createContext<StudentsListContextType | undefined>(undefined)

export function useStudentsList() {
  const context = use(StudentsListContext)
  if (!context) {
    throw new Error('useStudentsList must be used within a StudentsListProvider')
  }
  return context
}
