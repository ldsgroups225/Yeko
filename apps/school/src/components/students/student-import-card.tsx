import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { importStudents, validateImportData } from '@/school/functions/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'

interface ValidationResult {
  isValid: boolean
  totalRows: number
  validRows: number
  invalidRows: number
  errors: { row: number, field: string, message: string }[]
}

interface ImportResult {
  succeeded: number
  failed: number
  errors: { row: number, error: string }[]
}

export function StudentImportCard() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const validateMutation = useMutation({
    mutationFn: validateImportData,
    onSuccess: (result: { success: boolean, data?: ValidationResult }) => {
      if (result.success && result.data) {
        setValidationResult(result.data)
        if (!result.data.isValid) {
          toast.error(t.students.importParseError())
        }
      }
    },
  })

  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: (result: { success: boolean, data?: ImportResult }) => {
      if (result.success && result.data) {
        toast.success(
          t.students.importSuccess({ count: result.data.succeeded }),
        )
        queryClient.invalidateQueries({ queryKey: ['students'] })
        setFile(null)
        setValidationResult(null)
      }
    },
    onError: () => {
      toast.error(t.students.importParseError())
    },
  })

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (!selectedFile)
        return

      setFile(selectedFile)
      setValidationResult(null)

      // Parse file and validate
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) ?? []

      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((header, i) => {
          row[header] = values[i] ?? ''
        })
        return row
      })

      validateMutation.mutate({ data: { rows } })
    },
    [validateMutation],
  )

  const handleImport = () => {
    if (!validationResult?.isValid || !schoolYearId)
      return

    // Re-parse file for import
    if (!file)
      return

    file.text().then((text) => {
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) ?? []

      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim())
        return {
          firstName: values[headers.indexOf('firstname')] ?? '',
          lastName: values[headers.indexOf('lastname')] ?? '',
          dob: values[headers.indexOf('dob')] ?? '',
          gender: (values[headers.indexOf('gender')] ?? 'M') as 'M' | 'F',
          gradeCode: values[headers.indexOf('gradecode')] ?? '',
          seriesCode: values[headers.indexOf('seriescode')] || undefined,
          section: values[headers.indexOf('section')] || undefined,
          parentName: values[headers.indexOf('parentname')] || undefined,
          parentPhone: values[headers.indexOf('parentphone')] || undefined,
          parentEmail: values[headers.indexOf('parentemail')] || undefined,
        }
      })

      importMutation.mutate({
        data: {
          rows,
          schoolYearId,
          autoEnroll: true,
        },
      })
    })
  }

  const downloadTemplate = () => {
    const headers = [
      'firstName',
      'lastName',
      'dob',
      'gender',
      'gradeCode',
      'seriesCode',
      'section',
      'parentName',
      'parentPhone',
      'parentEmail',
    ]
    const example = [
      'Jean',
      'Kouadio',
      '15/03/2010',
      'M',
      '6eme',
      '',
      '1',
      'Marie Kouadio',
      '+2250701020304',
      'marie@example.com',
    ]

    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'import_eleves_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t.students.importStudents()}
        </CardTitle>
        <CardDescription>
          {t.students.importStudentsDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={downloadTemplate} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {t.students.downloadTemplate()}
        </Button>

        <div className="space-y-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="import-file"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-file')?.click()}
            className="w-full"
            disabled={validateMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? file.name : t.students.importDropFile()}
          </Button>
        </div>

        {validationResult && (
          <div className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
            <div className="flex justify-between text-sm">
              <span>{t.students.importPreviewCount({ count: validationResult.totalRows })}</span>
              <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                {validationResult.validRows}
                {' '}
                /
                {validationResult.totalRows}
              </span>
            </div>
            <Progress
              value={(validationResult.validRows / validationResult.totalRows) * 100}
            />
            {validationResult.errors.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto text-sm text-red-600">
                {validationResult.errors.slice(0, 5).map(err => (
                  <p key={generateUUID()}>
                    {t.students.importRowError({ row: err.row, error: err.message })}
                  </p>
                ))}
                {validationResult.errors.length > 5 && (
                  <p>{t.common.andMore({ count: validationResult.errors.length - 5 })}</p>
                )}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={
            !validationResult?.isValid
            || !schoolYearId
            || importMutation.isPending
          }
          className="w-full"
        >
          {importMutation.isPending
            ? t.common.loading()
            : t.students.importStart()}
        </Button>
      </CardContent>
    </Card>
  )
}
