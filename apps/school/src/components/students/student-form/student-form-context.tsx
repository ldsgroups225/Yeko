import type { UseFormReturn } from 'react-hook-form'
import type { StudentFormData } from './types'
import { createContext, use } from 'react'

interface StudentFormContextType {
  state: {
    mode: 'create' | 'edit'
    student?: StudentFormData & { id: string }
    isPending: boolean
    isUploadingPhoto: boolean
    showPhotoDialog: boolean
  }
  actions: {
    form: UseFormReturn<StudentFormData>
    onSubmit: (data: StudentFormData) => void
    setShowPhotoDialog: (show: boolean) => void
    setIsUploadingPhoto: (uploading: boolean) => void
    generateMatricule: () => void
    handlePhotoUpload: (file: File) => Promise<void>
  }
}

export const StudentFormContext = createContext<StudentFormContextType | undefined>(undefined)

export function useStudentForm() {
  const context = use(StudentFormContext)
  if (!context) {
    throw new Error('useStudentForm must be used within a StudentFormProvider')
  }
  return context
}
