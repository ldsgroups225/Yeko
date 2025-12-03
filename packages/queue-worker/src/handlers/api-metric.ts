import type { ApiMetricMessage } from '@repo/background-tasks'
import { bulkInsertApiMetrics } from '@repo/data-ops/queries/activity-tracking'

/**
 * Process a batch of API metric messages
 * Performs bulk insert for efficiency
 */
export async function processApiMetrics(messages: ApiMetricMessage[]): Promise<void> {
  if (messages.length === 0)
    return

  const values = messages.map(msg => ({
    id: crypto.randomUUID(),
    endpoint: msg.payload.endpoint,
    method: msg.payload.method,
    statusCode: msg.payload.statusCode,
    responseTimeMs: msg.payload.responseTimeMs,
    userId: msg.payload.userId,
    schoolId: msg.payload.schoolId,
    errorMessage: msg.payload.errorMessage,
    createdAt: new Date(msg.payload.timestamp),
  }))

  await bulkInsertApiMetrics(values)

  console.warn(`[api-metric] Inserted ${values.length} API metrics`)
}
