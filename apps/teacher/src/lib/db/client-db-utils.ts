// ============================================================================
// Constants
// ============================================================================

export const DB_NAME = 'idb://yeko-teacher-local-db'
export const LOCAL_DB_NAME = 'yeko-teacher-local-db'
export const INIT_FLAG_KEY = 'yeko-teacher-db-initialized'

// ============================================================================
// Utility Functions
// ============================================================================

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined'
}

export async function getStorageEstimate(): Promise<StorageEstimate | undefined> {
  if (!isBrowser() || !('storage' in navigator)) {
    return undefined
  }

  try {
    return await navigator.storage.estimate()
  }
  catch (error) {
    console.warn('Failed to get storage estimate:', error)
    return undefined
  }
}

export function hasInitFlag(): boolean {
  if (!isBrowser())
    return false
  try {
    return localStorage.getItem(INIT_FLAG_KEY) === 'true'
  }
  catch {
    return false
  }
}

export function setInitFlag(value: boolean): void {
  if (!isBrowser())
    return
  try {
    if (value) {
      localStorage.setItem(INIT_FLAG_KEY, 'true')
    }
    else {
      localStorage.removeItem(INIT_FLAG_KEY)
    }
  }
  catch (error) {
    console.warn('Failed to set init flag:', error)
  }
}

export async function clearIndexedDB(dbName: string): Promise<void> {
  if (!isBrowser())
    return

  return new Promise((resolve) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName)

    deleteRequest.onsuccess = () => {
      resolve()
    }

    deleteRequest.onerror = () => {
      console.warn('Failed to clear IndexedDB:', deleteRequest.error)
      resolve()
    }

    deleteRequest.onblocked = () => {
      console.warn('IndexedDB deletion blocked')
      setTimeout(() => resolve(), 100)
    }
  })
}
