import type { ActivityLogMessage } from '@repo/background-tasks'
import { bulkInsertActivityLogs } from '@repo/data-ops/queries/activity-tracking'

/**
 * Process a batch of activity log messages
 * Performs bulk insert for efficiency
 */
export async function processActivityLogs(messages: ActivityLogMessage[]): Promise<void> {
  if (messages.length === 0)
    return

  const values = messages.map(msg => ({
    id: crypto.randomUUID(),
    userId: msg.payload.userId,
    schoolId: msg.payload.schoolId,
    action: msg.payload.action,
    resource: msg.payload.resource,
    resourceId: msg.payload.resourceId,
    metadata: msg.payload.metadata,
    ipAddress: msg.payload.ipAddress,
    userAgent: msg.payload.userAgent,
    createdAt: new Date(msg.payload.timestamp),
  }))

  await bulkInsertActivityLogs(values)

  console.warn(`[activity-log] Inserted ${values.length} activity logs`)
}
