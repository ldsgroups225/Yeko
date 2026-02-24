export interface ImportRow {
  name: string
  email: string
  phone?: string
  roles: string
  status?: string
  error?: string
}

export interface ImportResults {
  success: number
  failed: number
}
