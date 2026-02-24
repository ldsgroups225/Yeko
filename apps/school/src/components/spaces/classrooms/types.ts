export interface ClassroomItem {
  id: string
  name: string
  code: string
  type: string
  capacity: number
  status: 'active' | 'maintenance' | 'inactive'
  assignedClassesCount?: number
}
