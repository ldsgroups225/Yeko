import { useState } from 'react'
import { toast } from 'sonner'
import { useAttendanceRecords } from '@/hooks/use-attendance-records'
import { useParticipationManagement } from '@/hooks/use-participation-management'
import { useI18nContext } from '@/i18n/i18n-react'
import { completeSession, startSession } from '@/teacher/functions/sessions'

interface SessionStudent {
  id: string
}

interface UseClassDetailSessionParams {
  students: SessionStudent[]
  timetableSessionId?: string
  teacherId?: string
}

export function useClassDetailSession({
  students,
  timetableSessionId,
  teacherId,
}: UseClassDetailSessionParams) {
  const { LL } = useI18nContext()
  const [sessionMode, setSessionMode] = useState<
    'view' | 'attendance_initial' | 'attendance_late' | 'participation' | 'finalization'
  >('view')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionCancelDialogOpen, setIsSessionCancelDialogOpen] = useState(false)

  const isSessionActive = sessionMode !== 'view'
  const sessionStudents = isSessionActive ? students : []

  const {
    attendanceRecords,
    attendanceStats,
    updateAttendanceStatus,
    getRecordForStudent,
    setIsFirstAttendanceFinished,
    resetAttendance,
  } = useAttendanceRecords({
    students: sessionStudents,
  })

  const {
    participationStats,
    toggleParticipation,
    hasStudentParticipated,
    getCommentForStudent,
    setComment,
    comment,
    openCommentModal,
    closeCommentModal,
    saveComment,
    resetParticipations,
    selectedStudentId,
  } = useParticipationManagement({
    students: sessionStudents,
    attendanceRecords,
  })

  const handleStartSession = async () => {
    if (!teacherId || !timetableSessionId)
      return
    try {
      const result = await startSession({
        data: {
          timetableSessionId,
          teacherId,
          date: new Date().toISOString(),
        },
      })

      if (result.success && result.sessionId) {
        setSessionId(result.sessionId)
        setSessionMode('attendance_initial')
        toast.success(LL.session.sessionSuccess())
      }
      else {
        toast.error(result.error ?? LL.common.error())
      }
    }
    catch {
      toast.error(LL.common.error())
    }
  }

  const handleFinishInitialAttendance = () => {
    setIsFirstAttendanceFinished(true)
    setSessionMode('attendance_late')
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
    if (!sessionId)
      return
    setIsSubmitting(true)
    try {
      const records: Record<string, 'present' | 'absent' | 'late'> = {}
      for (const student of students) {
        const record = getRecordForStudent(student.id)
        if (record)
          records[student.id] = record.status as 'present' | 'absent' | 'late'
      }

      const result = await completeSession({
        data: {
          sessionId,
          studentsPresent: attendanceStats.present,
          studentsAbsent: attendanceStats.absent,
          attendanceRecords: records,
          homework: data.homework || undefined,
          lessonCompleted: data.lessonCompleted,
        },
      })

      if (result.success) {
        toast.success(LL.session.sessionSuccess())
        setSessionMode('view')
        resetAttendance()
        resetParticipations()
      }
      else {
        toast.error(result.error ?? LL.common.error())
      }
    }
    catch {
      toast.error(LL.common.error())
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return {
    sessionMode,
    setSessionMode,
    isSessionActive,
    attendanceStats,
    participationStats,
    updateAttendanceStatus,
    getRecordForStudent,
    setIsFirstAttendanceFinished,
    resetAttendance,
    toggleParticipation,
    hasStudentParticipated,
    getCommentForStudent,
    setComment,
    comment,
    openCommentModal,
    closeCommentModal,
    saveComment,
    resetParticipations,
    selectedStudentId,
    isSubmitting,
    isSessionCancelDialogOpen,
    setIsSessionCancelDialogOpen,
    handleStartSession,
    handleFinishInitialAttendance,
    handleGoToParticipation,
    handleCancelSession,
    handleSubmitSession,
  }
}
