import type { TimetableViewMode } from '@/components/timetables'
import type { TimetableSessionData } from '@/components/timetables/timetable-session-card'
import type { SessionFormInput } from '@/components/timetables/timetable-session-dialog'
import type { CreateTimetableSessionInput, UpdateTimetableSessionInput } from '@/schemas/timetable'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { IconCalendarSearch, IconDownload, IconUpload } from '@tabler/icons-react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { PageHeader } from '@workspace/ui/components/page-header'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { TimetableFilters } from '@/components/timetables/timetable-filters'
import { TimetableImportDialog } from '@/components/timetables/timetable-import-dialog'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { timetablesOptions } from '@/lib/queries/timetables'
import { detectConflicts } from '@/lib/utils/timetable-conflicts'
import {
  dayOfWeekLabels,
} from '@/schemas/timetable'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { getClasses } from '@/school/functions/classes'
import { getClassrooms } from '@/school/functions/classrooms'
import { getTeachers } from '@/school/functions/teachers'
import {
  createTimetableSession,
  deleteTimetableSession,
  updateTimetableSession,
} from '@/school/functions/timetables'

const TimetableGrid = lazy(() => import('@/components/timetables').then(m => ({ default: m.TimetableGrid })))
const TimetableSessionDialog = lazy(() => import('@/components/timetables/timetable-session-dialog').then(m => ({ default: m.TimetableSessionDialog })))

export const Route = createFileRoute('/_auth/schedules')({
  component: TimetablesPage,
})

interface ExportData {
  day: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  classroom: string
}

function TimetablesPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolId } = useSchoolContext()
  const { schoolYearId: contextSchoolYearId, isPending: contextPending } = useSchoolYearContext()
  const [viewMode, setViewMode] = useState<TimetableViewMode>('class')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedSession, setSelectedSession] = useState<TimetableSessionData | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: number, startTime: string, endTime: string } | null>(null)

  const effectiveYearId = contextSchoolYearId || ''

  // Fetch classes for selected year
  const { data: classesResult, isPending: classesPending } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })
  const classes = classesResult?.success ? classesResult.data : []

  // Fetch teachers
  const { data: teachersResult, isPending: teachersPending } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
    staleTime: 5 * 60 * 1000,
  })
  const teachersData = teachersResult?.success ? teachersResult.data : null
  const teachers = useMemo(() => teachersData?.teachers ?? [], [teachersData])

  // Fetch classrooms
  const { data: classroomsResult } = useQuery({
    queryKey: ['classrooms', { schoolId }],
    queryFn: () => getClassrooms({ data: {} }),
    staleTime: 5 * 60 * 1000,
  })

  const classrooms = useMemo(() => {
    if (classroomsResult?.success) {
      return classroomsResult.data
    }
    return []
  }, [classroomsResult])

  // Fetch subjects for class
  const { data: classSubjectsResult } = useQuery({
    queryKey: ['class-subjects', selectedClassId],
    queryFn: () => getClassSubjects({ data: { classId: selectedClassId, schoolYearId: effectiveYearId } }),
    enabled: !!selectedClassId,
  })

  const classSubjects = useMemo(() => {
    return classSubjectsResult?.success ? classSubjectsResult.data : []
  }, [classSubjectsResult])

  // Fetch timetable for class view
  const { data: classTimetableResult, isPending: classTimetablePending } = useQuery({
    ...timetablesOptions.byClass({ classId: selectedClassId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'class' && !!selectedClassId && !!effectiveYearId,
  })

  // Fetch timetable for teacher view
  const { data: teacherTimetableResult, isPending: teacherTimetablePending } = useQuery({
    ...timetablesOptions.byTeacher({ teacherId: selectedTeacherId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'teacher' && !!selectedTeacherId && !!effectiveYearId,
  })

  // Fetch timetable for classroom view
  const { data: classroomTimetableResult, isPending: classroomTimetablePending } = useQuery({
    ...timetablesOptions.byClassroom({ classroomId: selectedClassroomId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'classroom' && !!selectedClassroomId && !!effectiveYearId,
  })

  const timetablePending = viewMode === 'class' ? classTimetablePending : viewMode === 'teacher' ? teacherTimetablePending : classroomTimetablePending

  // Transform timetable data to match TimetableSessionData interface
  const transformedTimetable = useMemo(() => {
    const timetable = viewMode === 'class'
      ? (classTimetableResult || [])
      : viewMode === 'teacher'
        ? (teacherTimetableResult || [])
        : (classroomTimetableResult || [])

    const sessions = (timetable?.map((session) => {
      // Handle different data structures for class vs teacher views
      const teacherName = 'teacher' in session && session.teacher?.user?.name
        ? session.teacher.user.name
        : 'Unknown Teacher'

      return {
        id: session.id,
        subjectId: session.subjectId,
        subjectName: session.subject?.name || '',
        teacherId: session.teacherId,
        teacherName,
        classroomId: session.classroomId,
        classroomName: 'classroom' in session && session.classroom?.name ? session.classroom.name : null,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        color: session.color,
      }
    }) || []) as TimetableSessionData[]

    return detectConflicts(sessions)
  }, [viewMode, classTimetableResult, teacherTimetableResult, classroomTimetableResult])

  // Mutations
  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.timetables.create,
    mutationFn: (data: CreateTimetableSessionInput) => createTimetableSession({ data }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t.common.success())
        queryClient.invalidateQueries({ queryKey: ['timetables'] })
        setIsDialogOpen(false)
      }
      else {
        toast.error(res.error || t.common.error())
      }
    },
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.timetables.update,
    mutationFn: (data: UpdateTimetableSessionInput) => updateTimetableSession({ data }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t.common.success())
        queryClient.invalidateQueries({ queryKey: ['timetables'] })
        setIsDialogOpen(false)
      }
      else {
        toast.error(res.error || t.common.error())
      }
    },
  })

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.timetables.delete,
    mutationFn: (id: string) => deleteTimetableSession({ data: { id } }),
    onSuccess: () => {
      toast.success(t.common.success())
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      setIsDialogOpen(false)
    },
  })

  const handleViewModeChange = (mode: TimetableViewMode) => {
    setViewMode(mode)
    setSelectedClassId('')
    setSelectedTeacherId('')
    setSelectedClassroomId('')
  }

  const handleSlotClick = (dayOfWeek: number, startTime: string, endTime: string) => {
    if (viewMode !== 'class' || !selectedClassId)
      return
    setSelectedSlot({ dayOfWeek, startTime, endTime })
    setSelectedSession(null)
    setDialogMode('create')
    setIsDialogOpen(true)
  }

  const handleSessionClick = (session: TimetableSessionData) => {
    if (viewMode !== 'class')
      return
    setSelectedSession(session)
    setSelectedSlot(null)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: SessionFormInput & { id?: string }) => {
    if (dialogMode === 'create') {
      await createMutation.mutateAsync({
        ...data,
        schoolId: schoolId || '',
        schoolYearId: effectiveYearId,
        classId: selectedClassId,
      })
    }
    else if (selectedSession) {
      const updatePayload: UpdateTimetableSessionInput = {
        id: selectedSession.id,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        color: data.color,
      }
      await updateMutation.mutateAsync(updatePayload)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleExport = () => {
    if (!transformedTimetable.length) {
      toast.error(t.timetables.noDataToExport())
      return
    }

    const schema = ExcelSchemaBuilder.create<ExportData>()
      .column('Jour', { key: 'day' })
      .column('Début', { key: 'startTime' })
      .column('Fin', { key: 'endTime' })
      .column('Matière', { key: 'subject' })
      .column('Enseignant', { key: 'teacher' })
      .column('Salle', { key: 'classroom' })
      .build()

    const data = transformedTimetable.map(s => ({
      day: dayOfWeekLabels[s.dayOfWeek] || '',
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subjectName,
      teacher: s.teacherName,
      classroom: s.classroomName || '',
    }))

    const excelFile = ExcelBuilder.create()
      .sheet(t.timetables.export.sheetName())
      .addTable({ data, schema })
      .build({ output: 'buffer' })

    const blob = new Blob([new Uint8Array(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${t.timetables.export.fileName()}_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canShowTimetable
    = effectiveYearId
      && ((viewMode === 'class' && selectedClassId)
        || (viewMode === 'teacher' && selectedTeacherId)
        || (viewMode === 'classroom' && selectedClassroomId))

  // Formatting for dialog
  const formattedSubjects = useMemo(() => classSubjects.map((cs) => {
    return {
      id: cs.subject?.id || 'unknown',
      name: cs.subject?.name || 'Unknown',
    }
  }), [classSubjects])

  const formattedTeachers = useMemo(() => teachers.map(t => ({
    id: t.id,
    name: t.user?.name || 'Unknown',
  })), [teachers])

  const formattedClassrooms = useMemo(() => classrooms.map(c => ({
    id: c.id,
    name: c.name,
  })), [classrooms])

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.timetables() },
        ]}
      />

      <PageHeader
        title={t.timetables.title()}
        description={t.timetables.description()}
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
            onClick={() => setIsImportDialogOpen(true)}
            disabled={!effectiveYearId}
          >
            <IconUpload className="mr-2 h-4 w-4" />
            {t.common.import()}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
            onClick={handleExport}
            disabled={!canShowTimetable}
          >
            <IconDownload className="mr-2 h-4 w-4" />
            {t.common.export()}
          </Button>
        </div>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/20 backdrop-blur-xl border border-border/40 p-6 rounded-3xl space-y-6"
      >
        <TimetableFilters
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          selectedTeacherId={selectedTeacherId}
          onTeacherChange={setSelectedTeacherId}
          selectedClassroomId={selectedClassroomId}
          onClassroomChange={setSelectedClassroomId}
          classes={classes}
          teachers={teachers}
          classrooms={classrooms}
          classesPending={classesPending}
          teachersPending={teachersPending}
          effectiveYearId={effectiveYearId}
          contextPending={contextPending}
        />
      </motion.div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {canShowTimetable
            ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card/40 backdrop-blur-xl border border-border/40 p-1 rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="p-4">
                    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                      <TimetableGrid
                        sessions={transformedTimetable}
                        isPending={timetablePending}
                        onSlotClick={handleSlotClick}
                        onSessionClick={handleSessionClick}
                        readOnly={viewMode !== 'class'}
                      />
                    </Suspense>
                  </div>
                </motion.div>
              )
            : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center h-[400px] text-muted-foreground/60 bg-card/20 border-2 border-dashed border-border/40 rounded-3xl"
                >
                  <div className="p-4 rounded-full bg-primary/5 mb-4">
                    <IconCalendarSearch className="size-8 text-primary/40" />
                  </div>
                  <p className="font-bold text-lg">{t.timetables.selectFiltersPrompt()}</p>
                  <p className="text-sm font-medium opacity-70 max-w-sm text-center mt-2">
                    {t.timetables.description()}
                  </p>
                </motion.div>
              )}
        </AnimatePresence>
      </div>

      <Suspense fallback={null}>
        <TimetableSessionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode={dialogMode}
          initialData={
            dialogMode === 'edit' && selectedSession
              ? {
                  id: selectedSession.id,
                  subjectId: selectedSession.subjectId,
                  teacherId: selectedSession.teacherId ?? '',
                  classroomId: selectedSession.classroomId ?? '',
                  dayOfWeek: selectedSession.dayOfWeek,
                  startTime: selectedSession.startTime,
                  endTime: selectedSession.endTime,
                  color: selectedSession.color ?? undefined,
                }
              : selectedSlot
                ? {
                    dayOfWeek: selectedSlot.dayOfWeek,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                  }
                : undefined
          }
          subjects={formattedSubjects}
          teachers={formattedTeachers}
          classrooms={formattedClassrooms}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      </Suspense>

      <TimetableImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        schoolId={schoolId || ''}
      />
    </div>
  )
}
