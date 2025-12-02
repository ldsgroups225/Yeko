import { AlertCircle, CheckCircle2, Download, Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ImportRow {
  name: string
  email: string
  phone?: string
  roles: string
  status?: string
  error?: string
}

export function BulkImportUsers() {
  const { t } = useTranslation()
  const [, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ success: number, failed: number } | null>(null)

  const downloadTemplate = () => {
    const csv = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,school_administrator,active
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

        // Basic validation
        if (!row.name || row.name.length < 2) {
          row.error = t('validation.required')
        }
        else if (!row.email || !row.email.includes('@')) {
          row.error = t('validation.email')
        }
        else if (!row.roles) {
          row.error = t('hr.users.rolesRequired')
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
      toast.error(t('hr.users.invalidFileType'))
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const handleImport = async () => {
    setIsProcessing(true)

    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const validRows = preview.filter(row => !row.error)
    const invalidRows = preview.filter(row => row.error)

    setResults({
      success: validRows.length,
      failed: invalidRows.length,
    })

    setIsProcessing(false)

    if (validRows.length > 0) {
      toast.success(
        t('hr.users.importSuccess', { count: validRows.length }),
      )
    }
    if (invalidRows.length > 0) {
      toast.error(
        t('hr.users.importErrors', { count: invalidRows.length }),
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.users.step1')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('hr.users.downloadTemplateDescription')}
        </p>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t('hr.users.downloadTemplate')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('hr.users.step2')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('hr.users.uploadFileDescription')}
        </p>
        <div className="space-y-2">
          <Label htmlFor="csv-file">{t('hr.users.selectFile')}</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {preview.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('hr.users.step3')}</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {preview.length}
                {' '}
                {t('hr.users.totalRows')}
              </Badge>
              <Badge variant="default">
                {preview.filter(r => !r.error).length}
                {' '}
                {t('hr.users.validRows')}
              </Badge>
              {preview.filter(r => r.error).length > 0 && (
                <Badge variant="destructive">
                  {preview.filter(r => r.error).length}
                  {' '}
                  {t('hr.users.invalidRows')}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.users.status')}</TableHead>
                  <TableHead>{t('hr.common.name')}</TableHead>
                  <TableHead>{t('hr.common.email')}</TableHead>
                  <TableHead>{t('hr.common.phone')}</TableHead>
                  <TableHead>{t('hr.common.roles')}</TableHead>
                  <TableHead>{t('hr.users.error')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map(row => (
                  <TableRow key={row.email}>
                    <TableCell>
                      {row.error
                        ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )
                        : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone || '-'}</TableCell>
                    <TableCell>{row.roles}</TableCell>
                    <TableCell>
                      {row.error && (
                        <span className="text-sm text-destructive">{row.error}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null)
                setPreview([])
                setResults(null)
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                isProcessing
                || preview.filter(r => !r.error).length === 0
              }
            >
              {isProcessing
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('hr.users.importing')}
                    </>
                  )
                : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t('hr.users.importUsers')}
                    </>
                  )}
            </Button>
          </div>
        </div>
      )}

      {results && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('hr.users.importResults')}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>
                {results.success}
                {' '}
                {t('hr.users.usersImported')}
              </span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span>
                  {results.failed}
                  {' '}
                  {t('hr.users.usersFailed')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
