'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { studentsKeys } from '@/lib/queries/students'
import { bulkImportStudents } from '@/school/functions/students'
import { generateUUID } from '@/utils/generateUUID'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParsedStudent {
  firstName: string
  lastName: string
  dob: string
  gender?: 'M' | 'F' | 'other'
  matricule?: string
  birthPlace?: string
  nationality?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  previousSchool?: string
}

interface ImportResult {
  success: number
  errors: Array<{ row: number, error: string }>
}

const REQUIRED_COLUMNS = ['firstName', 'lastName', 'dob']
const OPTIONAL_COLUMNS = ['gender', 'matricule', 'birthPlace', 'nationality', 'address', 'emergencyContact', 'emergencyPhone', 'previousSchool']
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

function parseCSV(text: string): { headers: string[], rows: string[][] } {
  const lines = text.trim().split('\n')
  const headers = lines[0]?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) || []
  const rows = lines.slice(1).map((line) => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      }
      else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      }
      else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  })

  return { headers, rows }
}

function mapRowToStudent(headers: string[], row: string[]): ParsedStudent | null {
  const data: Record<string, string> = {}
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().replace(/[_\s]/g, '')
    const matchedColumn = ALL_COLUMNS.find(col =>
      col.toLowerCase() === normalizedHeader
      || normalizedHeader.includes(col.toLowerCase()),
    )
    if (matchedColumn && row[index]) {
      data[matchedColumn] = row[index] || ''
    }
  })

  // Check required fields
  if (!data.firstName || !data.lastName || !data.dob) {
    return null
  }

  // Normalize date format (try to parse various formats)
  let dob = data.dob
  if (dob.includes('/')) {
    const parts = dob.split('/')
    if (parts.length === 3) {
      // Assume DD/MM/YYYY or MM/DD/YYYY
      const [a, b, c] = parts
      if (Number(a) > 12) {
        dob = `${c}-${b?.padStart(2, '0')}-${a?.padStart(2, '0')}`
      }
      else {
        dob = `${c}-${a?.padStart(2, '0')}-${b?.padStart(2, '0')}`
      }
    }
  }

  // Normalize gender
  let gender: 'M' | 'F' | 'other' | undefined
  if (data.gender) {
    const g = data.gender.toUpperCase()
    if (g === 'M' || g === 'MALE' || g === 'MASCULIN' || g === 'H' || g === 'HOMME') {
      gender = 'M'
    }
    else if (g === 'F' || g === 'FEMALE' || g === 'FEMININ' || g === 'FEMME') {
      gender = 'F'
    }
  }

  return {
    firstName: data.firstName,
    lastName: data.lastName,
    dob,
    gender,
    matricule: data.matricule || undefined,
    birthPlace: data.birthPlace || undefined,
    nationality: data.nationality || undefined,
    address: data.address || undefined,
    emergencyContact: data.emergencyContact || undefined,
    emergencyPhone: data.emergencyPhone || undefined,
    previousSchool: data.previousSchool || undefined,
  }
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedStudent[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const importMutation = useMutation({
    mutationFn: (students: ParsedStudent[]) => bulkImportStudents({ data: students }),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      if (data.success > 0) {
        toast.success(t('students.importSuccess', { count: data.success }))
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile)
      return

    setFile(selectedFile)
    setParseError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const { headers, rows } = parseCSV(text)

        // Check for required columns
        const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[_\s]/g, ''))
        const hasFirstName = normalizedHeaders.some(h => h.includes('firstname') || h === 'prenom' || h === 'prénom')
        const hasLastName = normalizedHeaders.some(h => h.includes('lastname') || h === 'nom')
        const hasDob = normalizedHeaders.some(h => h.includes('dob') || h.includes('dateofbirth') || h.includes('datenaissance') || h === 'naissance')

        if (!hasFirstName || !hasLastName || !hasDob) {
          setParseError(t('students.importMissingColumns'))
          return
        }

        const parsed = rows
          .map(row => mapRowToStudent(headers, row))
          .filter((s): s is ParsedStudent => s !== null)

        if (parsed.length === 0) {
          setParseError(t('students.importNoValidRows'))
          return
        }

        setPreview(parsed.slice(0, 5))
      }
      catch {
        setParseError(t('students.importParseError'))
      }
    }
    reader.readAsText(selectedFile)
  }, [t])

  const handleImport = () => {
    if (!file)
      return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const { headers, rows } = parseCSV(text)
      const students = rows
        .map(row => mapRowToStudent(headers, row))
        .filter((s): s is ParsedStudent => s !== null)

      importMutation.mutate(students)
    }
    reader.readAsText(file)
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setParseError(null)
    setResult(null)
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const headers = ['lastName', 'firstName', 'dob', 'gender', 'birthPlace', 'nationality', 'address', 'emergencyContact', 'emergencyPhone', 'previousSchool']
    const example = ['Koné', 'Aminata', '2010-05-15', 'F', 'Abidjan', 'Ivoirien', '123 Rue Example', 'Papa Koné', '+2250701020304', 'École Primaire ABC']
    const csv = [headers.join(','), example.join(',')].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'students_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('students.importStudents')}</DialogTitle>
          <DialogDescription>{t('students.importStudentsDescription')}</DialogDescription>
        </DialogHeader>

        {result
          ? (
              <div className="space-y-4">
                <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
                  {result.errors.length > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{t('students.importComplete')}</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>{t('students.importSuccessCount', { count: result.success })}</li>
                      {result.errors.length > 0 && (
                        <li className="text-destructive">{t('students.importErrorCount', { count: result.errors.length })}</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>

                {result.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded border p-3 text-sm">
                    { }
                    {result.errors.slice(0, 10).map(err => (

                      <p key={`error-${generateUUID()}-${err.row}`} className="text-destructive">
                        {t('students.importRowError', { row: err.row, error: err.error })}
                      </p>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="mt-2 text-muted-foreground">{t('common.andMore', { count: result.errors.length - 10 })}</p>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button onClick={handleClose}>{t('common.close')}</Button>
                </DialogFooter>
              </div>
            )
          : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('students.downloadTemplate')}
                  </Button>
                </div>

                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  {file
                    ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                          <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {preview.length > 0 && t('students.importPreviewCount', { count: preview.length })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFile(null)
                              setPreview([])
                              setParseError(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    : (
                        <label className="cursor-pointer">
                          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 font-medium">{t('students.importDropFile')}</p>
                          <p className="text-sm text-muted-foreground">{t('students.importFileTypes')}</p>
                          <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                </div>

                {parseError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{parseError}</AlertDescription>
                  </Alert>
                )}

                {preview.length > 0 && (
                  <div className="rounded border">
                    <div className="border-b bg-muted/50 px-3 py-2 text-sm font-medium">{t('students.importPreview')}</div>
                    <div className="max-h-40 overflow-auto p-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-2 py-1 text-left">{t('students.lastName')}</th>
                            <th className="px-2 py-1 text-left">{t('students.firstName')}</th>
                            <th className="px-2 py-1 text-left">{t('students.dateOfBirth')}</th>
                            <th className="px-2 py-1 text-left">{t('students.gender')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          { }
                          {preview.map((s, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                            <tr key={`preview-${i}-${s.lastName}-${s.firstName}`} className="border-b last:border-0">
                              <td className="px-2 py-1">{s.lastName}</td>
                              <td className="px-2 py-1">{s.firstName}</td>
                              <td className="px-2 py-1">{s.dob}</td>
                              <td className="px-2 py-1">{s.gender || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
                  <Button onClick={handleImport} disabled={!file || preview.length === 0 || importMutation.isPending}>
                    {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('students.importStart')}
                  </Button>
                </DialogFooter>
              </div>
            )}
      </DialogContent>
    </Dialog>
  )
}
