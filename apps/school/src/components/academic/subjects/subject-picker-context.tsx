import { createContext, use } from 'react'

export interface CoreSubject {
  id: string
  name: string
  shortName: string | null
  category: 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
}

interface SubjectPickerContextType {
  state: {
    search: string
    categoryFilter: string
    selectedIds: Set<string>
    subjects: CoreSubject[]
    isPending: boolean
    isAdding: boolean
    open: boolean
  }
  actions: {
    setSearch: (search: string) => void
    setCategoryFilter: (category: string) => void
    toggleSubject: (id: string) => void
    selectAllInCategory: (category: string) => void
    handleSubmit: () => void
    setOpen: (open: boolean) => void
  }
}

export const SubjectPickerContext = createContext<SubjectPickerContextType | undefined>(undefined)

export function useSubjectPicker() {
  const context = use(SubjectPickerContext)
  if (!context) {
    throw new Error('useSubjectPicker must be used within a SubjectPickerProvider')
  }
  return context
}
