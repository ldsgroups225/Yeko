import type { getStaffList } from '@/school/functions/staff'

export type StaffListResponse = Awaited<ReturnType<typeof getStaffList>>
export type StaffMember = Extract<StaffListResponse, { success: true }>['data']['staff'][number]

export interface StaffFilters {
  page?: number
  search?: string
  position?: string
  status?: 'active' | 'inactive' | 'on_leave'
}
