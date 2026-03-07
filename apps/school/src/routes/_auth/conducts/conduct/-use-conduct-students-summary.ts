import type {
  ConductRecordSource,
  ConductStatus,
  ConductStudentRow,
  ConductStudentSource,
  ConductSummary,
  StudentConductAggregate,
} from './-conduct.types'
import { useMemo } from 'react'

interface UseConductStudentsSummaryParams {
  students: ConductStudentSource[]
  conductRecords: ConductRecordSource[]
  searchTerm: string
  notAvailableLabel: string
}

export function useConductStudentsSummary({
  students,
  conductRecords,
  searchTerm,
  notAvailableLabel,
}: UseConductStudentsSummaryParams) {
  const rows = useMemo<ConductStudentRow[]>(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()
    const recordsByStudent = new Map<string, StudentConductAggregate>()
    const uniqueStudents = new Map<string, ConductStudentSource>()

    for (const record of conductRecords) {
      if (!record.studentId)
        continue

      const current = recordsByStudent.get(record.studentId) ?? {
        incidents: 0,
        sanctions: 0,
        rewards: 0,
        notes: 0,
        latestStatus: null,
      }

      if (record.type === 'incident')
        current.incidents += 1
      if (record.type === 'sanction')
        current.sanctions += 1
      if (record.type === 'reward')
        current.rewards += 1
      if (record.type === 'note')
        current.notes += 1

      if (!current.latestStatus)
        current.latestStatus = (record.status ?? null) as ConductStatus | null

      recordsByStudent.set(record.studentId, current)
    }

    for (const entry of students) {
      if (!uniqueStudents.has(entry.student.id)) {
        uniqueStudents.set(entry.student.id, entry)
      }
    }

    return Array.from(uniqueStudents.values())
      .filter((entry) => {
        if (!normalizedQuery)
          return true

        const fullName = `${entry.student.lastName} ${entry.student.firstName}`.toLowerCase()
        const matricule = (entry.student.matricule ?? '').toLowerCase()
        const classLabel = `${entry.currentClass?.gradeName ?? ''} ${entry.currentClass?.section ?? ''}`.toLowerCase()

        return fullName.includes(normalizedQuery)
          || matricule.includes(normalizedQuery)
          || classLabel.includes(normalizedQuery)
      })
      .map((entry) => {
        const aggregate = recordsByStudent.get(entry.student.id) ?? {
          incidents: 0,
          sanctions: 0,
          rewards: 0,
          notes: 0,
          latestStatus: null,
        }

        const attendanceSummary = entry.attendanceSummary
        const absentCount = attendanceSummary?.absentCount ?? 0
        const lateCount = attendanceSummary?.lateCount ?? 0
        const excusedCount = attendanceSummary?.excusedCount ?? 0
        const presentCount = attendanceSummary?.presentCount ?? 0
        const attendanceRecordsCount = presentCount + absentCount + lateCount + excusedCount

        const detailScores = {
          attendance: clampScore(6 - (absentCount * 2) - (lateCount * 0.5), 6),
          punctuality: clampScore(3 - (lateCount * 0.5), 3),
          morality: clampScore(4 - (aggregate.incidents * 0.35) - (aggregate.sanctions * 0.5) + (aggregate.rewards * 0.4), 4),
          discipline: clampScore(7 - (aggregate.incidents * 1.25) - (aggregate.sanctions * 1.75) - (absentCount * 0.5), 7),
        }
        const score = Number((
          detailScores.attendance
          + detailScores.punctuality
          + detailScores.morality
          + detailScores.discipline
        ).toFixed(1))

        const attendanceRate = attendanceRecordsCount > 0
          ? Number((((presentCount + excusedCount) / attendanceRecordsCount) * 100).toFixed(1))
          : null

        let appreciation: ConductStudentRow['appreciation'] = 'critical'
        if (score >= 16)
          appreciation = 'excellent'
        else if (score >= 12)
          appreciation = 'good'
        else if (score >= 8)
          appreciation = 'warning'

        return {
          studentId: entry.student.id,
          studentName: `${entry.student.lastName} ${entry.student.firstName}`,
          matricule: entry.student.matricule,
          photoUrl: entry.student.photoUrl ?? null,
          className: entry.currentClass
            ? `${entry.currentClass.gradeName ?? ''} ${entry.currentClass.section ?? ''}`.trim()
            : notAvailableLabel,
          score,
          appreciation,
          attendanceStatus: attendanceSummary?.latestStatus ?? null,
          attendanceRate,
          attendanceRecordsCount,
          incidents: aggregate.incidents,
          sanctions: aggregate.sanctions,
          rewards: aggregate.rewards,
          notes: aggregate.notes,
          absentCount,
          lateCount,
          excusedCount,
          detailScores,
          latestStatus: aggregate.latestStatus,
        }
      })
  }, [conductRecords, notAvailableLabel, searchTerm, students])

  const summary = useMemo<ConductSummary>(() => {
    const totalStudents = rows.length
    const averageScore = totalStudents > 0
      ? Number((rows.reduce((sum, row) => sum + row.score, 0) / totalStudents).toFixed(1))
      : 0
    const totalIncidents = rows.reduce((sum, row) => sum + row.incidents, 0)
    const totalSanctions = rows.reduce((sum, row) => sum + row.sanctions, 0)
    const presentCount = rows.filter(row => row.attendanceStatus === 'present').length
    const lateCount = rows.filter(row => row.attendanceStatus === 'late').length
    const absentCount = rows.filter(row => row.attendanceStatus === 'absent').length
    const excusedCount = rows.filter(row => row.attendanceStatus === 'excused').length
    const attendanceKnownCount = rows.filter(row => row.attendanceStatus !== null).length
    const presentRate = attendanceKnownCount > 0
      ? Number(((presentCount / attendanceKnownCount) * 100).toFixed(1))
      : 0

    return {
      totalStudents,
      averageScore,
      totalIncidents,
      totalSanctions,
      attendanceKnownCount,
      presentCount,
      presentRate,
      byStatus: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,
      },
    }
  }, [rows])

  return { rows, summary }
}

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, Number(value.toFixed(1))))
}
