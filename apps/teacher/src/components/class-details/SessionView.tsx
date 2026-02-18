import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

const AttendanceStudentCard = lazy(() => import('@/components/session/AttendanceStudentCard').then(m => ({ default: m.AttendanceStudentCard })))
const ParticipationStudentCard = lazy(() => import('@/components/session/ParticipationStudentCard').then(m => ({ default: m.ParticipationStudentCard })))
const SessionStatsPanel = lazy(() => import('@/components/session/SessionStatsPanel').then(m => ({ default: m.SessionStatsPanel })))

type SessionMode = 'view' | 'attendance_initial' | 'attendance_late' | 'participation' | 'finalization'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
  photoUrl: string | null
}

interface SessionViewProps {
  sessionMode: SessionMode
  setSessionMode: (mode: SessionMode) => void
  students: Student[]
  attendanceStats: any
  participationStats: any
  getRecordForStudent: (id: string) => any
  updateAttendanceStatus: (id: string, status: any) => void
  hasStudentParticipated: (id: string) => boolean
  toggleParticipation: (id: string) => void
  openCommentModal: (id: string) => void
  getCommentForStudent: (id: string) => string | undefined
  onFinishInitialAttendance: () => void
  onGoToParticipation: () => void
  onCancelSession: () => void
}

export function SessionView({
  sessionMode,
  setSessionMode,
  students,
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
}: SessionViewProps) {
  const { LL } = useI18nContext()
  const isAttendanceMode = sessionMode === 'attendance_initial' || sessionMode === 'attendance_late'

  if (sessionMode === 'view')
    return null

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Session Stats Panel */}
      <div className="sticky top-0 z-30 -mx-4 px-4 pb-2 bg-background/95 backdrop-blur-md border-b border-border/50 lg:static lg:mx-0 lg:px-0 lg:pb-0 lg:bg-transparent lg:border-none">
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
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
                ? onFinishInitialAttendance
                : sessionMode === 'attendance_late'
                  ? onGoToParticipation
                  : sessionMode === 'participation'
                    ? () => setSessionMode('finalization')
                    : () => {}
            }
            secondaryActionLabel={LL.common.cancel()}
            onSecondaryAction={onCancelSession}
          />
        </Suspense>
      </div>

      {/* Session List View */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Suspense fallback={<div className="col-span-full text-center p-4">Loading students...</div>}>
          {students.map((student) => {
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
        </Suspense>
      </div>
    </div>
  )
}
