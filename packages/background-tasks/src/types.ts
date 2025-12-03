// Message types for the queue
export type LogMessageType = 'audit_log' | 'activity_log' | 'api_metric'

export interface AuditLogPayload {
  schoolId: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'view'
  tableName: string
  recordId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: number
}

export interface ActivityLogPayload {
  userId?: string
  schoolId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: number
}

export interface ApiMetricPayload {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  statusCode: number
  responseTimeMs: number
  userId?: string
  schoolId?: string
  errorMessage?: string
  timestamp: number
}

export interface AuditLogMessage {
  type: 'audit_log'
  payload: AuditLogPayload
}

export interface ActivityLogMessage {
  type: 'activity_log'
  payload: ActivityLogPayload
}

export interface ApiMetricMessage {
  type: 'api_metric'
  payload: ApiMetricPayload
}

export type LogMessage = AuditLogMessage | ActivityLogMessage | ApiMetricMessage

// Queue binding type
export interface LogsQueue {
  send: (message: LogMessage) => Promise<void>
  sendBatch: (messages: { body: LogMessage }[]) => Promise<void>
}
