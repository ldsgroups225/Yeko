'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

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

// Column mapping for flexible header matching
const COLUMN_MAPPINGS: Record<string, string[]> = {
  firstName: ['firstname', 'first_name', 'prenom', 'prénom', 'first name'],
  lastName: ['lastname', 'last_name', 'nom', 'last name', 'nom de famille'],
  dob: ['dob', 'dateofbirth', 'date_of_birth', 'datenaissance', 'date_naissance', 'naissance', 'date of birth', 'date de naissance'],
  gender: ['gender', 'sexe', 'genre', 'sex'],
  matricule: ['matricule', 'student_id', 'studentid', 'id'],
  birthPlace: ['birthplace', 'birth_place', 'lieu_naissance', 'lieunaissance', 'lieu de naissance'],
  nationality: ['nationality', 'nationalite', 'nationalité'],
  address: ['address', 'adresse'],
  emergencyContact: ['emergencycontact', 'emergency_contact', 'contact_urgence', 'contacturgence', 'contact d\'urgence'],
  emergencyPhone: ['emergencyphone', 'emergency_phone', 'telephone_urgence', 'telephoneurgence', 'téléphone d\'urgence'],
  previousSchool: ['previousschool', 'previous_school', 'ecole_precedente', 'ecoleprecedente', 'école précédente'],
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[_\s\-']/g, '').trim()
}

function findColumnMapping(header: string): string | null {
  const normalized = normalizeHeader(header)
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalizeHeader(alias) === normalized || normalized.includes(normalizeHeader(alias)))) {
      return field
    }
  }
  return null
}

function normalizeDate(value: any): string {
  if (!value)
    return ''

  // Handle Excel date serial numbers
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    }
  }

  const str = String(value).trim()

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str))
    return str

  // DD/MM/YYYY or MM/DD/YYYY
  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 3) {
      const [a, b, c] = parts
      // Assume DD/MM/YYYY if first part > 12
      if (Number(a) > 12) {
        return `${c}-${b?.padStart(2, '0')}-${a?.padStart(2, '0')}`
      }
      // Otherwise assume MM/DD/YYYY
      return `${c}-${a?.padStart(2, '0')}-${b?.padStart(2, '0')}`
    }
  }

  // Try parsing as date
  const date = new Date(str)
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().split('T')[0] || ''
  }

  return str
}

function normalizeGender(value: any): 'M' | 'F' | 'other' | undefined {
  if (!value)
    return undefined
  const str = String(value).toUpperCase().trim()
  if (['M', 'MALE', 'MASCULIN', 'H', 'HOMME', 'GARÇON', 'GARCON'].includes(str))
    return 'M'
  if (['F', 'FEMALE', 'FEMININ', 'FÉMININ', 'FEMME', 'FILLE'].includes(str))
    return 'F'
  return undefined
}

function parseExcelData(workbook: XLSX.WorkBook): { headers: string[], rows: Record<string, any>[] } {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0] || '']
  if (!firstSheet)
    return { headers: [], rows: [] }

  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' })
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0] || {}) : []

  return { headers, rows: jsonData }
}

function mapRowToStudent(row: Record<string, any>, headerMapping: Record<string, string>): ParsedStudent | null {
  const data: Record<string, any> = {}

  for (const [originalHeader, value] of Object.entries(row)) {
    const mappedField = headerMapping[originalHeader]
    if (mappedField && value !== undefined && value !== '') {
      data[mappedField] = value
    }
  }

  // Check required fields
  if (!data.firstName || !data.lastName || !data.dob) {
    return null
  }

  return {
    firstName: String(data.firstName).trim(),
    lastName: String(data.lastName).trim(),
    dob: normalizeDate(data.dob),
    gender: normalizeGender(data.gender),
    matricule: data.matricule ? String(data.matricule).trim() : undefined,
    birthPlace: data.birthPlace ? String(data.birthPlace).trim() : undefined,
    nationality: data.nationality ? String(data.nationality).trim() : undefined,
    address: data.address ? String(data.address).trim() : undefined,
    emergencyContact: data.emergencyContact ? String(data.emergencyContact).trim() : undefined,
    emergencyPhone: data.emergencyPhone ? String(data.emergencyPhone).trim() : undefined,
    previousSchool: data.previousSchool ? String(data.previousSchool).trim() : undefined,
  }
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedStudent[]>([])
  const [allParsed, setAllParsed] = useState<ParsedStudent[]>([])
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
    setPreview([])
    setAllParsed([])

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const { headers, rows } = parseExcelData(workbook)

        if (headers.length === 0 || rows.length === 0) {
          setParseError(t('students.importNoValidRows'))
          return
        }

        // Create header mapping
        const headerMapping: Record<string, string> = {}
        for (const header of headers) {
          const mapped = findColumnMapping(header)
          if (mapped) {
            headerMapping[header] = mapped
          }
        }

        // Check for required columns
        const mappedFields = Object.values(headerMapping)
        const hasFirstName = mappedFields.includes('firstName')
        const hasLastName = mappedFields.includes('lastName')
        const hasDob = mappedFields.includes('dob')

        if (!hasFirstName || !hasLastName || !hasDob) {
          setParseError(t('students.importMissingColumns'))
          return
        }

        // Parse all rows
        const parsed = rows
          .map(row => mapRowToStudent(row, headerMapping))
          .filter((s): s is ParsedStudent => s !== null)

        if (parsed.length === 0) {
          setParseError(t('students.importNoValidRows'))
          return
        }

        setAllParsed(parsed)
        setPreview(parsed.slice(0, 5))
      }
      catch {
        setParseError(t('students.importParseError'))
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }, [t])

  const handleImport = () => {
    if (allParsed.length === 0)
      return
    importMutation.mutate(allParsed)
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setAllParsed([])
    setParseError(null)
    setResult(null)
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    // Create template workbook with typed-xlsx style headers
    const headers = [
      'Nom',
      'Prénom',
      'Date de Naissance',
      'Genre',
      'Lieu de Naissance',
      'Nationalité',
      'Adresse',
      'Contact d\'Urgence',
      'Téléphone d\'Urgence',
      'École Précédente',
    ]
    const example = [
      'Koné',
      'Aminata',
      '2010-05-15',
      'F',
      'Abidjan',
      'Ivoirienne',
      '123 Rue Example',
      'Papa Koné',
      '+2250701020304',
      'École Primaire ABC',
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, example])

    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 20 }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle Import Élèves')

    // Generate and download
    XLSX.writeFile(wb, 'modele_import_eleves.xlsx')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('students.importStudents')}</DialogTitle>
          <DialogDescription>{t('students.importStudentsDescriptionExcel')}</DialogDescription>
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
                          {allParsed.length > 0 && t('students.importPreviewCount', { count: allParsed.length })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFile(null)
                          setPreview([])
                          setAllParsed([])
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
                      <p className="text-sm text-muted-foreground">{t('students.importFileTypesExcel')}</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
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
                        {preview.map((s, i) => (
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
                  {allParsed.length > 5 && (
                    <div className="border-t bg-muted/30 px-3 py-2 text-center text-sm text-muted-foreground">
                      {t('students.importAndMoreRows', { count: allParsed.length - 5 })}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
                <Button onClick={handleImport} disabled={allParsed.length === 0 || importMutation.isPending}>
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
