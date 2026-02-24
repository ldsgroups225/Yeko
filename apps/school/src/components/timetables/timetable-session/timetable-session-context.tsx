import type { UseFormReturn } from 'react-hook-form'
import type { SessionFormInput, TimetableSessionDialogProps } from './types'
import { createContext, use } from 'react'

interface TimetableSessionContextType {
  state: {
    mode: 'create' | 'edit'
    initialData?: Partial<SessionFormInput> & { id?: string }
    subjects: TimetableSessionDialogProps['subjects']
    teachers: TimetableSessionDialogProps['teachers']
    classrooms: TimetableSessionDialogProps['classrooms']
    conflicts: TimetableSessionDialogProps['conflicts']
    isSubmitting?: boolean
    isDeleting?: boolean
  }
  actions: {
    form: UseFormReturn<SessionFormInput>
    handleSubmit: (data: SessionFormInput) => Promise<void>
    handleDelete: () => Promise<void>
    onOpenChange: (open: boolean) => void
  }
}

export const TimetableSessionContext = createContext<TimetableSessionContextType | undefined>(undefined)

export function useTimetableSession() {
  const context = use(TimetableSessionContext)
  if (!context) {
    throw new Error('useTimetableSession must be used within a TimetableSessionProvider')
  }
  return context
}
