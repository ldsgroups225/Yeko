import type { Enrollment, EnrollmentInsert, EnrollmentStatus, Gender } from '../../drizzle/school-schema'

export type { Enrollment, EnrollmentInsert, EnrollmentStatus, Gender }

// ==================== Types ====================
export interface EnrollmentFilters {
  schoolId: string
  schoolYearId?: string
  classId?: string
  status?: EnrollmentStatus
  search?: string
  page?: number
  limit?: number
}
export interface CreateEnrollmentInput {
  studentId: string
  classId: string
  schoolYearId: string
  enrollmentDate?: string
  rollNumber?: number
}
export interface TransferInput {
  enrollmentId: string
  newClassId: string
  reason?: string
  effectiveDate?: string
}

export interface EnrollmentWithDetails {
  enrollment: Enrollment
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string | null
    photoUrl: string | null
    gender: Gender | null
  }
  class: {
    id: string
    section: string | null
    gradeName: string | null
    seriesName: string | null
  }
  confirmedByUser: {
    id: string
    name: string | null
  } | null
}

export interface EnrollmentStatistics {
  byStatus: Array<{ status: EnrollmentStatus, count: number }>
  byGrade: Array<{
    gradeId: string
    gradeName: string
    gradeOrder: number
    count: number
    boys: number
    girls: number
  }>
  byClass: Array<{
    classId: string
    className: string
    maxStudents: number
    count: number
    boys: number
    girls: number
  }>
  trends: Array<{
    date: string
    count: number
  }>
  total: number
  confirmed: number
  pending: number
}
