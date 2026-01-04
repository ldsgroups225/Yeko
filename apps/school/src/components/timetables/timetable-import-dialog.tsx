'use client'

import type { ParsedSession } from '@/lib/excel-parser'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
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
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { parseTimetableExcel } from '@/lib/excel-parser'
import { dayOfWeekLabels } from '@/schemas/timetable'
import { getClasses } from '@/school/functions/classes'
import { getClassrooms } from '@/school/functions/classrooms'
import { getAllSubjects } from '@/school/functions/subjects'
import { getTeachers } from '@/school/functions/teachers'
import { importTimetable } from '@/school/functions/timetables'
import { generateUUID } from '@/utils/generateUUID'

interface TimetableImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
}

interface ImportResult {
  success: number
  failed: number
  conflicts: any[]
}

export function TimetableImportDialog({ open, onOpenChange, schoolId }: TimetableImportDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedSession[]>([])
  const [allParsed, setAllParsed] = useState<ParsedSession[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  // Fetch data for validation/mapping
  const { data: classesData } = useSuspenseQuery({
    queryKey: ['classes', schoolYearId],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId || '' } }),
  })

  const { data: subjectsData } = useSuspenseQuery({
    queryKey: ['subjects'],
    queryFn: () => getAllSubjects({ data: {} }),
  })

  const { data: teachersData } = useSuspenseQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: classroomsData } = useSuspenseQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  // Lookup Maps

  const importMutation = useMutation({
    mutationFn: (sessions: ParsedSession[]) => {
      // Filter only valid sessions and map to required format
      const validSessions = sessions
        .filter(s => s.classId && s.subjectId && s.teacherId && s.dayOfWeek > 0 && s.startTime && s.endTime)
        .map(s => ({
          classId: s.classId!,
          subjectId: s.subjectId!,
          teacherId: s.teacherId!,
          classroomId: s.classroomId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }))

      return importTimetable({
        data: {
          schoolId,
          schoolYearId: schoolYearId || '',
          sessions: validSessions,
        },
      })
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        setResult(res.data)
        queryClient.invalidateQueries({ queryKey: ['timetables'] })
        toast.success(t.common.success())
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

    // Prepare context
    const context = {
      classes: classesData || [],
      subjects: subjectsData?.subjects || [],
      teachers: teachersData?.teachers || [],
      classrooms: (Array.isArray(classroomsData) ? classroomsData : (classroomsData as any)?.classrooms) || [],
    }

    // Call parser
    parseTimetableExcel(selectedFile, context).then((res) => {
      if (res.success && res.parsed) {
        setAllParsed(res.parsed)
        setPreview(res.parsed.slice(0, 5))
      }
      else {
        // @ts-expect-error - dynamic key access
        const errorMsg = res.errorKey ? t.timetables.errors[res.errorKey.split('.').pop()] : t.timetables.errors.readError()
        setParseError(String(errorMsg))
      }
    })
  }, [classesData, subjectsData, teachersData, classroomsData, t])

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
    interface TimetableTemplate {
      Classe: string
      Matière: string
      Enseignant: string
      Salle: string
      Jour: string
      Début: string
      Fin: string
    }

    const templateData: TimetableTemplate[] = [
      {
        Classe: '6ème A',
        Matière: t.timetables.template.example.math(),
        Enseignant: 'M. Koné',
        Salle: 'Salle 1',
        Jour: t.timetables.template.example.monday(),
        Début: '08:00',
        Fin: '10:00',
      },
      {
        Classe: '6ème A',
        Matière: t.timetables.template.example.french(),
        Enseignant: 'Mme Dubois',
        Salle: 'Salle 2',
        Jour: t.timetables.template.example.tuesday(),
        Début: '10:00',
        Fin: '12:00',
      },
    ]

    const schema = ExcelSchemaBuilder.create<TimetableTemplate>()
      .column('className', { key: 'Classe' })
      .column('subjectName', { key: 'Matière' })
      .column('teacherName', { key: 'Enseignant' })
      .column('classroomName', { key: 'Salle' })
      .column('day', { key: 'Jour' })
      .column('startTime', { key: 'Début' })
      .column('endTime', { key: 'Fin' })
      .build()

    const excelFile = ExcelBuilder.create()
      .sheet(t.timetables.template.sheetName())
      .addTable({ data: templateData, schema })
      .build({ output: 'buffer' })

    const blob = new Blob([new Uint8Array(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modele_emploi_du_temps.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const countValid = allParsed.filter(s => s.classId && s.subjectId && s.teacherId && s.dayOfWeek > 0).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.timetables.importTitle()}</DialogTitle>
          <DialogDescription>
            {t.timetables.downloadTemplateDescription()}
          </DialogDescription>
        </DialogHeader>

        {result
          ? (
            <div className="space-y-4">
              <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
                {result.failed === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{t.timetables.importComplete()}</AlertTitle>
                <AlertDescription>
                  {t.timetables.importSummary({ success: result.success, total: result.success + result.failed })}
                  {result.failed > 0 && ` - ${result.failed} ${t.timetables.status.error()}`}
                </AlertDescription>
              </Alert>
              <DialogFooter><Button onClick={handleClose}>{t.common.close()}</Button></DialogFooter>
            </div>
          )
          : (
            <div className="space-y-6">
              <div className="flex justify-between">
                <Button variant="outline" onClick={downloadTemplate} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {' '}
                  {t.timetables.downloadTemplate()}
                </Button>
              </div>

              <div className="rounded-lg border-2 border-dashed p-6 text-center border-muted">
                {file
                  ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-bold">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {allParsed.length}
                          {' '}
                          {t.timetables.preview.totalLines()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  )
                  : (
                    <label className="cursor-pointer block">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <span className="font-medium text-primary hover:underline">{t.timetables.importDescription()}</span>
                      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
              </div>

              {parseError && <p className="text-destructive text-sm font-medium">{parseError}</p>}

              {preview.length > 0 && (
                <div className="rounded-xl border border-border/40 overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                    {t.timetables.preview.title()}
                    {' '}
                    (
                    {countValid}
                    {' '}
                    {t.timetables.preview.validLines()}
                    {' '}
                    /
                    {' '}
                    {allParsed.length}
                    )
                  </div>
                  <div className="max-h-[300px] overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/10 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.class()}</th>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.subject()}</th>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.teacher()}</th>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.day()}</th>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.time()}</th>
                          <th className="px-3 py-2 text-left">{t.timetables.columns.status()}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {allParsed.slice(0, 100).map((row) => {
                          const isValid = row.classId && row.subjectId && row.teacherId && row.dayOfWeek > 0
                          return (
                            <tr key={generateUUID()} className={!isValid ? 'bg-destructive/10' : ''}>
                              <td className="px-3 py-2">
                                {row.className}
                                {!row.classId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {row.subjectName}
                                {!row.subjectId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {row.teacherName}
                                {!row.teacherId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                              </td>
                              <td className="px-3 py-2">{dayOfWeekLabels[row.dayOfWeek] || row.dayOfWeek || t.timetables.status.error()}</td>
                              <td className="px-3 py-2">
                                {row.startTime}
                                {' '}
                                -
                                {' '}
                                {row.endTime}
                              </td>
                              <td className="px-3 py-2 font-bold">{isValid ? <span className="text-green-500">{t.timetables.status.ok()}</span> : <span className="text-destructive">{t.timetables.status.error()}</span>}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>{t.common.cancel()}</Button>
                <Button onClick={handleImport} disabled={countValid === 0 || importMutation.isPending}>
                  {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.common.import()}
                  {' '}
                  (
                  {countValid}
                  )
                </Button>
              </DialogFooter>
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}
