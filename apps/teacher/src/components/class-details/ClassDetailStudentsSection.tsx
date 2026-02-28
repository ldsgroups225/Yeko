import type { StudentCardProps } from '@/components/class-details/StudentCard'
import type { NoteWithDetails } from '@/lib/db/local-notes'
import { IconSearch } from '@tabler/icons-react'
import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { Input } from '@workspace/ui/components/input'
import { m as motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { ClassDetailDesktopTable } from '@/components/class-details/ClassDetailDesktopTable'
import { EmptyStudents } from '@/components/class-details/ClassDetailStates'
import { ParticipationCommentDialog } from '@/components/class-details/ParticipationCommentDialog'
import { SessionView } from '@/components/class-details/SessionView'
import { StudentCard } from '@/components/class-details/StudentCard'
import { UnpublishedNoteSheet } from '@/components/class-details/UnpublishedNoteSheet'
import { useI18nContext } from '@/i18n/i18n-react'

const SessionFinalizationSheet = lazy(() => import('@/components/session/SessionFinalizationSheet').then(m => ({ default: m.SessionFinalizationSheet })))

type Student = StudentCardProps['student']

interface SortConfig {
  key: 'name' | 'average' | 'participation' | 'quizzes' | 'tests'
  direction: 'asc' | 'desc'
}

interface ClassDetailStudentsSectionProps {
  isEntryMode: boolean
  isSessionActive: boolean
  searchQuery: string
  onSearchChange: (value: string) => void
  processedStudents: Student[]
  sessionMode: 'view' | 'attendance_initial' | 'attendance_late' | 'participation' | 'finalization'
  setSessionMode: (mode: 'view' | 'attendance_initial' | 'attendance_late' | 'participation' | 'finalization') => void
  attendanceStats: { present: number, absent: number, late: number }
  participationStats: { totalStudents: number, participatedCount: number, participationRate: string }
  getRecordForStudent: (studentId: string) => { status: string } | undefined
  updateAttendanceStatus: (studentId: string, status: 'present' | 'absent' | 'late') => void
  hasStudentParticipated: (studentId: string) => boolean
  toggleParticipation: (studentId: string) => void
  openCommentModal: (studentId: string) => void
  getCommentForStudent: (studentId: string) => string | undefined
  onFinishInitialAttendance: () => void
  onGoToParticipation: () => void
  onCancelSession: () => void
  selectedStudentId: string | null
  comment: string
  setComment: (value: string) => void
  closeCommentModal: () => void
  saveComment: () => void
  isSubmitting: boolean
  isSessionCancelDialogOpen: boolean
  setIsSessionCancelDialogOpen: (value: boolean) => void
  resetAttendance: () => void
  resetParticipations: () => void
  expandedStudent: string | null
  toggleStudentExpansion: (studentId: string) => void
  classAverage: number | null
  gradeOutOf: number
  gradesMap: Map<string, string>
  onGradeChange: (studentId: string, value: string) => void
  onSort: (key: SortConfig['key']) => void
  sortConfig: SortConfig | null
  unpublishedNote: NoteWithDetails | null | undefined
  unpublishedCount: number
  isUnpublishedSheetOpen: boolean
  setIsUnpublishedSheetOpen: (value: boolean) => void
  onPublish: () => void
  isPublishing: boolean
  onResume: () => void
  isConfirmDialogOpen: boolean
  setIsConfirmDialogOpen: (value: boolean) => void
  onConfirmPublish: () => void
  onSubmitSession: (data: { homework: { title: string, description: string, dueDate: string } | null, lessonCompleted: boolean }) => void
  totalStudents: number
}

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

export function ClassDetailStudentsSection({
  isEntryMode,
  isSessionActive,
  searchQuery,
  onSearchChange,
  processedStudents,
  sessionMode,
  setSessionMode,
  attendanceStats,
  participationStats,
  getRecordForStudent,
  updateAttendanceStatus,
  hasStudentParticipated,
  toggleParticipation,
  openCommentModal,
  getCommentForStudent,
  onFinishInitialAttendance,
  onGoToParticipation,
  onCancelSession,
  selectedStudentId,
  comment,
  setComment,
  closeCommentModal,
  saveComment,
  isSubmitting,
  isSessionCancelDialogOpen,
  setIsSessionCancelDialogOpen,
  resetAttendance,
  resetParticipations,
  expandedStudent,
  toggleStudentExpansion,
  classAverage,
  gradeOutOf,
  gradesMap,
  onGradeChange,
  onSort,
  sortConfig,
  unpublishedNote,
  unpublishedCount,
  isUnpublishedSheetOpen,
  setIsUnpublishedSheetOpen,
  onPublish,
  isPublishing,
  onResume,
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  onConfirmPublish,
  onSubmitSession,
  totalStudents,
}: ClassDetailStudentsSectionProps) {
  const { LL } = useI18nContext()

  return (
    <>
      {!isEntryMode && !isSessionActive && (
        <div className="relative mb-6">
          <IconSearch className="
            text-muted-foreground absolute top-1/2 left-3 h-4 w-4
            -translate-y-1/2
          "
          />
          <Input
            type="text"
            placeholder={LL.search.students()}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="h-11 rounded-xl pl-10"
          />
        </div>
      )}

      {processedStudents.length > 0
        ? (
            <>
              <SessionView
                sessionMode={sessionMode}
                setSessionMode={setSessionMode}
                students={processedStudents}
                attendanceStats={attendanceStats}
                participationStats={participationStats}
                getRecordForStudent={getRecordForStudent}
                updateAttendanceStatus={updateAttendanceStatus}
                hasStudentParticipated={hasStudentParticipated}
                toggleParticipation={toggleParticipation}
                openCommentModal={openCommentModal}
                getCommentForStudent={getCommentForStudent}
                onFinishInitialAttendance={onFinishInitialAttendance}
                onGoToParticipation={onGoToParticipation}
                onCancelSession={onCancelSession}
              />

              <ParticipationCommentDialog
                open={!!selectedStudentId && !isEntryMode && isSessionActive}
                onOpenChange={open => !open && closeCommentModal()}
                comment={comment}
                setComment={setComment}
                onCancel={closeCommentModal}
                onSave={saveComment}
              />

              <Suspense fallback={null}>
                <SessionFinalizationSheet
                  open={sessionMode === 'finalization'}
                  onOpenChange={open => !open && setSessionMode('participation')}
                  attendanceStats={attendanceStats}
                  participationStats={participationStats}
                  onFinalize={onSubmitSession}
                  isSubmitting={isSubmitting}
                />
              </Suspense>

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

              {!isSessionActive && (
                <>
                  <div className="
                    block
                    lg:hidden
                  "
                  >
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
                            classAverage={classAverage}
                            onToggle={() => toggleStudentExpansion(student.id)}
                            isEntryMode={isEntryMode}
                            gradeValue={gradesMap.get(student.id)}
                            onGradeChange={val => onGradeChange(student.id, val)}
                            gradeOutOf={gradeOutOf}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <ClassDetailDesktopTable
                    students={processedStudents}
                    isEntryMode={isEntryMode}
                    gradeOutOf={gradeOutOf}
                    gradesMap={gradesMap}
                    onGradeChange={onGradeChange}
                    onSort={onSort}
                    sortConfig={sortConfig}
                  />
                </>
              )}
            </>

          )
        : (
            <EmptyStudents />
          )}

      {unpublishedNote && (
        <UnpublishedNoteSheet
          open={isUnpublishedSheetOpen}
          onOpenChange={setIsUnpublishedSheetOpen}
          note={unpublishedCount > 0 ? unpublishedNote : ({} as NoteWithDetails)}
          totalStudents={totalStudents}
          onPublish={onPublish}
          isPublishing={isPublishing}
          onResume={onResume}
        />
      )}

      {unpublishedNote && (
        <ConfirmationDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={onConfirmPublish}
          isPending={isPublishing}
          title={LL.grades.confirmPublishTitle()}
          description={LL.grades.confirmPublishDescription({ count: totalStudents - unpublishedNote.details.length })}
          confirmText={LL.grades.confirmPublish()}
          cancelText={LL.common.cancel()}
        />
      )}
    </>
  )
}
