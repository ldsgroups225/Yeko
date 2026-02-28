import type { ParsedStudent } from './import/import-utils'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import {
  IconAlertCircle,
  IconDownload,
  IconFileSpreadsheet,
  IconLoader2,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  AlertDescription,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { studentsKeys } from '@/lib/queries/students'
import { bulkImportStudents } from '@/school/functions/students'
import { ImportPreview } from './import/import-preview'
import { ImportResultAlert } from './import/import-result-alert'
import {
  findColumnMapping,
  mapRowToStudent,

  parseExcelData,
} from './import/import-utils'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImportResult {
  success: number
  errors: Array<{ row: number, error: string }>
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedStudent[]>([])
  const [allParsed, setAllParsed] = useState<ParsedStudent[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const importMutation = useMutation({
    mutationKey: schoolMutationKeys.students.bulkImport,
    mutationFn: (students: ParsedStudent[]) => bulkImportStudents({ data: students }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setResult(result.data)
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      if (result.data.success > 0)
        toast.success(t.students.importSuccess({ count: result.data.success }))
    },
    onError: (err: Error) => toast.error(err.message),
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
          setParseError(t.students.importNoValidRows())
          return
        }

        const headerMapping: Record<string, string> = {}
        for (const header of headers) {
          const mapped = findColumnMapping(header)
          if (mapped)
            headerMapping[header] = mapped
        }

        const mappedFields = Object.values(headerMapping)
        if (!mappedFields.includes('firstName') || !mappedFields.includes('lastName') || !mappedFields.includes('dob')) {
          setParseError(t.students.importMissingColumns())
          return
        }

        const parsed = rows.map(row => mapRowToStudent(row, headerMapping)).filter((s): s is ParsedStudent => s !== null)
        if (parsed.length === 0) {
          setParseError(t.students.importNoValidRows())
          return
        }
        setAllParsed(parsed)
        setPreview(parsed.slice(0, 5))
      }
      catch { setParseError(t.students.importParseError()) }
    }
    reader.readAsArrayBuffer(selectedFile)
  }, [t])

  const handleImport = () => allParsed.length > 0 && importMutation.mutate(allParsed)

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setAllParsed([])
    setParseError(null)
    setResult(null)
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    interface StudentTemplate {
      'Nom': string
      'Prénom': string
      'Date de Naissance': string
      'Genre': string
      'Lieu de Naissance': string
      'Nationalité': string
      'Adresse': string
      'Contact d\'Urgence': string
      'Téléphone d\'Urgence': string
      'École Précédente': string
    }
    const templateData: StudentTemplate[] = [{
      'Nom': 'Koné',
      'Prénom': 'Aminata',
      'Date de Naissance': '2010-05-15',
      'Genre': 'F',
      'Lieu de Naissance': 'Abidjan',
      'Nationalité': 'Ivoirienne',
      'Adresse': '123 Rue Example',
      'Contact d\'Urgence': 'Papa Koné',
      'Téléphone d\'Urgence': '+2250701020304',
      'École Précédente': 'École Primaire ABC',
    }]
    const schema = ExcelSchemaBuilder.create<StudentTemplate>()
      .column('lastName', { key: 'Nom' })
      .column('firstName', { key: 'Prénom' })
      .column('dob', { key: 'Date de Naissance' })
      .column('gender', { key: 'Genre' })
      .column('birthPlace', { key: 'Lieu de Naissance' })
      .column('nationality', { key: 'Nationalité' })
      .column('address', { key: 'Adresse' })
      .column('emergencyContact', { key: 'Contact d\'Urgence' })
      .column('emergencyPhone', { key: 'Téléphone d\'Urgence' })
      .column('previousSchool', { key: 'École Précédente' })
      .build()
    const excelFile = ExcelBuilder.create().sheet('Modèle Import Élèves').addTable({ data: templateData, schema }).build({ output: 'buffer' })
    const url = URL.createObjectURL(new Blob([new Uint8Array(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'modele_import_eleves.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="
        bg-card/95 border-border/40 max-w-2xl backdrop-blur-xl
      "
      >
        <DialogHeader>
          <DialogTitle>{t.students.importStudents()}</DialogTitle>
          <DialogDescription>{t.students.importStudentsDescriptionExcel()}</DialogDescription>
        </DialogHeader>

        {result
          ? (
              <div className="space-y-4">
                <ImportResultAlert result={result} />
                <DialogFooter><Button onClick={handleClose}>{t.common.close()}</Button></DialogFooter>
              </div>
            )
          : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <IconDownload className="mr-2 h-4 w-4" />
                    {t.students.downloadTemplate()}
                  </Button>
                </div>
                <div className="
                  rounded-lg border-2 border-dashed p-6 text-center
                "
                >
                  {file
                    ? (
                        <div className="flex items-center justify-center gap-3">
                          <IconFileSpreadsheet className="
                            text-muted-foreground h-8 w-8
                          "
                          />
                          <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-muted-foreground text-sm">{allParsed.length > 0 && t.students.importPreviewCount({ count: allParsed.length })}</p>
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
                            <IconX className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    : (
                        <label className="cursor-pointer">
                          <IconUpload className="
                            text-muted-foreground mx-auto h-10 w-10
                          "
                          />
                          <p className="mt-2 font-medium">{t.students.importDropFile()}</p>
                          <p className="text-muted-foreground text-sm">{t.students.importFileTypesExcel()}</p>
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
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertDescription>{parseError}</AlertDescription>
                  </Alert>
                )}
                <ImportPreview preview={preview} totalItems={allParsed.length} />
                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>{t.common.cancel()}</Button>
                  <Button onClick={handleImport} disabled={allParsed.length === 0 || importMutation.isPending}>
                    {importMutation.isPending && (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t.students.importStart()}
                  </Button>
                </DialogFooter>
              </div>
            )}
      </DialogContent>
    </Dialog>
  )
}
