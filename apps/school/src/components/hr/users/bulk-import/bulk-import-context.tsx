import type { ImportResults, ImportRow } from './types'
import { createContext, use } from 'react'

interface BulkImportContextType {
  state: {
    preview: ImportRow[]
    isProcessing: boolean
    results: ImportResults | null
  }
  actions: {
    downloadTemplate: () => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleImport: () => Promise<void>
    reset: () => void
  }
}

export const BulkImportContext = createContext<BulkImportContextType | undefined>(undefined)

export function useBulkImport() {
  const context = use(BulkImportContext)
  if (!context) {
    throw new Error('useBulkImport must be used within a BulkImportProvider')
  }
  return context
}
