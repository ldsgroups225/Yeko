import type { InvitationStatus, Parent, ParentInsert, parents, Relationship, students, users } from '../../drizzle/school-schema'

export type { InvitationStatus, Parent, ParentInsert, Relationship }

// ==================== Types ====================

export interface ParentFilters {
  search?: string
  invitationStatus?: InvitationStatus
  hasChildren?: boolean
  page?: number
  limit?: number
}

export interface CreateParentInput {
  firstName: string
  lastName: string
  phone: string
  phone2?: string
  email?: string
  address?: string
  occupation?: string
  workplace?: string
}

export interface LinkParentInput {
  studentId: string
  parentId: string
  schoolId: string
  relationship: Relationship
  isPrimary?: boolean
  canPickup?: boolean
  receiveNotifications?: boolean
  notes?: string
}

export interface ParentWithChildrenCount extends Parent {
  childrenCount: number
  hasUser: boolean
}

export interface PaginatedParents {
  data: ParentWithChildrenCount[]
  total: number
  page: number
  totalPages: number
}

export interface ParentChildren {
  student: typeof students.$inferSelect
  relationship: Relationship | null
  isPrimary: boolean | null
  canPickup: boolean | null
  receiveNotifications: boolean | null
}

export interface ParentWithDetails extends Parent {
  user: typeof users.$inferSelect | null
  children: ParentChildren[]
}

export interface StudentParentDetail {
  parent: typeof parents.$inferSelect
  relationship: Relationship | null
  isPrimary: boolean | null
}

export interface AutoMatchResult {
  matched: number
  created: number
  suggestions: Array<{
    studentId: string
    studentName: string
    phone: string
    existingParent?: typeof parents.$inferSelect
  }>
}

export interface InvitationSendResult {
  parent: typeof parents.$inferSelect
  token: string
  emailSent: boolean
}
