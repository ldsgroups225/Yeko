import type { ImportResult, TimetableImportProps } from './types'
import type { ParsedSession } from '@/lib/excel-parser'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { parseTimetableExcel } from '@/lib/excel-parser'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getClasses } from '@/school/functions/classes'
import { getClassrooms } from '@/school/functions/classrooms'
import { getAllSubjects } from '@/school/functions/subjects'
import { getTeachers } from '@/school/functions/teachers'
import { importTimetable } from '@/school/functions/timetables'
import { TimetableImportContext } from './timetable-import-context'

export function TimetableImportProvider({
  open: _open,
  onOpenChange,
  schoolId,
  children,
}: TimetableImportProps & { children: React.ReactNode }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedSession[]>([])
  const [allParsed, setAllParsed] = useState<ParsedSession[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

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

  const importMutation = useMutation({
    mutationKey: schoolMutationKeys.timetables.import,
    mutationFn: (sessions: ParsedSession[]) => {
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (!selectedFile)
        return

      setFile(selectedFile)
      setParseError(null)
      setResult(null)
      setPreview([])
      setAllParsed([])

      const context = {
        classes: classesData?.success ? classesData.data : [],
        subjects: (subjectsData?.success ? subjectsData.data.subjects : []).map(s => ({ subject: s })),
        teachers: teachersData?.success ? teachersData.data.teachers : [],
        classrooms: (classroomsData?.success ? classroomsData.data : []).map(c => ({ classroom: c })),
      }

      parseTimetableExcel(selectedFile, context).then((res) => {
        if (res.success && res.parsed) {
          setAllParsed(res.parsed)
          setPreview(res.parsed.slice(0, 5))
        }
        else {
          const errorKey = res.errorKey?.split('.').pop()
          const errorMsg = (errorKey === 'missingColumns')
            ? t.timetables.errors.missingColumns()
            : t.timetables.errors.readError()
          setParseError(String(errorMsg))
        }
      })
    },
    [classesData, subjectsData, teachersData, classroomsData, t],
  )

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

    const blob = new Blob([excelFile as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modele_emploi_du_temps.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const countValid = allParsed.filter(
    s => s.classId && s.subjectId && s.teacherId && s.dayOfWeek > 0,
  ).length

  return (
    <TimetableImportContext
      value={{
        state: {
          file,
          preview,
          allParsed,
          parseError,
          result,
          isPending: importMutation.isPending,
          countValid,
        },
        actions: {
          handleFileChange,
          handleImport,
          handleClose,
          setFile,
          downloadTemplate,
        },
      }}
    >
      {children}
    </TimetableImportContext>
  )
}
