import type { ImportResults, ImportRow } from './types'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { BulkImportContext } from './bulk-import-context'

export function BulkImportProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImportResults | null>(null)

  const downloadTemplate = () => {
    const csv = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,school_director,active
Jane Smith,jane@example.com,+225 05 06 07 08,academic_coordinator,active`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length === 0)
        return

      const rows: ImportRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(',').map(v => v.trim()) || []
        const row: ImportRow = {
          name: values[0] || '',
          email: values[1] || '',
          phone: values[2] || '',
          roles: values[3] || '',
          status: values[4] || 'active',
        }

        if (!row.name || row.name.length < 2) {
          row.error = t.validation.required()
        }
        else if (!row.email || !row.email.includes('@')) {
          row.error = t.validation.email()
        }
        else if (!row.roles) {
          row.error = t.hr.users.rolesRequired()
        }

        rows.push(row)
      }
      setPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile)
      return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error(t.hr.users.invalidFileType())
      return
    }
    parseCSV(selectedFile)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const validRows = preview.filter(row => !row.error)
    const invalidRows = preview.filter(row => row.error)

    setResults({
      success: validRows.length,
      failed: invalidRows.length,
    })

    setIsProcessing(false)

    if (validRows.length > 0) {
      toast.success(t.hr.users.importSuccess({ count: validRows.length }))
    }
    if (invalidRows.length > 0) {
      toast.error(t.hr.users.importErrors({ count: invalidRows.length }))
    }
  }

  const reset = () => {
    setPreview([])
    setResults(null)
  }

  return (
    <BulkImportContext
      value={{
        state: { preview, isProcessing, results },
        actions: { downloadTemplate, handleFileChange, handleImport, reset },
      }}
    >
      {children}
    </BulkImportContext>
  )
}
