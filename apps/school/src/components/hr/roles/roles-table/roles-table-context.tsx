import type { Role, RolesFilters } from './types'
import { createContext, use } from 'react'

interface RolesTableContextType {
  state: {
    filters: RolesFilters
    searchInput: string
    isPending: boolean
    rolesData?: {
      roles: Role[]
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

export const RolesTableContext = createContext<RolesTableContextType | undefined>(undefined)

export function useRolesTable() {
  const context = use(RolesTableContext)
  if (!context) {
    throw new Error('useRolesTable must be used within a RolesTableProvider')
  }
  return context
}
