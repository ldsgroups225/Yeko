import { describe, it, expect, vi, beforeEach } from 'vitest'
import { queueAuditLog, queueActivityLog, queueApiMetric, queueBatch } from './queue-producer'
import * as context from './context'
import * as waitUntil from './wait-until'

vi.mock('./context', () => ({
  getQueueBinding: vi.fn(),
}))

vi.mock('./wait-until', () => ({
  runInBackground: vi.fn((fn) => fn()),
}))

describe('queue-producer', () => {
  const mockQueue = {
    send: vi.fn().mockResolvedValue(undefined),
    sendBatch: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
  })

  describe('queueAuditLog', () => {
    it('should queue an audit log message when queue is available', async () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(mockQueue as any)

      const payload = {
        schoolId: 'school-1',
        userId: 'user-1',
        action: 'create' as const,
        tableName: 'users',
        recordId: 'record-1',
      }

      queueAuditLog(payload)

      expect(waitUntil.runInBackground).toHaveBeenCalled()
      expect(mockQueue.send).toHaveBeenCalledWith({
        type: 'audit_log',
        payload: {
          ...payload,
          timestamp: Date.now(),
        },
      })
    })

    it('should not queue if queue binding is missing', () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(null)
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      queueAuditLog({
        schoolId: 'school-1',
        userId: 'user-1',
        action: 'create' as const,
        tableName: 'users',
        recordId: 'record-1',
      })

      expect(waitUntil.runInBackground).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No queue binding available'),
        'audit_log'
      )
    })
  })

  describe('queueActivityLog', () => {
    it('should queue an activity log message when queue is available', async () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(mockQueue as any)

      const payload = {
        action: 'login',
        userId: 'user-1',
      }

      queueActivityLog(payload)

      expect(waitUntil.runInBackground).toHaveBeenCalled()
      expect(mockQueue.send).toHaveBeenCalledWith({
        type: 'activity_log',
        payload: {
          ...payload,
          timestamp: Date.now(),
        },
      })
    })
  })

  describe('queueApiMetric', () => {
    it('should queue an api metric message when queue is available', async () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(mockQueue as any)

      const payload = {
        endpoint: '/api/test',
        method: 'GET' as const,
        statusCode: 200,
        responseTimeMs: 100,
      }

      queueApiMetric(payload)

      expect(waitUntil.runInBackground).toHaveBeenCalled()
      expect(mockQueue.send).toHaveBeenCalledWith({
        type: 'api_metric',
        payload: {
          ...payload,
          timestamp: Date.now(),
        },
      })
    })
  })

  describe('queueBatch', () => {
    it('should queue a batch of messages when queue is available', async () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(mockQueue as any)

      const messages: any[] = [
        { type: 'audit_log', payload: { action: 'create' } },
        { type: 'activity_log', payload: { action: 'login' } },
      ]

      queueBatch(messages)

      expect(waitUntil.runInBackground).toHaveBeenCalled()
      expect(mockQueue.sendBatch).toHaveBeenCalledWith(
        messages.map(body => ({ body }))
      )
    })

    it('should return early if messages array is empty', () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(mockQueue as any)

      queueBatch([])

      expect(waitUntil.runInBackground).not.toHaveBeenCalled()
    })

    it('should not queue batch if queue binding is missing', () => {
      vi.mocked(context.getQueueBinding).mockReturnValue(null)
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      queueBatch([{ type: 'audit_log', payload: { action: 'create' } } as any])

      expect(waitUntil.runInBackground).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No queue binding available, skipping batch')
      )
    })
  })
})
