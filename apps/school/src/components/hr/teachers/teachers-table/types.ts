export interface Teacher {
  id: string
  user: {
    name: string
    email: string
  }
  subjects: string[]
  specialization: string | null
  status: 'active' | 'inactive' | 'on_leave'
  hireDate: string | null
}

export interface TeachersFilters {
  page?: number
  search?: string
  subjectId?: string
  status?: 'active' | 'inactive' | 'on_leave'
}
