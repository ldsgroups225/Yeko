import type {
  ActivityLogPayload,
  ApiMetricPayload,
  AuditLogPayload,
  LogMessage,
} from './types'
import { getQueueBinding } from './context'
import { runInBackground } from './wait-until'

/**
 * Send a message to the logs queue
 * Non-blocking - uses waitUntil internally
 */
function sendToQueue(message: LogMessage): void {
  const queue = getQueueBinding()

  if (!queue) {
    console.warn('[queue-producer] No queue binding available, skipping:', message.type)
    return
  }

  runInBackground(async () => {
    try {
      await queue.send(message)
    }
    catch (error) {
      console.error('[queue-producer] Failed to send message:', error)
    }
  })
}

/**
 * Queue an audit log entry
 * Non-blocking - message is sent to queue after response
 */
export function queueAuditLog(
  data: Omit<AuditLogPayload, 'timestamp'>,
): void {
  sendToQueue({
    type: 'audit_log',
    payload: {
      ...data,
      timestamp: Date.now(),
    },
  })
}

/**
 * Queue an activity log entry
 * Non-blocking - message is sent to queue after response
 */
export function queueActivityLog(
  data: Omit<ActivityLogPayload, 'timestamp'>,
): void {
  sendToQueue({
    type: 'activity_log',
    payload: {
      ...data,
      timestamp: Date.now(),
    },
  })
}

/**
 * Queue an API metric entry
 * Non-blocking - message is sent to queue after response
 */
export function queueApiMetric(
  data: Omit<ApiMetricPayload, 'timestamp'>,
): void {
  sendToQueue({
    type: 'api_metric',
    payload: {
      ...data,
      timestamp: Date.now(),
    },
  })
}

/**
 * Send multiple messages to the queue in a batch
 * Non-blocking - uses waitUntil internally
 */
export function queueBatch(messages: LogMessage[]): void {
  const queue = getQueueBinding()

  if (!queue) {
    console.warn('[queue-producer] No queue binding available, skipping batch')
    return
  }

  if (messages.length === 0)
    return

  runInBackground(async () => {
    try {
      await queue.sendBatch(messages.map(body => ({ body })))
    }
    catch (error) {
      console.error('[queue-producer] Failed to send batch:', error)
    }
  })
}
