import type { StudentWithDetails } from '@repo/data-ops/queries/students'
import type { StudentFilters as BaseStudentFilters } from '@/lib/queries/students'

export type StudentItem = StudentWithDetails

export interface StudentFilters extends BaseStudentFilters {
  page: number
  limit: number
}
