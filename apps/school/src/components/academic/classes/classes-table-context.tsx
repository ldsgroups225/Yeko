import type { Table } from '@tanstack/react-table'
import type { ClassItem } from './types'
import { createContext, use } from 'react'

export interface ClassesTableContextValue {
  state: {
    searchInput: string
    status: string
    selectedRows: string[]
    isAddDialogOpen: boolean
    isEditDialogOpen: boolean
    classToDelete: ClassItem | null
    classToEdit: ClassItem | null
    data: ClassItem[]
    isPending: boolean
    table: Table<ClassItem>
    isFiltered: boolean
  }
  actions: {
    setSearchInput: (val: string) => void
    setStatus: (val: string) => void
    setSelectedRows: (val: string[] | ((prev: string[]) => string[])) => void
    setIsAddDialogOpen: (val: boolean) => void
    setIsEditDialogOpen: (val: boolean) => void
    setClassToDelete: (val: ClassItem | null) => void
    setClassToEdit: (val: ClassItem | null) => void
    handleDelete: () => void
    handleSelectAll: (checked: boolean) => void
    handleSelectRow: (id: string, checked: boolean) => void
    handleClearFilters: () => void
    refetch: () => void
  }
}

export const ClassesTableContext = createContext<ClassesTableContextValue | null>(null)

export function useClassesTable() {
  const context = use(ClassesTableContext)
  if (!context) {
    throw new Error('useClassesTable must be used within a ClassesTableProvider')
  }
  return context
}
