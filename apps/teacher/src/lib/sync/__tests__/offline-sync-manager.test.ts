import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getCache, setCache } from '../lib/sync/offline-sync-manager'

vi.mock('../lib/sync/offline-sync-manager', async () => {
  const syncManager = await import('../lib/sync/offline-sync-manager')
  return {
    syncManager: {
      addToQueue: vi.fn(),
      sync: vi.fn(),
      removeFromQueue: vi.fn(),
      clearQueue: vi.fn(),
      getPendingCount: vi.fn(),
      subscribe: vi.fn(),
    },
  }
})

vi.mock('../lib/sync/indexeddb-manager', async () => {
  const idbManager = await import('../lib/sync/indexeddb-manager')
  return {
    idbManager: {
      get: vi.fn(),
      getAll: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      put: vi.fn(),
      getByIndex: vi.fn(),
      getUnsynced: vi.fn(),
      markAsSynced: vi.fn(),
      setCache: vi.fn(),
      getCache: vi.fn(),
      clearExpiredCache: vi.fn(),
      getSetting: vi.fn(),
      setSetting: vi.fn(),
      closeDB: vi.fn(),
      deleteDB: vi.fn(),
    },
  }
})

describe('OfflineSyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('addToQueue', () => {
    it('should add item to queue', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      const item = {
        id: 'test-id',
        type: 'message',
        data: { content: 'test' },
        priority: 'normal',
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
      }

      await syncManager.addToQueue(item)

      expect(syncManager.addToQueue).toHaveBeenCalledWith(item)
    })

    it('should generate UUID for items without id', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      const item = {
        type: 'message',
        data: { content: 'test' },
        priority: 'normal',
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
      } as any

      await syncManager.addToQueue(item)

      expect(syncManager.addToQueue).toHaveBeenCalled()
      expect((await syncManager.addToQueue).calls[0]?.[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })

  describe('sync', () => {
    it('should call sync handler and return results', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      const mockHandler = vi.fn().mockResolvedValue({
        success: true,
        syncedCount: 2,
        failedCount: 0,
        errors: [],
      })

      syncManager.registerHandler('message', mockHandler as any)

      const result = await syncManager.sync()

      expect(result).toEqual({
        success: true,
        syncedCount: 2,
        failedCount: 0,
        errors: [],
      })
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('should return early when offline', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      vi.stub(navigator, 'onLine').value(false)

      const result = await syncManager.sync()

      expect(result.success).toBe(false)
      expect(result.errors).toContainEqual('Offline')
    })
  })

  describe('getPendingCount', () => {
    it('should return pending count', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      vi.mocked(await import('../lib/sync/indexeddb-manager'), 'getUnsynced', 'messages').mockResolvedValue([
        { id: '1', type: 'message', synced: false },
        { id: '2', type: 'message', synced: false },
      ])

      const count = await syncManager.getPendingCount()

      expect(count).toBe(2)
    })
  })

  describe('subscribe', () => {
    it('should subscribe to sync status updates', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      const listener = vi.fn()

      syncManager.subscribe(listener)

      expect(syncManager.subscribe).toHaveBeenCalledWith(listener)
    })
  })

  describe('clearQueue', () => {
    it('should clear all queued items', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      vi.mocked(await import('../lib/sync/indexeddb-manager'), 'clear', 'messages').mockResolvedValue(undefined)

      await syncManager.clearQueue()

      const { idbManager } = await import('../lib/sync/indexeddb-manager')
      expect(idbManager.clear).toHaveBeenCalledWith('messages')
    })
  })

  describe('removeFromQueue', () => {
    it('should remove specific item from queue', async () => {
      const { syncManager } = await import('../lib/sync/offline-sync-manager')
      
      vi.mocked(await import('../lib/sync/indexeddb-manager'), 'remove', 'messages').mockResolvedValue(undefined)

      await syncManager.removeFromQueue('test-id')

      const { idbManager } = await import('../lib/sync/indexeddb-manager')
      expect(idbManager.remove).toHaveBeenCalledWith('messages', 'test-id')
    })
  })
})
