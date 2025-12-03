import type {
  ActivityLogMessage,
  ApiMetricMessage,
  AuditLogMessage,
  LogMessage,
} from '@repo/background-tasks'
import type { Env } from './types'
import { initDatabase } from '@repo/data-ops/database/setup'
import { processActivityLogs } from './handlers/activity-log'
import { processApiMetrics } from './handlers/api-metric'
import { processAuditLogs } from './handlers/audit-log'

export default {
  /**
   * Queue consumer handler
   * Receives batches of log messages and processes them in bulk
   */
  async queue(batch: MessageBatch<LogMessage>, env: Env): Promise<void> {
    console.warn(`[queue-worker] Processing batch of ${batch.messages.length} messages`)

    // Initialize database connection
    initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    })

    // Group messages by type
    const auditLogs: AuditLogMessage[] = []
    const activityLogs: ActivityLogMessage[] = []
    const apiMetrics: ApiMetricMessage[] = []

    for (const message of batch.messages) {
      const msg = message.body

      switch (msg.type) {
        case 'audit_log':
          auditLogs.push(msg)
          break
        case 'activity_log':
          activityLogs.push(msg)
          break
        case 'api_metric':
          apiMetrics.push(msg)
          break
        default:
          console.warn('[queue-worker] Unknown message type:', (msg as LogMessage).type)
      }
    }

    // Process each type in parallel
    const results = await Promise.allSettled([
      auditLogs.length > 0 ? processAuditLogs(auditLogs) : Promise.resolve(),
      activityLogs.length > 0 ? processActivityLogs(activityLogs) : Promise.resolve(),
      apiMetrics.length > 0 ? processApiMetrics(apiMetrics) : Promise.resolve(),
    ])

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error('[queue-worker] Some handlers failed:', failures)
      // Throw to trigger retry
      throw new Error(`${failures.length} handler(s) failed`)
    }

    // Acknowledge all messages
    for (const message of batch.messages) {
      message.ack()
    }

    console.warn('[queue-worker] Batch processed successfully')
  },
}
