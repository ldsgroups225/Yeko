import type { TimetableViewMode } from '@/components/timetables'
import type { TimetableSessionData } from '@/components/timetables/timetable-session-card'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarSearch, Download, Sparkles, Upload } from 'lucide-react'

import { AnimatePresence, motion } from 'motion/react'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import {
  TimetableGrid,
  TimetableViewSwitcher,
} from '@/components/timetables'
import { TimetableImportDialog } from '@/components/timetables/timetable-import-dialog'
import { TimetableSessionDialog } from '@/components/timetables/timetable-session-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { timetablesOptions } from '@/lib/queries/timetables'
import { dayOfWeekLabels } from '@/schemas/timetable'
import { getClassSubjects } from '@/school/functions/class-subjects'
import { getClasses } from '@/school/functions/classes'
import { getClassrooms } from '@/school/functions/classrooms'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'
import {
  createTimetableSession,
  deleteTimetableSession,
  updateTimetableSession,
} from '@/school/functions/timetables'

export const Route = createFileRoute('/_auth/schedules')({
  component: TimetablesPage,
})

function TimetablesPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolId } = useSchoolContext()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [viewMode, setViewMode] = useState<TimetableViewMode>('class')
  const [localYearId, setLocalYearId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedSession, setSelectedSession] = useState<TimetableSessionData | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: number, startTime: string, endTime: string } | null>(null)

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Determine effective year ID
  const activeYear = schoolYears?.find((y: { isActive: boolean }) => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch classes for selected year
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
    staleTime: 5 * 60 * 1000,
  })
  const teachers = teachersData?.teachers ?? []

  // Fetch classrooms
  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms', { schoolId }],
    queryFn: () => getClassrooms({ data: {} }),
    staleTime: 5 * 60 * 1000,
  })
  const classrooms = (Array.isArray(classroomsData) ? classroomsData : (classroomsData as any)?.classrooms) ?? []

  // Fetch subjects for class
  const { data: classSubjectsData } = useQuery({
    queryKey: ['class-subjects', selectedClassId],
    queryFn: () => getClassSubjects({ data: { classId: selectedClassId, schoolYearId: effectiveYearId } }),
    enabled: !!selectedClassId,
  })
  const classSubjects = (Array.isArray(classSubjectsData) ? classSubjectsData : (classSubjectsData as any)?.data) ?? []

  // Fetch timetable for class view
  const { data: classTimetable, isLoading: classTimetableLoading } = useQuery({
    ...timetablesOptions.byClass({ classId: selectedClassId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'class' && !!selectedClassId && !!effectiveYearId,
  })

  // Fetch timetable for teacher view
  const { data: teacherTimetable, isLoading: teacherTimetableLoading } = useQuery({
    ...timetablesOptions.byTeacher({ teacherId: selectedTeacherId, schoolYearId: effectiveYearId }),
    enabled: viewMode === 'teacher' && !!selectedTeacherId && !!effectiveYearId,
  })

  const timetable = viewMode === 'class' ? classTimetable : teacherTimetable
  const timetableLoading = viewMode === 'class' ? classTimetableLoading : teacherTimetableLoading

  // Transform timetable data to match TimetableSessionData interface
  const transformedTimetable = useMemo(() => {
    return (timetable?.map((session) => {
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
        classroomName: session.classroom?.name || null,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        color: session.color,
        hasConflict: false, // TODO: Add conflict detection
      }
    }) || []) as TimetableSessionData[]
  }, [timetable])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createTimetableSession({ data }),
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
    mutationFn: (data: any) => updateTimetableSession({ data }),
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

  const handleSubmit = async (data: any) => {
    if (dialogMode === 'create') {
      await createMutation.mutateAsync({
        ...data,
        schoolId,
        schoolYearId: effectiveYearId,
        classId: selectedClassId,
      })
    }
    else if (selectedSession) {
      await updateMutation.mutateAsync({
        ...data,
        id: selectedSession.id,
      })
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

    const schema = ExcelSchemaBuilder.create<any>()
      .column('day', { key: t.timetables.columns.day() })
      .column('startTime', { key: t.timetables.columns.startTime() })
      .column('endTime', { key: t.timetables.columns.endTime() })
      .column('subject', { key: t.timetables.columns.subject() })
      .column('teacher', { key: t.timetables.columns.teacher() })
      .column('classroom', { key: t.timetables.columns.classroom() })
      .build()

    const data = transformedTimetable.map(s => ({
      day: dayOfWeekLabels[s.dayOfWeek],
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
      || (viewMode === 'teacher' && selectedTeacherId))

  // Formatting for dialog
  const formattedSubjects = useMemo(() => classSubjects.map((cs: any) => ({
    id: cs.subject?.id || cs.id,
    name: cs.subject?.name || cs.name || 'Unknown',
  })), [classSubjects])

  const formattedTeachers = useMemo(() => teachers.map((t: any) => ({
    id: t.id,
    name: t.user?.name || t.name || 'Unknown',
  })), [teachers])

  const formattedClassrooms = useMemo(() => classrooms.map((c: any) => ({
    id: c.classroom?.id || c.id,
    name: c.classroom?.name || c.name || 'Unknown',
  })), [classrooms])

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.timetables() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <Sparkles className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.timetables.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.timetables.description()}</p>
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
            onClick={() => setIsImportDialogOpen(true)}
            disabled={!effectiveYearId}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5"
            onClick={handleExport}
            disabled={!canShowTimetable}
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/20 backdrop-blur-xl border border-border/40 p-6 rounded-3xl space-y-6"
      >
        <div className="flex flex-col gap-6">
          <TimetableViewSwitcher value={viewMode} onChange={handleViewModeChange} />

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* School Year */}
            <div className="w-full sm:w-[240px] space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                {t.schoolYear.title()}
              </label>
              {yearsLoading
                ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
                : (
                  <Select value={effectiveYearId} onValueChange={setLocalYearId}>
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                      <SelectValue placeholder={t.schoolYear.select()} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id} className="rounded-lg focus:bg-primary/10 font-medium">
                          {year.template.name}
                          {' '}
                          {year.isActive && t.schoolYear.activeSuffix()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            </div>

            {/* Class selector (for class view) */}
            {viewMode === 'class' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full sm:w-[240px] space-y-1.5"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  {t.classes.title()}
                </label>
                {classesLoading
                  ? (
                    <Skeleton className="h-11 w-full rounded-xl" />
                  )
                  : (
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                      disabled={!effectiveYearId}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                        <SelectValue placeholder={t.classes.select()} />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                        {classes?.map(item => (
                          <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg focus:bg-primary/10 font-medium">
                            {item.grade.name}
                            {' '}
                            {item.class.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
              </motion.div>
            )}

            {/* Teacher selector (for teacher view) */}
            {viewMode === 'teacher' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full sm:w-[240px] space-y-1.5"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  {t.teachers.title()}
                </label>
                {teachersLoading
                  ? (
                    <Skeleton className="h-11 w-full rounded-xl" />
                  )
                  : (
                    <Select
                      value={selectedTeacherId}
                      onValueChange={setSelectedTeacherId}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                        <SelectValue placeholder={t.teachers.select()} />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                        {teachers?.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id} className="rounded-lg focus:bg-primary/10 font-medium">
                            {teacher.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
              </motion.div>
            )}
          </div>
        </div>
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
                  <TimetableGrid
                    sessions={transformedTimetable}
                    isLoading={timetableLoading}
                    onSlotClick={handleSlotClick}
                    onSessionClick={handleSessionClick}
                    readOnly={viewMode !== 'class'}
                  />
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
                  <CalendarSearch className="size-8 text-primary/40" />
                </div>
                <p className="font-bold text-lg">{t.timetables.selectFiltersPrompt()}</p>
                <p className="text-sm font-medium opacity-70 max-w-sm text-center mt-2">
                  {t.timetables.description()}
                </p>
              </motion.div>
            )}
        </AnimatePresence>
      </div>

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
              classroomId: (selectedSession.classroomId ?? '') as string,
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

      <TimetableImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        schoolId={schoolId || ''}
      />
    </div>
  )
}
