import type { TranslationFunctions } from '@/i18n/i18n-types'
import type { NoteWithDetails } from '@/lib/db/local-notes'
import { IconAlertCircle, IconArrowLeft, IconBook, IconChartBar, IconChevronDown, IconChevronUp, IconDeviceFloppy, IconEdit, IconHistory, IconMinus, IconPlayerPlay, IconPlus, IconSchool, IconSearch, IconTrendingDown, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@workspace/ui/components/number-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AttendanceStudentCard, ParticipationStudentCard, SessionFinalizationSheet, SessionStatsPanel } from '@/components/session'
import { useAttendanceRecords } from '@/hooks/use-attendance-records'
import { useParticipationManagement } from '@/hooks/use-participation-management'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { localNotesService } from '@/lib/db/local-notes'
import { classDetailsQueryOptions, classStatsQueryOptions, classStudentsQueryOptions } from '@/lib/queries/classes'
import { teacherClassesQueryOptions } from '@/lib/queries/dashboard'
import { getCurrentTermFn, getTeacherSchoolsQuery } from '@/teacher/functions/schools'
import { completeSession, startSession } from '@/teacher/functions/sessions'

export const Route = createFileRoute('/_auth/app/schools/$schoolId/class/$classId')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      timetableSessionId: (search.timetableSessionId as string) || undefined,
    }
  },
  component: ClassDetailPage,
})

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 14,
  GOOD: 12,
  PASSING: 10,
} as const

// Utility functions
function getPerformanceColor(average: number | null): string {
  if (average === null)
    return 'text-muted-foreground'
  if (average >= PERFORMANCE_THRESHOLDS.EXCELLENT)
    return 'text-emerald-500'
  if (average >= PERFORMANCE_THRESHOLDS.GOOD)
    return 'text-amber-500'
  if (average >= PERFORMANCE_THRESHOLDS.PASSING)
    return 'text-orange-500'
  return 'text-red-500'
}

function getPerformanceBgColor(average: number | null): string {
  if (average === null)
    return 'bg-muted/30'
  if (average >= PERFORMANCE_THRESHOLDS.EXCELLENT)
    return 'bg-emerald-500/10'
  if (average >= PERFORMANCE_THRESHOLDS.GOOD)
    return 'bg-amber-500/10'
  if (average >= PERFORMANCE_THRESHOLDS.PASSING)
    return 'bg-orange-500/10'
  return 'bg-red-500/10'
}

