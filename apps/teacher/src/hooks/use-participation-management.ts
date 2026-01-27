import type { AttendanceRecord } from './use-attendance-records'
import { useCallback, useMemo, useState } from 'react'

export interface Participation {
  id: string
  studentId: string
  hasParticipated: boolean
  comment?: string
  createdAt: string
}

interface UseParticipationManagementProps {
  students: Array<{ id: string }>
  attendanceRecords: AttendanceRecord[]
}

const MIN_PARTICIPATIONS = 1
const MAX_PARTICIPATIONS = 5

export function useParticipationManagement({
  students,
  attendanceRecords,
}: UseParticipationManagementProps) {
  const [participations, setParticipations] = useState<Participation[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  // Filter out absent students - only present and late students can participate
  const eligibleStudents = useMemo(() => {
    const absentStudentIds = attendanceRecords
      .filter(record => record.status === 'absent')
      .map(record => record.studentId)

    return students.filter(student => !absentStudentIds.includes(student.id))
  }, [students, attendanceRecords])

  const toggleParticipation = useCallback((studentId: string) => {
    setParticipations((prev) => {
      const existingIndex = prev.findIndex(p => p.studentId === studentId)

      if (existingIndex >= 0) {
        // Remove existing participation
        return prev.filter((_, index) => index !== existingIndex)
      }
      // Add new participation
      const newParticipation: Participation = {
        id: `${studentId}-${Date.now()}`,
        studentId,
        hasParticipated: true,
        createdAt: new Date().toISOString(),
      }
      return [...prev, newParticipation]
    })
  }, [])

  const openCommentModal = useCallback(
    (studentId: string) => {
      setSelectedStudentId(studentId)
      const existingParticipation = participations.find(p => p.studentId === studentId)
      setComment(existingParticipation?.comment || '')
    },
    [participations],
  )

  const saveComment = useCallback(() => {
    if (selectedStudentId) {
      setParticipations(prev =>
        prev.map(p => (p.studentId === selectedStudentId ? { ...p, comment } : p)),
      )
      setSelectedStudentId(null)
      setComment('')
    }
  }, [selectedStudentId, comment])

  const closeCommentModal = useCallback(() => {
    setSelectedStudentId(null)
    setComment('')
  }, [])

  const isParticipationRangeValid = useCallback(() => {
    const participatedCount = participations.filter(p => p.hasParticipated).length
    return participatedCount >= MIN_PARTICIPATIONS && participatedCount <= MAX_PARTICIPATIONS
  }, [participations])

  const hasStudentParticipated = useCallback(
    (studentId: string) => {
      return participations.some(p => p.studentId === studentId && p.hasParticipated)
    },
    [participations],
  )

  const getCommentForStudent = useCallback(
    (studentId: string) => {
      return participations.find(p => p.studentId === studentId)?.comment
    },
    [participations],
  )

  const participationStats = useMemo(() => {
    const totalStudents = eligibleStudents.length
    const participatedCount = participations.filter(p => p.hasParticipated).length
    const participationRate = totalStudents === 0 ? 0 : (participatedCount / totalStudents) * 100

    return {
      totalStudents,
      participatedCount,
      participationRate: participationRate.toFixed(1),
    }
  }, [eligibleStudents, participations])

  const resetParticipations = useCallback(() => {
    setParticipations([])
    setSelectedStudentId(null)
    setComment('')
  }, [])

  return {
    eligibleStudents,
    participations,
    selectedStudentId,
    comment,
    participationStats,
    toggleParticipation,
    openCommentModal,
    saveComment,
    closeCommentModal,
    setComment,
    isParticipationRangeValid,
    hasStudentParticipated,
    getCommentForStudent,
    resetParticipations,
  }
}
