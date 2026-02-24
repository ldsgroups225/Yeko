import type { Teacher, TeachersFilters } from './types'
import { createContext, use } from 'react'

interface TeachersTableContextType {
  state: {
    filters: TeachersFilters
    searchInput: string
    isPending: boolean
    teachersData?: {
      teachers: Teacher[]
      totalPages: number
      total: number
      page: number
      limit: number
    }
  }
  actions: {
    setSearchInput: (input: string) => void
    handlePageChange: (page: number) => void
  }
}

export const TeachersTableContext = createContext<TeachersTableContextType | undefined>(undefined)

export function useTeachersTable() {
  const context = use(TeachersTableContext)
  if (!context) {
    throw new Error('useTeachersTable must be used within a TeachersTableProvider')
  }
  return context
}
