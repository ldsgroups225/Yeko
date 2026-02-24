import { AnimatePresence } from 'motion/react'
import { BulkImportPreview } from './bulk-import/bulk-import-preview'
import { BulkImportProvider } from './bulk-import/bulk-import-provider'
import { BulkImportResults } from './bulk-import/bulk-import-results'
import { BulkImportSteps } from './bulk-import/bulk-import-steps'

export function BulkImportUsers() {
  return (
    <BulkImportProvider>
      <div className="space-y-8">
        <BulkImportSteps />
        <AnimatePresence mode="wait">
          <BulkImportPreview />
        </AnimatePresence>
        <AnimatePresence>
          <BulkImportResults />
        </AnimatePresence>
      </div>
    </BulkImportProvider>
  )
}
