import type { ImportResult } from './types'
import type { ParsedSession } from '@/lib/excel-parser'
import { createContext, use } from 'react'

interface TimetableImportContextType {
  state: {
    file: File | null
    preview: ParsedSession[]
    allParsed: ParsedSession[]
    parseError: string | null
    result: ImportResult | null
    isPending: boolean
    countValid: number
  }
  actions: {
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleImport: () => void
    handleClose: () => void
    setFile: (file: File | null) => void
    downloadTemplate: () => void
  }
}

export const TimetableImportContext = createContext<TimetableImportContextType | undefined>(undefined)

export function useTimetableImport() {
  const context = use(TimetableImportContext)
  if (!context) {
    throw new Error('useTimetableImport must be used within a TimetableImportProvider')
  }
  return context
}
