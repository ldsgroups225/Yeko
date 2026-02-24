import type { StaffFilters, StaffMember } from './types'
import { createContext, use } from 'react'

interface StaffTableContextType {
  state: {
    filters: StaffFilters
    searchInput: string
    isPending: boolean
    staffData?: {
      staff: StaffMember[]
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

export const StaffTableContext = createContext<StaffTableContextType | undefined>(undefined)

export function useStaffTable() {
  const context = use(StaffTableContext)
  if (!context) {
    throw new Error('useStaffTable must be used within a StaffTableProvider')
  }
  return context
}
