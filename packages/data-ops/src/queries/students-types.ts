import type { BloodType, enrollments, EnrollmentStatus, Gender, parents, Relationship, students, StudentStatus } from '../drizzle/school-schema'

export type { BloodType, EnrollmentStatus, Gender, Relationship, StudentStatus }

export interface StudentFilters {
  schoolId: string
  classId?: string
  gradeId?: string
  schoolYearId?: string
  status?: StudentStatus
  gender?: Gender
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'matricule' | 'dob' | 'enrollmentDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateStudentInput {
  schoolId: string
  schoolYearId?: string
  firstName: string
  lastName: string
  dob: string
  gender?: Gender
  photoUrl?: string
  matricule?: string
  birthPlace?: string
  nationality?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: BloodType
  medicalNotes?: string
  previousSchool?: string
  admissionDate?: string
  status?: StudentStatus
}

export interface StudentWithDetails {
  student: typeof students.$inferSelect
  currentClass: { id: string, section: string | null, gradeName: string | null, seriesName: string | null } | null
  parentsCount: number
  enrollmentStatus: EnrollmentStatus | null
}

export type StudentFullProfile = typeof students.$inferSelect & {
  parents: Array<{ parent: typeof parents.$inferSelect, relationship: Relationship | null, isPrimary: boolean | null, canPickup: boolean | null, receiveNotifications: boolean | null }>
  enrollmentHistory: Array<{ enrollment: typeof enrollments.$inferSelect, class: { id: string, section: string, gradeName: string, seriesName: string | null } }>
}

export interface StudentStatistics {
  byStatus: Array<{ status: StudentStatus | null, count: number }>
  byGender: Array<{ gender: Gender | null, count: number }>
  byAge: Array<{ ageGroup: string, count: number }>
  newAdmissions: number
  total: number
}

export interface ExportStudentRow {
  matricule: string | null
  lastName: string
  firstName: string
  dateOfBirth: string | null
  gender: string | null
  status: string
  class: string
  series: string
  nationality: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  admissionDate: string | null
}

export interface ImportStudentResult {
  success: number
  errors: Array<{ row: number, error: string }>
}
