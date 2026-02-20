import { getServerTime } from '@/teacher/functions/server-time'

const OFFSET_STORAGE_KEY = 'yeko-teacher-time-offset'

/**
 * Time synchronization utility.
 * Manages the time offset between client and server.
 */
export class TimeSync {
  private static offset = 0
  private static initialized = false

  /**
   * Initializes the time synchronization by fetching server time.
   * If offline, falls back to stored offset.
   */
  static async init(): Promise<void> {
    if (this.initialized)
      return

    // Load stored offset first
    const storedOffset = localStorage.getItem(OFFSET_STORAGE_KEY)
    if (storedOffset) {
      this.offset = Number.parseInt(storedOffset, 10)
    }

    try {
      const start = Date.now()
      const result = await getServerTime()
      const end = Date.now()
      const latency = (end - start) / 2

      // Calculate offset: serverTime - (clientTime + latency)
      // Actually simpler: serverTime - clientTime (latency correction optional but better)
      const serverTime = result.timestamp

      // serverTime ~ (requestStart + requestEnd)/2
      // offset = serverTime - ((requestStart + requestEnd)/2)
      // Or serverTime = clientTime + offset -> offset = serverTime - clientTime
      // Taking the midpoint of the request as the client time for comparison
      const estimatedClientTimeAtServer = start + latency

      this.offset = serverTime - estimatedClientTimeAtServer

      localStorage.setItem(OFFSET_STORAGE_KEY, this.offset.toString())
    }
    catch (error) {
      console.warn('Network unreachable, using stored or zero time offset', error)
      // Keep using stored offset or 0 if never synced
    }

    this.initialized = true
  }

  /**
   * Returns the current time corrected with the server offset.
   */
  static getCorrectedTime(): number {
    return Date.now() + this.offset
  }

  /**
   * Updates the offset from a known server timestamp and request duration.
   * Can be used to passively update offset from other API calls.
   */
  static updateOffset(serverTimestamp: number, requestDurationMs: number): void {
    const estimatedClientTimeAtServer = Date.now() - (requestDurationMs / 2)
    this.offset = serverTimestamp - estimatedClientTimeAtServer
    localStorage.setItem(OFFSET_STORAGE_KEY, this.offset.toString())
  }
}
