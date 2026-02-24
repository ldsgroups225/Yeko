export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  scope: 'school' | 'system'
  isSystemRole: boolean
  userCount: number
  permissionCount: number
}

export interface RolesFilters {
  page?: number
  search?: string
  scope?: 'school' | 'system'
}
