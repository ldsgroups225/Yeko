export type ConductType = 'incident' | 'sanction' | 'reward' | 'note'
export type ConductSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ConductStatus
  = | 'open'
    | 'investigating'
    | 'pending_decision'
    | 'resolved'
    | 'closed'
    | 'appealed'

export interface ConductRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string | null
  type: ConductType
  category: string
  title: string
  description: string
  severity?: ConductSeverity | null
  status: ConductStatus
  incidentDate?: string | null
  location?: string | null
  createdAt: string
}
