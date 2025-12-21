import type { TimetableViewMode } from '@/components/timetables'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarSearch, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import {
  TimetableGrid,
  TimetableViewSwitcher,
} from '@/components/timetables'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { timetablesOptions } from '@/lib/queries/timetables'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTeachers } from '@/school/functions/teachers'

export const Route = createFileRoute('/_auth/schedules')({
  component: TimetablesPage,
})

function TimetablesPage() {
  const t = useTranslations()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [viewMode, setViewMode] = useState<TimetableViewMode>('class')
  const [localYearId, setLocalYearId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

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

  const handleViewModeChange = (mode: TimetableViewMode) => {
    setViewMode(mode)
    setSelectedClassId('')
    setSelectedTeacherId('')
  }

  const canShowTimetable
    = effectiveYearId
      && ((viewMode === 'class' && selectedClassId)
        || (viewMode === 'teacher' && selectedTeacherId))

  // Transform timetable data to match TimetableSessionData interface
  const transformedTimetable = timetable?.map((session) => {
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
  }) || []

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
                      readOnly
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
    </div>
  )
}