function getPerformanceIcon(average: number | null, classAvg: number | null) {
  if (average === null || classAvg === null)
    return <IconMinus className="w-3 h-3" />
  const diff = average - classAvg
  if (diff > 1)
    return <IconTrendingUp className="w-3 h-3 text-emerald-500" />
  if (diff < -1)
    return <IconTrendingDown className="w-3 h-3 text-red-500" />
  return <IconMinus className="w-3 h-3 text-muted-foreground" />
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

type SortKey = 'name' | 'average' | 'participation' | 'quizzes' | 'tests'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

function ClassDetailPage() {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()

  const { schoolId, classId } = Route.useParams()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  // Grade Entry Mode states
  const [isEntryMode, setIsEntryMode] = useState(false)
  const [isMetaExpanded, setIsMetaExpanded] = useState(true)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteType, setNoteType] = useState<'quizzes' | 'tests' | 'level_tests'>('tests')
  const [weight, setWeight] = useState(1)
  const [gradeOutOf, setGradeOutOf] = useState(20)
  const [gradesMap, setGradesMap] = useState<Map<string, string>>(() => new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [isUnpublishedSheetOpen, setIsUnpublishedSheetOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // Session Mode states (for "Commencer le cours" flow)
  type SessionMode = 'view' | 'attendance_initial' | 'attendance_late' | 'participation' | 'finalization'
  const [sessionMode, setSessionMode] = useState<SessionMode>('view')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const { timetableSessionId } = Route.useSearch()

  // Fetch class details
  const { data: classData, isLoading: classLoading } = useQuery({
    ...classDetailsQueryOptions({
      classId,
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context?.schoolYearId,
  })

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    ...classStudentsQueryOptions({
      classId,
      schoolYearId: context?.schoolYearId ?? '',
      searchQuery: searchQuery || undefined,
    }),
    enabled: !!context?.schoolYearId,
  })

  // Fetch class stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    ...classStatsQueryOptions({
      classId,
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context?.schoolYearId,
  })

  // Fetch all teacher classes to get subjects
  const { data: teacherClassesData } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  // Find current class in teacher classes to get its subjects
  const teacherClassInfo = teacherClassesData?.classes.find(c => c.id === classId)
  const teacherSubjects = teacherClassInfo?.subjects ?? []

  // Fetch current term
  const { data: currentTerm } = useQuery({
    queryKey: ['schools', 'current-term', context?.schoolYearId],
    queryFn: () => getCurrentTermFn({ data: { schoolYearId: context?.schoolYearId ?? '' } }),
    enabled: !!context?.schoolYearId,
  })

  // Fetch school info
  const { data: schools } = useQuery({
    queryKey: ['teacher', 'schools', context?.userId],
    queryFn: () => getTeacherSchoolsQuery({ data: { userId: context?.userId ?? '' } }),
    enabled: !!context?.userId,
  })

  const currentSchool = schools?.find((s: { id: string }) => s.id === schoolId)

  // Fetch unpublished note for this context
  const { data: unpublishedNote, refetch: refetchUnpublished } = useQuery({
    queryKey: ['local-notes', 'unpublished', schoolId, classId, context?.teacherId],
    queryFn: () => localNotesService.findUnpublishedNote({
      classId,
      schoolId,
      teacherId: context!.teacherId,
    }),
    enabled: !!context?.teacherId && !!classId,
  })
  // Fetch count of unpublished notes
  const { data: unpublishedCount = 0, refetch: refetchUnpublishedCount } = useQuery({
    queryKey: ['local-notes', 'unpublished-count', schoolId, classId, context?.teacherId],
    queryFn: () => localNotesService.countUnpublishedNotes({
      classId,
      schoolId,
      teacherId: context!.teacherId,
    }),
    enabled: !!context?.teacherId && !!classId,
  })

  const isLoading = contextLoading || classLoading || studentsLoading || statsLoading

  const classInfo = classData?.class
  const students = useMemo(() => studentsData?.students ?? [], [studentsData?.students])

  // Session mode helpers
  const isSessionActive = sessionMode !== 'view'
  const isAttendanceMode = sessionMode === 'attendance_initial' || sessionMode === 'attendance_late'

  // Use attendance records hook
  const {
    attendanceRecords,
    attendanceStats,
    updateAttendanceStatus,
    getRecordForStudent,
    setIsFirstAttendanceFinished,
    resetAttendance,
  } = useAttendanceRecords({
    students: isSessionActive ? students : [],
  })

  // Use participation management hook
  const {
    participations,
    participationStats,
    toggleParticipation,
    hasStudentParticipated,
    getCommentForStudent,
    setComment,
    comment,
    openCommentModal,
    saveComment,
    closeCommentModal,
    selectedStudentId,
    resetParticipations,
  } = useParticipationManagement({
    students: isSessionActive ? students : [],
    attendanceRecords,
  })

  // --------------------------------------------------------------------------
  // Session Handlers
  // --------------------------------------------------------------------------

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionCancelDialogOpen, setIsSessionCancelDialogOpen] = useState(false)

  const handleStartSession = async () => {
    if (timetableSessionId && context?.teacherId) {
      try {
        setIsSubmitting(true)
        const result = await startSession({
          data: {
            timetableSessionId,
            teacherId: context.teacherId,
            date: new Date().toISOString().split('T')[0]!,
          },
        })

        if (result.success && result.sessionId) {
          setSessionId(result.sessionId)
          setSessionMode('attendance_initial')
        }
        else {
          toast.error(result.error ?? LL.common.error())
        }
      }
      catch (error) {
        console.error('Failed to start session:', error)
        toast.error(LL.common.error())
      }
      finally {
        setIsSubmitting(false)
      }
    }
    else {
      // Ad-hoc session or no timetable info
      // For now, we still move to attendance mode
      setSessionMode('attendance_initial')
    }
  }

  const handleFinishInitialAttendance = () => {
    setIsFirstAttendanceFinished(true)
    // If no one is absent, skip late attendance
    if (attendanceStats && attendanceStats.absent === 0) {
      setSessionMode('participation')
    }
    else {
      setSessionMode('attendance_late')
    }
  }

  const handleGoToParticipation = () => {
    setSessionMode('participation')
  }

  const handleCancelSession = () => {
    setIsSessionCancelDialogOpen(true)
  }

  const handleSubmitSession = async (data: {
    homework: { title: string, description: string, dueDate: string } | null
    lessonCompleted: boolean
  }) => {
    if (!sessionId && !timetableSessionId) {
      toast.error('No active session to complete')
      return
    }

    setIsSubmitting(true)
    try {
      // If we don't have a sessionId but have a timetableSessionId, we might need to start it first
      // But usually sessionId is set in handleStartSession
      let activeId = sessionId

      if (!activeId && timetableSessionId && context?.teacherId) {
        const startResult = await startSession({
          data: {
            timetableSessionId,
            teacherId: context.teacherId,
            date: new Date().toISOString().split('T')[0]!,
          },
        })
        if (startResult.success && startResult.sessionId) {
          activeId = startResult.sessionId
          setSessionId(activeId)
        }
      }

      if (!activeId) {
        throw new Error('Could not establish a session ID')
      }

      // Call the actual API
      const result = await completeSession({
        data: {
          sessionId: activeId,
          teacherId: context?.teacherId,
          studentsPresent: attendanceStats.present,
          studentsAbsent: attendanceStats.absent,
          attendanceRecords: attendanceRecords.reduce((acc, r) => {
            acc[r.studentId] = r.status
            return acc
          }, {} as Record<string, 'present' | 'absent' | 'late'>),
          participationGrades: participations.map(p => ({
            studentId: p.studentId,
            grade: 10, // Default grade for participation, could be configurable
            comment: p.comment,
          })),
          homework: data.homework,
          lessonCompleted: data.lessonCompleted,
        },
      })

      if (result.success) {
        toast.success(LL.session.saved())
        resetAttendance()
        resetParticipations()
        setSessionMode('view')
        setSessionId(null)
      }
      else {
        toast.error(result.error ?? LL.common.error())
      }
    }
    catch (error) {
      console.error('Failed to save session:', error)
      toast.error(LL.common.error())
    }
    finally {
      setIsSubmitting(false)
    }
  }

  // --------------------------------------------------------------------------
  // Grade Entry Handlers
  // --------------------------------------------------------------------------

  const handleStartEntry = () => {
    if (teacherSubjects.length === 0) {
      toast.error(LL.grades.noSubjects())
      return
    }

    // Default to the first subject if not set
    if (!selectedSubjectId) {
      setSelectedSubjectId(teacherSubjects[0]!.id)
    }

    setIsEntryMode(true)
    setIsMetaExpanded(true)
    setGradesMap(new Map())
    setNoteTitle('')
    setNoteType('tests')
    setWeight(1)
    setGradeOutOf(20)
  }

  const handleCancelEntry = () => {
    setIsEntryMode(false)
    setGradesMap(new Map())
    setNoteTitle('')
  }

  const handleSaveEntry = async () => {
    if (!noteTitle.trim()) {
      toast.error(LL.grades.titleRequired())
      return
    }

    if (!selectedSubjectId) {
      toast.error(LL.grades.subjectRequired())
      return
    }

    if (!currentTerm) {
      toast.error(LL.grades.noCurrentTerm())
      return
    }

    try {
      setIsSaving(true)
      const now = new Date()
      // Use existing ID if we are editing an unpublished note
      const noteId = unpublishedNote?.id || crypto.randomUUID()

      // 1. Prepare Note Data
      const newNote = {
        id: noteId,
        title: noteTitle,
        type: noteType,
        weight,
        totalPoints: gradeOutOf || 20,
        classId,
        subjectId: selectedSubjectId,
        teacherId: context!.teacherId,
        schoolId: context!.schoolId,
        schoolYearId: context!.schoolYearId,
        termId: currentTerm.id,
        isPublished: false,
        isActive: true,
        createdAt: unpublishedNote?.createdAt || now,
        updatedAt: now,
      }

      // 2. Prepare Details (Grades)
      const details = Array.from(gradesMap.entries())
        .filter(([_, value]) => value !== '')
        .map(([studentId, value]) => ({
          id: `${noteId}-${studentId}`,
          noteId,
          studentId,
          value,
          gradedAt: now,
        }))

      // 3. Save or Update to PGlite
      if (unpublishedNote) {
        await localNotesService.updateNoteLocally(noteId, newNote, details)
      }
      else {
        await localNotesService.saveNoteLocally(newNote, details)
      }

      toast.success(LL.grades.savedLocally())
      setIsEntryMode(false)
      setGradesMap(new Map())
      setNoteTitle('')
      refetchUnpublished()
      refetchUnpublishedCount()
    }
    catch (error) {
      console.error('Failed to save grades locally:', error)
      toast.error(LL.errors.databaseSaveFailed())
    }
    finally {
      setIsSaving(false)
    }
  }

  const executePublish = async () => {
    if (!unpublishedNote)
      return

    try {
      setIsSaving(true)

      // Ensure all students have a grade (auto-fill 0 for missing ones as requested)
      const missingStudentIds = students
        .map(s => s.id)
        .filter(id => !unpublishedNote.details.find(d => d.studentId === id))

      if (missingStudentIds.length > 0) {
        // Update local note with 0s for missing students
        const missingDetails = missingStudentIds.map(studentId => ({
          id: `${unpublishedNote.id}-${studentId}`,
          studentId,
          value: '0',
          noteId: unpublishedNote.id,
          gradedAt: new Date(),
        }))

        // We use updateNoteLocally to append or update
        await localNotesService.updateNoteLocally(unpublishedNote.id, {}, missingDetails)
      }

      // Mark as published locally
      await localNotesService.publishNote(unpublishedNote.id)

      toast.success(LL.grades.publishedSuccess())
      setIsUnpublishedSheetOpen(false)
      setIsConfirmDialogOpen(false)
      refetchUnpublished()
      refetchUnpublishedCount()
      queryClient.invalidateQueries({ queryKey: ['teacher', 'grades'] })
    }
    catch (error) {
      console.error('Publish failed:', error)
      toast.error(LL.errors.publishFailed())
    }
    finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!unpublishedNote)
      return

    const missingStudentIds = students
      .map(s => s.id)
      .filter(id => !unpublishedNote.details.find(d => d.studentId === id))

    if (missingStudentIds.length > 0) {
      setIsConfirmDialogOpen(true)
    }
    else {
      executePublish()
    }
  }

  const handleGradeChange = (studentId: string, value: string) => {
    // Basic validation: 0-gradeOutOf, allow decimal
    if (value === '' || /^\d{0,3}(?:\.\d{0,2})?$/.test(value)) {
      const numValue = Number.parseFloat(value)
      if (value === '' || (numValue >= 0 && numValue <= gradeOutOf)) {
        setGradesMap((prev) => {
          const newMap = new Map(prev)
          newMap.set(studentId, value)
          return newMap
        })
      }
    }
  }

  // Calculate class statistics
  const classStats = useMemo(() => {
    if (!statsData?.success || !statsData.stats) {
      return { average: null, maxAverage: null, minAverage: null }
    }
    return {
      average: statsData.stats.average,
      maxAverage: statsData.stats.maxAverage,
      minAverage: statsData.stats.minAverage,
    }
  }, [statsData])

  // Sort and filter students
  const processedStudents = useMemo(() => {
    const result = [...students]

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortConfig.key) {
          case 'name':
            aValue = `${a.lastName} ${a.firstName}`
            bValue = `${b.lastName} ${b.firstName}`
            break
          default:
            aValue = `${a.lastName} ${a.firstName}`
            bValue = `${b.lastName} ${b.firstName}`
        }

        if (aValue < bValue)
          return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue)
          return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [students, sortConfig])

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudent(prev => (prev === studentId ? null : studentId))
  }

  if (isLoading) {
    return <ClassDetailSkeleton />
  }

  if (!classInfo) {
    return <ClassNotFound schoolId={schoolId} />
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link to="/app/schools/$schoolId/classes" params={{ schoolId }}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <IconArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {classInfo.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                {currentSchool?.name ?? LL.classes.defaultSchool()}
              </Badge>
            </div>
          </div>

          {unpublishedNote && !isEntryMode && (
            <Tooltip>
              <TooltipTrigger
                render={(
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 shadow-lg shadow-amber-500/5 relative ml-auto"
                    onClick={() => setIsUnpublishedSheetOpen(true)}
                  >
                    <IconHistory className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-amber-500 text-white text-[9px] border-2 border-background rounded-full pointer-events-none">
                      {unpublishedCount}
                    </Badge>
                  </Button>
                )}
              />
              <TooltipContent>
                <p>{LL.grades.unpublishedNoteShort()}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Class Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20"
          >
            <IconUsers className="w-5 h-5 text-primary mb-1" />
            <span className="text-xl font-black text-foreground">{students.length}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {LL.common.students()}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-linear-to-br from-muted/50 to-muted/30 border border-border/40"
          >
            <IconChartBar className="w-5 h-5 text-muted-foreground mb-1" />
            <span className={cn('text-xl font-black', getPerformanceColor(classStats.average))}>
              {classStats.average?.toFixed(2) ?? '--.--'}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {LL.common.average()}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-linear-to-br from-muted/50 to-muted/30 border border-border/40"
          >
            <IconBook className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-xl font-black text-foreground">--</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {LL.grades.title()}
            </span>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row flex-wrap gap-3 mt-2">
          {!isEntryMode
            ? (
                <>
                  <Button
                    className="flex-1 min-w-[140px] h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg sm:shadow-xl rounded-lg sm:rounded-xl transition-all active:scale-[0.98]"
                    onClick={handleStartSession}
                  >
                    <IconPlayerPlay className="w-5 h-5 mr-2" />
                    {LL.session.startClass()}
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 min-w-[140px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                    onClick={handleStartEntry}
                  >
                    <IconPlus className="w-5 h-5 mr-2" />
                    {LL.grades.addNote()}
                  </Button>
                </>
              )
            : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl"
                    onClick={handleCancelEntry}
                  >
                    {LL.common.cancel()}
                  </Button>
                  <Button
                    className="flex-1 min-w-[120px] h-11 sm:h-12 font-bold rounded-lg sm:rounded-xl shadow-xl"
                    onClick={handleSaveEntry}
                    disabled={isSaving}
                  >
                    <IconDeviceFloppy className="w-5 h-5 mr-2" />
                    {LL.common.save()}
                  </Button>
                </>
              )}
        </div>
      </header>

      {/* Entry Mode Controls - Evaluation Metadata */}
      <AnimatePresence>
        {isEntryMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Collapsible open={isMetaExpanded} onOpenChange={setIsMetaExpanded}>
              <div className="rounded-2xl bg-muted/20 border border-border/50 overflow-hidden shadow-sm">
                <CollapsibleTrigger
                  render={(
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                          {teacherSubjects.length > 0 && selectedSubjectId && (
                            <>
                              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span className="text-xs font-bold text-muted-foreground">
                                {teacherSubjects.find(s => s.id === selectedSubjectId)?.name}
                              </span>
                            </>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-5 text-[10px] font-bold uppercase bg-primary/5 border-primary/20 text-primary">
                            {LL.grades[noteType]()}
                          </Badge>
                          <span className="text-sm font-black text-foreground">
                            {noteTitle || LL.grades.noDescription()}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-xs font-bold text-muted-foreground uppercase">
                            C.
                            {weight}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-xs font-bold text-muted-foreground uppercase">
                            /
                            {gradeOutOf}
                          </span>
                        </div>
                      </div>
                      <IconChevronDown
                        className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform duration-300',
                          isMetaExpanded && 'rotate-180',
                        )}
                      />
                    </Button>
                  )}
                />

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4 border-t border-border/40 bg-muted/10">
                    <div className="flex flex-row items-end gap-3 mt-4">
                      {/* Evaluation Type */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 truncate block">
                          {LL.grades.nature()}
                        </label>
                        <Select
                          value={noteType}
                          onValueChange={val => setNoteType(val as 'quizzes' | 'tests' | 'level_tests')}
                        >
                          <SelectTrigger className="w-full h-11! rounded-xl bg-background border-border/50 font-semibold px-3 overflow-hidden">
                            <SelectValue placeholder={LL.grades.selectType()}>
                              {noteType === 'quizzes'
                                ? LL.grades.quizzes()
                                : noteType === 'tests'
                                  ? LL.grades.tests()
                                  : noteType === 'level_tests' ? LL.grades.level_tests() : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quizzes">{LL.grades.quizzes()}</SelectItem>
                            <SelectItem value="tests">{LL.grades.tests()}</SelectItem>
                            <SelectItem value="level_tests">{LL.grades.level_tests()}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Weight, Barème & Subject Group */}
                      <div className="flex-2 flex flex-row items-end gap-2">
                        <div className="w-20 shrink-0 space-y-1.5">
                          <label
                            htmlFor="note-weight-input"
                            className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                          >
                            Coef.
                          </label>
                          <NumberField
                            id="note-weight-input"
                            min={1}
                            max={10}
                            value={weight}
                            onValueChange={val => setWeight(val || 1)}
                          >
                            <NumberFieldGroup className="h-11! rounded-xl bg-background border border-border/50 overflow-hidden">
                              <NumberFieldDecrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none" />
                              <NumberFieldInput className="border-none h-full bg-transparent font-bold ring-0! shadow-none! text-center p-0" title={LL.grades.coeff()} />
                              <NumberFieldIncrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none" />
                            </NumberFieldGroup>
                          </NumberField>
                        </div>

                        <div className="w-20 shrink-0 space-y-1.5">
                          <label
                            htmlFor="note-outof-input"
                            className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                          >
                            {LL.grades.grading()}
                          </label>
                          <NumberField
                            id="note-outof-input"
                            min={1}
                            max={100}
                            value={gradeOutOf}
                            onValueChange={val => setGradeOutOf(val || 20)}
                          >
                            <NumberFieldGroup className="h-11! rounded-xl bg-background border border-border/50 overflow-hidden">
                              <NumberFieldDecrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none" />
                              <NumberFieldInput className="border-none h-full bg-transparent font-bold ring-0! shadow-none! text-center p-0" title={LL.grades.grading()} />
                              <NumberFieldIncrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none" />
                            </NumberFieldGroup>
                          </NumberField>
                        </div>

                        {teacherSubjects.length > 1 && (
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 truncate block">
                              {LL.grades.subject()}
                            </label>
                            <Select
                              value={selectedSubjectId || ''}
                              onValueChange={val => setSelectedSubjectId(val)}
                            >
                              <SelectTrigger className="w-full h-11! rounded-xl bg-background border-border/50 font-semibold px-3 overflow-hidden">
                                <SelectValue placeholder={LL.grades.selectSubject()}>
                                  {selectedSubjectId ? teacherSubjects.find(s => s.id === selectedSubjectId)?.name : undefined}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {teacherSubjects.map(subject => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="note-description-input"
                        className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                      >
                        {LL.grades.description()}
                      </label>
                      <Input
                        id="note-description-input"
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        placeholder={LL.grades.egInterro1()}
                        className="h-11 rounded-xl bg-background border-border/50 text-sm"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar - Hidden in Entry Mode */}
      {!isEntryMode && (
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={LL.search.students()}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      )}

      {/* Students List */}
      {processedStudents.length > 0
        ? (
            <>
              {/* Session Mode View */}
              {isSessionActive && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {/* Session Stats Panel */}
                  <div className="sticky top-0 z-30 -mx-4 px-4 pb-2 bg-background/95 backdrop-blur-md border-b border-border/50 lg:static lg:mx-0 lg:px-0 lg:pb-0 lg:bg-transparent lg:border-none">
                    <SessionStatsPanel
                      mode={
                        sessionMode === 'attendance_initial'
                          ? 'attendance_initial'
                          : sessionMode === 'attendance_late'
                            ? 'attendance_late'
                            : sessionMode === 'participation'
                              ? 'participation'
                              : 'attendance_initial'
                      }
                      totalStudents={students.length}
                      attendanceStats={attendanceStats}
                      participationStats={participationStats}
                      actionLabel={
                        sessionMode === 'attendance_initial'
                          ? LL.session.finishRollCall()
                          : sessionMode === 'attendance_late'
                            ? LL.session.goToParticipation()
                            : sessionMode === 'participation'
                              ? LL.session.finalize()
                              : ''
                      }
                      onAction={
                        sessionMode === 'attendance_initial'
                          ? handleFinishInitialAttendance
                          : sessionMode === 'attendance_late'
                            ? handleGoToParticipation
                            : sessionMode === 'participation'
                              ? () => setSessionMode('finalization')
                              : () => {}
                      }
                      secondaryActionLabel={LL.common.cancel()}
                      onSecondaryAction={handleCancelSession}
                    />
                  </div>

                  {/* Session List View */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {processedStudents.map((student) => {
                      // Attendance Mode Card
                      if (isAttendanceMode) {
                        return (
                          <motion.div key={student.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <AttendanceStudentCard
                              student={student}
                              status={getRecordForStudent(student.id)?.status || 'present'}
                              onUpdateStatus={updateAttendanceStatus}
                              isLateMode={sessionMode === 'attendance_late'}
                            />
                          </motion.div>
                        )
                      }

                      // Participation Mode Card
                      if (sessionMode === 'participation') {
                        // Filter out absent students
                        const isAbsent = getRecordForStudent(student.id)?.status === 'absent'
                        if (isAbsent)
                          return null

                        return (
                          <motion.div key={student.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <ParticipationStudentCard
                              student={student}
                              hasParticipated={hasStudentParticipated(student.id)}
                              comment={getCommentForStudent(student.id)}
                              onToggleParticipation={() => toggleParticipation(student.id)}
                              onComment={() => openCommentModal(student.id)}
                            />
                          </motion.div>
                        )
                      }

                      return null
                    })}
                  </div>
                </div>
              )}

              {/* Participation Comment Dialog */}
              <Dialog open={!!selectedStudentId} onOpenChange={open => !open && closeCommentModal()}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{LL.participation.comment()}</DialogTitle>
                    <DialogDescription>
                      {LL.session.addCommentDescription()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder={LL.session.commentPlaceholder()}
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={closeCommentModal}>
                      {LL.common.cancel()}
                    </Button>
                    <Button onClick={saveComment}>
                      {LL.common.save()}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Session Finalization Sheet */}
              <SessionFinalizationSheet
                open={sessionMode === 'finalization'}
                onOpenChange={open => !open && setSessionMode('participation')}
                attendanceStats={attendanceStats}
                participationStats={participationStats}
                onFinalize={handleSubmitSession}
                isSubmitting={isSubmitting}
              />

              {/* Session Cancel Confirmation Dialog */}
              <ConfirmationDialog
                open={isSessionCancelDialogOpen}
                onOpenChange={setIsSessionCancelDialogOpen}
                onConfirm={() => {
                  resetAttendance()
                  resetParticipations()
                  setSessionMode('view')
                }}
                title={LL.common.cancel()}
                description={LL.common.cancelConfirmation()}
                confirmText={LL.common.cancel()}
                variant="destructive"
              />

              {/* Standard View (Hidden in Session Mode) */}
              {!isSessionActive && (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-3"
                    >
                      {processedStudents.map(student => (
                        <motion.div key={student.id} variants={item}>
                          <StudentCard
                            student={student}
                            isExpanded={expandedStudent === student.id}
                            classAverage={classStats.average}
                            onToggle={() => toggleStudentExpansion(student.id)}
                            isEntryMode={isEntryMode}
                            gradeValue={gradesMap.get(student.id)}
                            onGradeChange={val => handleGradeChange(student.id, val)}
                            gradeOutOf={gradeOutOf}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead
                              className="sticky left-0 z-20 min-w-[200px] cursor-pointer bg-muted/50 font-semibold transition-colors hover:bg-muted"
                              onClick={() => handleSort('name')}
                            >
                              <div className="flex items-center gap-2">
                                {LL.common.student()}
                                {sortConfig?.key === 'name' && (
                                  <span className="text-xs">
                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                            {!isEntryMode
                              ? (
                                  <>
                                    <TableHead className="text-center min-w-[100px]">{LL.common.participation()}</TableHead>
                                    <TableHead className="text-center min-w-[80px]">{LL.grades.quizzes()}</TableHead>
                                    <TableHead className="text-center min-w-[80px]">{LL.grades.tests()}</TableHead>
                                    <TableHead className="text-center min-w-[80px]">{LL.grades.level_tests()}</TableHead>
                                    <TableHead
                                      className="sticky right-0 z-20 min-w-[120px] bg-muted/50 text-center font-semibold cursor-pointer hover:bg-muted"
                                      onClick={() => handleSort('average')}
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        {LL.common.average()}
                                        {sortConfig?.key === 'average' && (
                                          <span className="text-xs">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                          </span>
                                        )}
                                      </div>
                                    </TableHead>
                                    <TableHead className="text-center min-w-[80px]">Actions</TableHead>
                                  </>
                                )
                              : (
                                  <TableHead className="text-center min-w-[150px] font-black text-primary italic">
                                    {LL.grades.newNoteTitle()}
                                    {' '}
                                    (
                                    {LL.grades.outOf()}
                                    {' '}
                                    {gradeOutOf}
                                    )
                                  </TableHead>
                                )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedStudents.map((student, idx) => (
                            <TableRow
                              key={student.id}
                              className={cn(
                                'transition-colors hover:bg-muted/50',
                                idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                              )}
                            >
                              <TableCell className="sticky left-0 z-10 bg-inherit min-w-[200px]">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                                    <AvatarImage src={student.photoUrl ?? undefined} alt={student.firstName} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                      {student.firstName[0]}
                                      {student.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                      {student.lastName}
                                      {' '}
                                      {student.firstName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{student.matricule}</p>
                                  </div>
                                </div>
                              </TableCell>
                              {!isEntryMode
                                ? (
                                    <>
                                      <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-medium">
                                          --
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center text-muted-foreground text-xs">--</TableCell>
                                      <TableCell className="text-center text-muted-foreground text-xs">--</TableCell>
                                      <TableCell className="text-center text-muted-foreground text-xs">--</TableCell>
                                      <TableCell className="sticky right-0 z-10 bg-inherit text-center font-bold text-lg text-muted-foreground border-l">
                                        --.--
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Link to="/app/students/$studentId/notes" params={{ studentId: student.id }}>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                            <IconEdit className="w-4 h-4" />
                                          </Button>
                                        </Link>
                                      </TableCell>
                                    </>
                                  )
                                : (
                                    <TableCell className="text-center bg-primary/5">
                                      <div className="flex items-center justify-center gap-2 max-w-[120px] mx-auto">
                                        <Input
                                          type="text"
                                          inputMode="decimal"
                                          placeholder="--"
                                          value={gradesMap.get(student.id) || ''}
                                          onChange={e => handleGradeChange(student.id, e.target.value)}
                                          className="h-10 text-center text-lg font-black bg-background border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/40"
                                        />
                                        <span className="text-xs font-bold text-muted-foreground">
                                          /
                                          {gradeOutOf}
                                        </span>
                                      </div>
                                    </TableCell>
                                  )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                </>
              )}
            </>

          )
        : (
            <EmptyStudents />
          )}

      {/* Unpublished Note Sheet */}
      {unpublishedNote && (
        <UnpublishedNoteSheet
          open={isUnpublishedSheetOpen}
          onOpenChange={setIsUnpublishedSheetOpen}
          note={unpublishedNote}
          totalStudents={students.length}
          onPublish={handlePublish}
          isPublishing={isSaving}
          onResume={() => {
            // Restore state from unpublished note
            setNoteTitle(unpublishedNote.title)
            setNoteType(unpublishedNote.type as 'quizzes' | 'tests' | 'level_tests')
            setWeight(unpublishedNote.weight ?? 1)
            setGradeOutOf(unpublishedNote.totalPoints || 20)
            setSelectedSubjectId(unpublishedNote.subjectId)
            const map = new Map()
            unpublishedNote.details.forEach(d => map.set(d.studentId, d.value))
            setGradesMap(map)
            setIsEntryMode(true)
            setIsUnpublishedSheetOpen(false)
            setIsMetaExpanded(false)
          }}
        />
      )}

      {/* Publish Confirmation Dialog */}
      {unpublishedNote && (
        <ConfirmationDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={executePublish}
          isLoading={isSaving}
          title={LL.grades.confirmPublishTitle()}
          description={LL.grades.confirmPublishDescription({ count: students.length - unpublishedNote.details.length })}
          confirmText={LL.grades.confirmPublish()}
          cancelText={LL.common.cancel()}
        />
      )}
    </div>
  )
}

interface StudentCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string
    photoUrl: string | null
  }
  isExpanded: boolean
  classAverage: number | null
  onToggle: () => void
  onGradeChange?: (val: string) => void
  isEntryMode: boolean
  gradeValue: string | undefined
  gradeOutOf?: number
}

function StudentCard({
  student,
  isExpanded,
  classAverage,
  onToggle,
  isEntryMode,
  gradeValue,
  onGradeChange,
  gradeOutOf = 20,
}: StudentCardProps) {
  const { LL } = useI18nContext()
  // Mock data - would be replaced with actual grade data
  // Using as const assertion to keep the type as number | null
  const studentAverage = null as number | null
  const participationCount = 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all',
        !isEntryMode ? 'hover:shadow-lg hover:scale-[1.01]' : '',
      )}
    >
      <div className="w-full p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-10 w-10 border border-border/50 shrink-0">
            <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {student.firstName[0]}
              {student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground text-sm">
              {student.firstName}
              {' '}
              {student.lastName}
            </h3>
            {!isEntryMode && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="h-5 font-normal text-xs">
                  <span className="text-muted-foreground">Participation:</span>
                  <span className="ml-1 font-semibold">{participationCount}</span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {isEntryMode
          ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="--"
                  value={gradeValue || ''}
                  onChange={e => onGradeChange?.(e.target.value)}
                  className="h-12 w-20 text-center text-xl font-black bg-muted/40 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm font-black text-muted-foreground">
                  /
                  {gradeOutOf}
                </span>
              </div>
            )
          : (
              <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2"
              >
                <div className="text-right">
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-tighter">{LL.common.average()}</div>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2.5 py-1 font-bold text-base',
                      getPerformanceBgColor(studentAverage),
                    )}
                  >
                    {getPerformanceIcon(studentAverage, classAverage)}
                    <span className={getPerformanceColor(studentAverage)}>
                      {studentAverage !== null ? studentAverage.toFixed(2) : '--.--'}
                    </span>
                  </div>
                </div>
                {isExpanded
                  ? (
                      <IconChevronUp className="h-5 w-5 text-muted-foreground" />
                    )
                  : (
                      <IconChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
              </button>
            )}
      </div>

      <AnimatePresence>
        {isExpanded && !isEntryMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t bg-linear-to-br from-muted/30 to-muted/10"
          >
            <div className="p-4 space-y-4">
              {/* Grade Details */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.quizzes()}</span>
                  <span className="font-semibold text-base text-muted-foreground">--</span>
                </div>
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.tests()}</span>
                  <span className="font-semibold text-base text-muted-foreground">--</span>
                </div>
                <div className="flex flex-col rounded-md bg-background p-2">
                  <span className="mb-1.5 font-medium text-muted-foreground">{LL.grades.level_tests()}</span>
                  <span className="font-semibold text-base text-muted-foreground">--</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link to="/app/students/$studentId/notes" params={{ studentId: student.id }} className="flex-1">
                  <Button variant="outline" className="w-full h-10 font-bold border-border/60 hover:bg-muted/50">
                    <IconEdit className="w-4 h-4 mr-2" />
                    {LL.notes.manage()}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EmptyStudents() {
  const { LL } = useI18nContext()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center backdrop-blur-sm sm:p-12"
    >
      <IconUsers className="mb-4 size-12 text-muted-foreground/50" />
      <h3 className="mb-2 font-medium text-foreground text-lg">
        {LL.classes.noStudents()}
      </h3>
      <p className="text-muted-foreground text-sm">
        {LL.classes.noStudents()}
      </p>
    </motion.div>
  )
}

function ClassNotFound({ schoolId }: { schoolId: string }) {
  const { LL } = useI18nContext()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-destructive/20 blur-[100px]" />
        <div className="relative rounded-[2.5rem] bg-card/50 border border-border/50 p-12 shadow-2xl backdrop-blur-2xl">
          <IconSchool className="h-20 w-20 text-destructive opacity-40" />
        </div>
      </motion.div>
      <div className="space-y-4 max-w-sm text-center">
        <h2 className="text-3xl font-black tracking-tight">{LL.classes.notFound()}</h2>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {LL.classes.notFound()}
        </p>
        <Link to="/app/schools/$schoolId/classes" params={{ schoolId }}>
          <Button>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            {LL.classes.backToClasses()}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ClassDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

interface UnpublishedNoteSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: NoteWithDetails
  totalStudents: number
  onPublish: () => void
  onResume: () => void
  isPublishing: boolean
}

function UnpublishedNoteSheet({
  open,
  onOpenChange,
  note,
  totalStudents,
  onPublish,
  onResume,
  isPublishing,
}: UnpublishedNoteSheetProps) {
  const { LL } = useI18nContext()
  const participatedCount = note.details.length
  const missingCount = totalStudents - participatedCount
  const isComplete = missingCount === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] p-0 overflow-hidden border-t-0 bg-background max-w-2xl mx-auto">
        <SheetHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-black">
              {LL.grades.draftTitle()}
            </SheetTitle>
            <SheetDescription>
              {LL.grades.draftSubtitle()}
            </SheetDescription>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
            {LL.grades.pendingBadge()}
          </Badge>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Note Metadata Card */}
          <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconBook className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-foreground">{note.title}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {String((LL.grades[note.type as keyof TranslationFunctions['grades']] as () => string)?.() || note.type)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-foreground">
                  {LL.grades.coeff()}
                  {' '}
                  {note.weight}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {LL.grades.outOf()}
                  {' '}
                  {note.totalPoints || 20}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{LL.grades.participations()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{participatedCount}</span>
                  <span className="text-sm font-bold text-muted-foreground">
                    /
                    {totalStudents}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{LL.grades.missing()}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className={cn(
                    'text-xl font-black',
                    missingCount > 0 ? 'text-amber-500' : 'text-emerald-500',
                  )}
                  >
                    {missingCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              onClick={onResume}
            >
              <IconEdit className="w-5 h-5 mr-3" />
              {LL.grades.resumeEntry()}
            </Button>

            <Button
              variant="outline"
              className={cn(
                'w-full h-14 rounded-2xl font-black text-lg',
                isComplete
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
              )}
              onClick={onPublish}
              disabled={isPublishing}
            >
              <IconPlayerPlay className="w-5 h-5 mr-3" />
              {isPublishing ? LL.grades.publishing() : LL.grades.publishDraft()}
            </Button>

            {!isComplete && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <IconAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                  {LL.grades.missingStudentsWarningPublish({ count: missingCount })}
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
