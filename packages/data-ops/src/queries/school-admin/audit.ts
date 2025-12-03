import type { AuditLogInsert } from '@/drizzle/school-schema'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { auditLogs } from '@/drizzle/school-schema'

export type AuditAction = 'create' | 'update' | 'delete' | 'view'

export interface CreateAuditLogParams {
  schoolId: string
  userId: string
  action: AuditAction
  tableName: string
  recordId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry (direct insert - use queueAuditLog for non-blocking)
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  const db = getDb()

  const [log] = await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    schoolId: params.schoolId,
    userId: params.userId,
    action: params.action,
    tableName: params.tableName,
    recordId: params.recordId,
    oldValues: params.oldValues,
    newValues: params.newValues,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  }).returning()

  return log
}

/**
 * Bulk insert audit logs (used by queue consumer)
 */
export async function bulkInsertAuditLogs(logs: AuditLogInsert[]): Promise<void> {
  if (logs.length === 0)
    return

  const db = getDb()
  await db.insert(auditLogs).values(logs)
}

/**
 * Get audit logs for a school
 */
export async function getAuditLogs(schoolId: string, limit: number = 50) {
  const db = getDb()

  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.schoolId, schoolId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}

/**
 * Get audit logs for a specific record
 */
export async function getRecordAuditLogs(
  tableName: string,
  recordId: string,
  limit: number = 20,
) {
  const db = getDb()

  return db
    .select()
    .from(auditLogs)
    .where(and(eq(auditLogs.tableName, tableName), eq(auditLogs.recordId, recordId)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}
