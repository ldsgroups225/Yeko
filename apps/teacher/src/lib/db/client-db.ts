import type { PGlite } from '@electric-sql/pglite'
import type { drizzle } from 'drizzle-orm/pglite'
import { clearIndexedDB, DB_NAME, getStorageEstimate, hasInitFlag, isBrowser, LOCAL_DB_NAME, setInitFlag } from './client-db-utils'
import { initializeDatabaseWithMigrations } from './migration-runner'

// ============================================================================
// Types
// ============================================================================

export type DB = ReturnType<typeof drizzle>

export interface DatabaseStatus {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
  lastInitialized: Date | null
}

export interface DatabaseStats extends DatabaseStatus {
  isReady: boolean
  storageEstimate?: StorageEstimate
}

type StatusChangeCallback = (status: DatabaseStatus) => void

// ============================================================================
// Database Manager
// ============================================================================

export class ClientDatabaseManager {
  private static instance: ClientDatabaseManager

  private db: DB | null = null
  private pglite: PGlite | null = null
  private status: DatabaseStatus = {
    isInitialized: false,
    isInitializing: false,
    error: null,
    lastInitialized: null,
  }

  private initPromise: Promise<void> | null = null
  private statusCallbacks = new Set<StatusChangeCallback>()

  private constructor() {}

  // --------------------------------------------------------------------------
  // Singleton
  // --------------------------------------------------------------------------

  static getInstance(): ClientDatabaseManager {
    if (!ClientDatabaseManager.instance) {
      ClientDatabaseManager.instance = new ClientDatabaseManager()
    }
    return ClientDatabaseManager.instance
  }

  // --------------------------------------------------------------------------
  // Status Management
  // --------------------------------------------------------------------------

  getStatus(): Readonly<DatabaseStatus> {
    return { ...this.status }
  }

  onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusCallbacks.add(callback)

    queueMicrotask(() => {
      if (this.statusCallbacks.has(callback)) {
        callback(this.getStatus())
      }
    })

    return () => {
      this.statusCallbacks.delete(callback)
    }
  }

  private notifyStatusChange(): void {
    const status = this.getStatus()
    queueMicrotask(() => {
      for (const callback of this.statusCallbacks) {
        try {
          callback(status)
        }
        catch (error) {
          console.error('Error in status change callback:', error)
        }
      }
    })
  }

  private updateStatus(updates: Partial<DatabaseStatus>): void {
    this.status = { ...this.status, ...updates }
    this.notifyStatusChange()
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (!isBrowser()) {
      const error = 'Database requires browser environment'
      this.updateStatus({ error })
      return
    }

    if (this.status.isInitialized && this.db) {
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    if (this.status.error) {
      this.updateStatus({ error: null })
    }

    this.updateStatus({ isInitializing: true, error: null })
    this.initPromise = this.performInitialization()

    try {
      await this.initPromise
    }
    finally {
      this.initPromise = null
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      const { PGlite } = await import('@electric-sql/pglite')
      const { drizzle } = await import('drizzle-orm/pglite')
      const schema = await import('./schema')

      this.pglite = new PGlite({
        dataDir: DB_NAME,
        relaxedDurability: true,
      })

      this.db = drizzle(this.pglite, { schema })

      const hasBeenInitialized = hasInitFlag()

      if (!hasBeenInitialized) {
        await initializeDatabaseWithMigrations(this.db)
        setInitFlag(true)
      }
      else {
        // For existing databases, run migrations to ensure they're up to date
        await initializeDatabaseWithMigrations(this.db)
      }

      await this.testConnection()

      this.updateStatus({
        isInitialized: true,
        isInitializing: false,
        lastInitialized: new Date(),
        error: null,
      })
    }
    catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : String(error)

      this.updateStatus({
        isInitialized: false,
        isInitializing: false,
        error: errorMessage,
      })

      this.db = null
      if (this.pglite) {
        try {
          await this.pglite.close()
        }
        catch {
          // Ignore close errors
        }
        this.pglite = null
      }

      console.error('❌ Failed to initialize PGlite database:', error)
      throw error
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    await this.db.execute('SELECT 1 as test')
  }

  // --------------------------------------------------------------------------
  // Database Access
  // --------------------------------------------------------------------------

  async getDb(): Promise<DB> {
    if (!isBrowser()) {
      throw new Error('Database not available in server environment')
    }

    if (this.status.isInitialized && this.db) {
      return this.db
    }

    await this.initialize()

    if (!this.db) {
      throw new Error(this.status.error || 'Database initialization failed')
    }

    return this.db
  }

  isReady(): boolean {
    return isBrowser() && this.status.isInitialized && this.db !== null
  }

  async waitForReady(timeoutMs = 10000): Promise<void> {
    if (!isBrowser()) {
      throw new Error('Database not available in server environment')
    }

    if (this.isReady()) {
      return
    }

    if (!this.status.isInitializing && !this.status.isInitialized) {
      await this.initialize()
      return
    }

    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkInterval = 100

      const check = () => {
        if (this.isReady()) {
          resolve()
          return
        }

        const status = this.getStatus()

        if (status.error && !status.isInitializing) {
          reject(new Error(status.error))
          return
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Database initialization timeout'))
          return
        }

        setTimeout(check, checkInterval)
      }

      check()
    })
  }

  // --------------------------------------------------------------------------
  // Database Operations
  // --------------------------------------------------------------------------

  async reset(): Promise<void> {
    if (!isBrowser()) {
      throw new Error('Database reset requires browser environment')
    }

    try {
      if (this.pglite) {
        await this.pglite.close()
      }

      await clearIndexedDB(LOCAL_DB_NAME)
      setInitFlag(false)

      this.db = null
      this.pglite = null
      this.initPromise = null
      this.updateStatus({
        isInitialized: false,
        isInitializing: false,
        error: null,
        lastInitialized: null,
      })

      await this.initialize()
    }
    catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : String(error)
      this.updateStatus({ error: errorMessage })
      console.error('Failed to reset database:', error)
      throw error
    }
  }

  async getStats(): Promise<DatabaseStats> {
    const status = this.getStatus()
    const storageEstimate = await getStorageEstimate()

    return {
      ...status,
      isReady: this.isReady(),
      storageEstimate,
    }
  }

  async cleanup(): Promise<void> {
    if (this.pglite) {
      try {
        await this.pglite.close()
      }
      catch (error) {
        console.warn('Error closing database connection:', error)
      }
    }

    this.db = null
    this.pglite = null
    this.initPromise = null
    this.statusCallbacks.clear()

    this.updateStatus({
      isInitialized: false,
      isInitializing: false,
      error: null,
      lastInitialized: null,
    })
  }
}

// ============================================================================
// Exports
// ============================================================================

export const clientDatabaseManager = ClientDatabaseManager.getInstance()
