import type { ConductClassOption, ConductRecordSource, ConductStudentRow, ConductStudentSource } from './-conduct.types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { CreateConductRecordDialog } from '@/components/conduct/create-conduct-record-dialog'
import { useDebounce } from '@/hooks/use-debounce'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { conductRecordsOptions, conductStudentsOptions } from '@/lib/queries/conduct-records'
import { ConductFiltersBar } from './-conduct-filters-bar'
import { ConductSeverityBreakdown } from './-conduct-severity-breakdown'
import { ConductStatsCards } from './-conduct-stats-cards'
import { ConductStudentsTable } from './-conduct-students-table'
import { useConductStudentsSummary } from './-use-conduct-students-summary'

const searchSchema = z.object({
  classId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
})

export const Route = createFileRoute('/_auth/conducts/conduct/')({
  validateSearch: searchSchema,
  component: ConductPage,
})

function ConductPage() {
  const t = useTranslations()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { schoolYearId } = useSchoolYearContext()
  const [searchTerm, setSearchTerm] = useState(search.search ?? '')
  const [selectedStudent, setSelectedStudent] = useState<ConductStudentRow | null>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 450)

  const { data: classes = [], isPending: classesPending } = useQuery(
    classesOptions.list({ schoolYearId: schoolYearId ?? undefined }),
  )

  const {
    data: studentsResult,
    isPending: studentsPending,
    isError: studentsError,
    error: studentsErrorDetails,
  } = useQuery(
    conductStudentsOptions({
      schoolYearId: schoolYearId ?? undefined,
      classId: search.classId,
      search: undefined,
      page: 1,
      limit: 200,
    }),
  )

  const { data: conductResult, isPending: conductPending } = useQuery(
    conductRecordsOptions({
      schoolYearId,
      classId: search.classId,
      page: 1,
      pageSize: 500,
    }),
  )

  const classOptions = classes as ConductClassOption[]
  const studentSources = (studentsResult?.data ?? []) as ConductStudentSource[]
  const conductSources = (conductResult?.data ?? []) as ConductRecordSource[]

  const { rows, summary } = useConductStudentsSummary({
    students: studentSources,
    conductRecords: conductSources,
    searchTerm: debouncedSearchTerm,
    notAvailableLabel: t.common.notAvailable(),
  })

  const selectedClass = classOptions.find(item => item.class.id === search.classId)
  const selectedClassLabel = selectedClass
    ? `${selectedClass.grade?.name ?? ''} ${selectedClass.class.section}`.trim()
    : `${t.conduct.allClasses()} (${classOptions.length})`

  const isPending = classesPending || studentsPending || conductPending
  const studentsErrorMessage = studentsError
    ? studentsErrorDetails instanceof Error
      ? studentsErrorDetails.message
      : t.common.error()
    : null

  useEffect(() => {
    if (classesPending || !search.classId)
      return

    const isSelectedClassStillAvailable = classOptions.some(item => item.class.id === search.classId)
    if (!isSelectedClassStillAvailable) {
      navigate({
        search: prev => ({
          ...prev,
          classId: undefined,
          page: 1,
        }),
        replace: true,
      })
    }
  }, [classOptions, classesPending, navigate, search.classId])

  const handleClassChange = (value: string) => {
    navigate({
      search: prev => ({
        ...prev,
        classId: value === 'all' ? undefined : value,
        page: 1,
      }),
    })
  }

  return (
    <div className="space-y-8 p-1">
      <ConductFiltersBar
        t={t}
        classes={classOptions}
        selectedClassId={search.classId}
        selectedClassLabel={selectedClassLabel}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onClassChange={handleClassChange}
      />

      <ConductStatsCards
        t={t}
        summary={summary}
        isPending={isPending}
      />

      <ConductSeverityBreakdown
        t={t}
        summary={summary}
      />

      <ConductStudentsTable
        t={t}
        rows={rows}
        errorMessage={studentsErrorMessage}
        onCreateRecord={row => setSelectedStudent(row)}
      />

      <CreateConductRecordDialog
        open={selectedStudent !== null}
        onOpenChange={open => !open && setSelectedStudent(null)}
        schoolYearId={schoolYearId}
        studentId={selectedStudent?.studentId}
        studentName={selectedStudent?.studentName}
      />
    </div>
  )
}
