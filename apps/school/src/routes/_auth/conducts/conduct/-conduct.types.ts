export type ConductStatus = 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed'
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export interface StudentConductAggregate {
  incidents: number
  sanctions: number
  rewards: number
  notes: number
  latestStatus: ConductStatus | null
}

export interface ConductStudentRow {
  studentId: string
  studentName: string
  matricule: string | null
  photoUrl: string | null
  className: string
  score: number
  appreciation: 'excellent' | 'good' | 'warning' | 'critical'
  attendanceStatus: AttendanceStatus | null
  attendanceRate: number | null
  attendanceRecordsCount: number
  incidents: number
  sanctions: number
  rewards: number
  notes: number
  absentCount: number
  lateCount: number
  excusedCount: number
  detailScores: {
    attendance: number
    punctuality: number
    morality: number
    discipline: number
  }
  latestStatus: ConductStatus | null
}

export interface ConductSummary {
  totalStudents: number
  averageScore: number
  totalIncidents: number
  totalSanctions: number
  attendanceKnownCount: number
  presentCount: number
  presentRate: number
  byStatus: {
    present: number
    late: number
    absent: number
    excused: number
  }
}

export interface ConductClassOption {
  class: {
    id: string
    section: string
  }
  grade?: {
    name?: string | null
  } | null
}

export interface ConductStudentSource {
  student: {
    id: string
    lastName: string
    firstName: string
    matricule: string | null
    photoUrl?: string | null
  }
  currentClass?: {
    gradeName?: string | null
    section?: string | null
  } | null
  attendanceSummary?: {
    latestStatus: AttendanceStatus | null
    latestDate: string | null
    absentCount: number
    lateCount: number
    excusedCount: number
    presentCount: number
  } | null
}

export interface ConductRecordSource {
  studentId?: string | null
  type: 'incident' | 'sanction' | 'reward' | 'note'
  status?: string | null
}
