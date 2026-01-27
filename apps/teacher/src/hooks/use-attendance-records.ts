import { useCallback, useMemo, useRef, useState } from 'react'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecord {
  id: string
  studentId: string
  status: AttendanceStatus
  updatedAt: string
}

interface UseAttendanceRecordsProps {
  students: Array<{ id: string }>
}

export function useAttendanceRecords({
  students,
}: UseAttendanceRecordsProps) {
  const initializedRef = useRef(false)

  // Initialize attendance records lazily
  const getInitialRecords = (): AttendanceRecord[] => {
    if (students.length > 0 && !initializedRef.current) {
      initializedRef.current = true
      return students.map(student => ({
        id: `${student.id}-${Date.now()}`,
        studentId: student.id,
        status: 'present' as AttendanceStatus,
        updatedAt: new Date().toISOString(),
      }))
    }
    return []
  }

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(getInitialRecords)
  const [isFirstAttendanceFinished, setIsFirstAttendanceFinished] = useState(false)

  const updateAttendanceStatus = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      if (!studentId)
        return
      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(record => record.studentId === studentId)

        if (existingIndex >= 0) {
          const updated = [...prev]
          const existingRecord = updated[existingIndex]
          if (existingRecord) {
            updated[existingIndex] = {
              ...existingRecord,
              status,
              updatedAt: new Date().toISOString(),
            }
          }
          return updated
        }
        // Create new record if not found
        const newRecord: AttendanceRecord = {
          id: `${studentId}-${Date.now()}`,
          studentId,
          status,
          updatedAt: new Date().toISOString(),
        }
        return [...prev, newRecord]
      })
    },
    [],
  )

  const attendanceStats = useMemo(() => {
    return attendanceRecords.reduce(
      (acc, record) => {
        if (record.status === 'present')
          acc.present++
        if (record.status === 'absent')
          acc.absent++
        if (record.status === 'late')
          acc.late++
        return acc
      },
      { present: 0, absent: 0, late: 0 },
    )
  }, [attendanceRecords])

  const getRecordForStudent = useCallback(
    (studentId: string) => {
      return attendanceRecords.find(r => r.studentId === studentId)
    },
    [attendanceRecords],
  )

  const resetAttendance = useCallback(() => {
    setAttendanceRecords([])
    setIsFirstAttendanceFinished(false)
  }, [])

  return {
    attendanceRecords,
    attendanceStats,
    updateAttendanceStatus,
    getRecordForStudent,
    isFirstAttendanceFinished,
    setIsFirstAttendanceFinished,
    resetAttendance,
  }
}
