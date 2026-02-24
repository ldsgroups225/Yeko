import type { SchoolSubjectWithDetails } from '@repo/data-ops/queries/school-subjects'
import type { Table } from '@tanstack/react-table'
import { createContext, use } from 'react'

export interface SchoolSubjectListContextValue {
  state: {
    search: string
    categoryFilter: string
    statusFilter: string
    pickerOpen: boolean
    isPending: boolean
    isFiltered: boolean
    subjectsData: SchoolSubjectWithDetails[]
    table: Table<SchoolSubjectWithDetails>
    schoolYearId?: string
  }
  actions: {
    setSearch: (value: string) => void
    setCategoryFilter: (value: string) => void
    setStatusFilter: (value: string) => void
    setPickerOpen: (value: boolean) => void
    handleClearFilters: () => void
    toggleStatus: (id: string, status: 'active' | 'inactive') => void
  }
}

export const SchoolSubjectListContext = createContext<SchoolSubjectListContextValue | null>(null)

export function useSchoolSubjectList() {
  const context = use(SchoolSubjectListContext)
  if (!context) {
    throw new Error('useSchoolSubjectList must be used within a SchoolSubjectListProvider')
  }
  return context
}
