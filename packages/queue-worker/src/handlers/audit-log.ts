import type { AuditLogMessage } from '@repo/background-tasks'
import { bulkInsertAuditLogs } from '@repo/data-ops/queries/school-admin/audit'

/**
 * Process a batch of audit log messages
 * Performs bulk insert for efficiency
 */
export async function processAuditLogs(messages: AuditLogMessage[]): Promise<void> {
  if (messages.length === 0)
    return

  const values = messages.map(msg => ({
    id: crypto.randomUUID(),
    schoolId: msg.payload.schoolId,
    userId: msg.payload.userId,
    action: msg.payload.action,
    tableName: msg.payload.tableName,
    recordId: msg.payload.recordId,
    oldValues: msg.payload.oldValues,
    newValues: msg.payload.newValues,
    ipAddress: msg.payload.ipAddress,
    userAgent: msg.payload.userAgent,
    createdAt: new Date(msg.payload.timestamp),
  }))

  await bulkInsertAuditLogs(values)

  console.warn(`[audit-log] Inserted ${values.length} audit logs`)
}
