import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { ClassDetailHeader } from '@/components/class-details/ClassDetailHeader'
import {
  ClassDetailSkeleton,
  ClassNotFound,
  EmptyStudents,
} from '@/components/class-details/ClassDetailStates'
import { ClassDetailStats } from '@/components/class-details/ClassDetailStats'
import { ClassDetailStudentsSection } from '@/components/class-details/ClassDetailStudentsSection'
import { GradeEntryControls } from '@/components/class-details/GradeEntryControls'
import { useClassDetailData } from '@/hooks/use-class-detail-data'
import { useClassDetailGradeEntry } from '@/hooks/use-class-detail-grade-entry'
import { useClassDetailSession } from '@/hooks/use-class-detail-session'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { detailedScheduleQueryOptions } from '@/lib/queries/schedule'
import { TimeSync } from '@/lib/tracking/time-sync'

type SortKey = 'name' | 'average' | 'participation' | 'quizzes' | 'tests'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

interface ClassDetailPageProps {
  schoolId: string
  classId: string
  timetableSessionId?: string
}

export function ClassDetailPage({
  schoolId,
  classId,
  timetableSessionId,
}: ClassDetailPageProps) {
  useI18nContext()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const today = new Date()
  const { data: scheduleData } = useQuery({
    ...detailedScheduleQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    }),
    enabled: !!context && !!timetableSessionId,
  })

  const currentSession = scheduleData?.sessions.find(s => s.id === timetableSessionId)

  const sessionTimings = useMemo(() => {
    if (!currentSession)
      return { isWithinTimeWindow: false, isLate: false }

    const now = new Date(TimeSync.getCorrectedTime())
    const startDateTime = new Date(`${currentSession.date}T${currentSession.startTime}:00`)
    const endDateTime = new Date(`${currentSession.date}T${currentSession.endTime}:00`)
    const openWindowTime = new Date(startDateTime.getTime() - 10 * 60 * 1000)

    return {
      isWithinTimeWindow: now >= openWindowTime && now <= endDateTime,
      isLate: now > startDateTime,
    }
  }, [currentSession, timetableSessionId])

  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const {
    classInfo,
    students,
    teacherSubjects,
    classStats,
    unpublishedNote,
    unpublishedCount,
    refetchUnpublished,
    isPending: dataPending,
  } = useClassDetailData({
    classId,
    schoolId,
    schoolYearId: context?.schoolYearId ?? undefined,
    teacherId: context?.teacherId ?? undefined,
    searchQuery,
  })

  const session = useClassDetailSession({
    students,
    timetableSessionId,
    teacherId: context?.teacherId ?? undefined,
    schoolId,
    schoolLocation: null,
  })

  const gradeEntry = useClassDetailGradeEntry({
    classId,
    schoolId,
    teacherId: context?.teacherId ?? undefined,
    students,
    teacherSubjects,
    unpublishedNote,
    refetchUnpublished,
  })

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc')
      direction = 'desc'
    setSortConfig({ key, direction })
  }

  const processedStudents = useMemo(() => {
    let result = [...students]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        s =>
          s.firstName.toLowerCase().includes(query)
          || s.lastName.toLowerCase().includes(query)
          || s.matricule.toLowerCase().includes(query),
      )
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === 'name') {
          const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
          const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
          return sortConfig.direction === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA)
        }
        return 0
      })
    }

    return result
  }, [students, searchQuery, sortConfig])

  const isPending = contextLoading || dataPending

  if (isPending)
    return <ClassDetailSkeleton />

  if (!classInfo)
    return <ClassNotFound schoolId={schoolId} />

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500">
      <ClassDetailHeader
        schoolId={schoolId}
        className={classInfo.name}
        isSessionActive={session.isSessionActive}
        isEntryMode={gradeEntry.isEntryMode}
        isSaving={gradeEntry.isSaving}
        isWithinTimeWindow={sessionTimings.isWithinTimeWindow}
        isLate={sessionTimings.isLate}
        onStartSession={session.handleStartSession}
        onStartEntry={gradeEntry.handleStartEntry}
        onCancelEntry={gradeEntry.handleCancelEntry}
        onSaveEntry={gradeEntry.handleSaveEntry}
      />

      {!gradeEntry.isEntryMode && !session.isSessionActive && (
        <ClassDetailStats
          totalStudents={students.length}
          classAverage={classStats.average}
        />
      )}

      <GradeEntryControls
        isEntryMode={gradeEntry.isEntryMode}
        isMetaExpanded={gradeEntry.isMetaExpanded}
        setIsMetaExpanded={gradeEntry.setIsMetaExpanded}
        noteType={gradeEntry.noteType}
        setNoteType={gradeEntry.setNoteType}
        noteTitle={gradeEntry.noteTitle}
        setNoteTitle={gradeEntry.setNoteTitle}
        weight={gradeEntry.weight}
        setWeight={gradeEntry.setWeight}
        gradeOutOf={gradeEntry.gradeOutOf}
        setGradeOutOf={gradeEntry.setGradeOutOf}
        teacherSubjects={teacherSubjects}
        selectedSubjectId={gradeEntry.selectedSubjectId}
        setSelectedSubjectId={gradeEntry.setSelectedSubjectId}
      />

      {processedStudents.length > 0
        ? (
            <ClassDetailStudentsSection
              isEntryMode={gradeEntry.isEntryMode}
              isSessionActive={session.isSessionActive}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              processedStudents={processedStudents}
              sessionMode={session.sessionMode}
              setSessionMode={session.setSessionMode}
              attendanceStats={session.attendanceStats}
              participationStats={session.participationStats}
              getRecordForStudent={session.getRecordForStudent}
              updateAttendanceStatus={session.updateAttendanceStatus}
              hasStudentParticipated={session.hasStudentParticipated}
              toggleParticipation={session.toggleParticipation}
              openCommentModal={session.openCommentModal}
              getCommentForStudent={session.getCommentForStudent}
              onFinishInitialAttendance={session.handleFinishInitialAttendance}
              onGoToParticipation={session.handleGoToParticipation}
              onCancelSession={session.handleCancelSession}
              selectedStudentId={session.selectedStudentId}
              comment={session.comment}
              setComment={session.setComment}
              closeCommentModal={session.closeCommentModal}
              saveComment={session.saveComment}
              isSubmitting={session.isSubmitting}
              isSessionCancelDialogOpen={session.isSessionCancelDialogOpen}
              setIsSessionCancelDialogOpen={session.setIsSessionCancelDialogOpen}
              resetAttendance={session.resetAttendance}
              resetParticipations={session.resetParticipations}
              expandedStudent={gradeEntry.expandedStudent}
              toggleStudentExpansion={gradeEntry.toggleStudentExpansion}
              classAverage={classStats.average}
              gradeOutOf={gradeEntry.gradeOutOf}
              gradesMap={gradeEntry.gradesMap}
              onGradeChange={gradeEntry.handleGradeChange}
              onSort={handleSort}
              sortConfig={sortConfig}
              unpublishedNote={unpublishedNote}
              unpublishedCount={unpublishedCount}
              isUnpublishedSheetOpen={gradeEntry.isUnpublishedSheetOpen}
              setIsUnpublishedSheetOpen={gradeEntry.setIsUnpublishedSheetOpen}
              onPublish={gradeEntry.handlePublish}
              isPublishing={gradeEntry.isSaving}
              onResume={gradeEntry.handleResumeUnpublished}
              isConfirmDialogOpen={gradeEntry.isConfirmDialogOpen}
              setIsConfirmDialogOpen={gradeEntry.setIsConfirmDialogOpen}
              onConfirmPublish={gradeEntry.executePublish}
              onSubmitSession={session.handleSubmitSession}
              totalStudents={students.length}
            />
          )
        : (
            <EmptyStudents />
          )}
    </div>
  )
}
