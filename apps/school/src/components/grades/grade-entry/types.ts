import type { GradeStatus, GradeType } from '@/schemas/grade'

export interface Student {
  id: string
  firstName: string
  lastName: string
  matricule?: string
}

export interface Grade {
  id: string
  studentId: string
  value: string
  status: GradeStatus
  type: GradeType
  description?: string | null
  gradeDate: string
  rejectionReason?: string | null
}

export interface GradeEntryStatistics {
  count: number
  average: number
  min: number
  max: number
  below10: number
  above15: number
}
