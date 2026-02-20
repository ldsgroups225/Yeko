import type { Coordinates } from '@/lib/utils/geo'
import { getCurrentPosition, validateLocation } from '@/lib/utils/geo'
import { syncTrackingEvents } from '@/teacher/functions/tracking'
import { TrackingStorage } from './storage'
import { TimeSync } from './time-sync'

export interface SchoolLocation {
  latitude: number
  longitude: number
}

interface TrackingMetadata {
  status?: string
  distance?: number
  isValid?: boolean
  schoolLat?: number
  schoolLon?: number
}

const PING_MIN_INTERVAL = 15 * 60 * 1000
const PING_MAX_INTERVAL = 20 * 60 * 1000
const STORAGE_KEY = 'yeko-teacher-tracker-session'

interface PersistedState {
  currentSessionId: string
  teacherId: string
  schoolId: string
  schoolLocation: SchoolLocation | null
}

export class TeacherPresenceTracker {
  private static instance: TeacherPresenceTracker
  private currentSessionId: string | null = null
  private teacherId: string | null = null
  private schoolId: string | null = null
  private schoolLocation: SchoolLocation | null = null
  private pingTimeout: ReturnType<typeof setTimeout> | null = null
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private isSyncing = false
  private isInitialized = false

  static getInstance(): TeacherPresenceTracker {
    if (!TeacherPresenceTracker.instance) {
      TeacherPresenceTracker.instance = new TeacherPresenceTracker()
      TeacherPresenceTracker.instance.initialize()
    }
    return TeacherPresenceTracker.instance
  }

  /**
   * Initialize listeners and start sync loop if needed.
   * Restores active session from storage if it exists.
   */
  async initialize() {
    if (this.isInitialized || typeof window === 'undefined')
      return

    // Restore state
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state = JSON.parse(stored) as PersistedState
        this.currentSessionId = state.currentSessionId
        this.teacherId = state.teacherId
        this.schoolId = state.schoolId
        this.schoolLocation = state.schoolLocation

        // Resume pinging if we have an active session
        if (this.currentSessionId) {
          this.scheduleNextPing()
        }
      }
    }
    catch (e) {
      console.error('Failed to restore tracker state', e)
    }

    window.addEventListener('online', () => this.sync())

    if (this.syncInterval)
      clearInterval(this.syncInterval)
    this.syncInterval = setInterval(() => this.sync(), 5 * 60 * 1000)

    setTimeout(() => this.sync(), 2000)

    this.isInitialized = true
  }

  /**
   * Synchronize local events with the server.
   */
  async sync() {
    if (this.isSyncing)
      return
    this.isSyncing = true

    try {
      if (!navigator.onLine)
        return

      const events = await TrackingStorage.getUnsyncedEvents()
      if (events.length === 0)
        return

      const payload = events.map(e => ({
        id: e.id,
        sessionId: e.sessionId,
        teacherId: e.teacherId,
        schoolId: e.schoolId,
        timestamp: e.timestamp.toISOString(),
        latitude: e.latitude.toString(),
        longitude: e.longitude.toString(),
        accuracy: e.accuracy?.toString() ?? null,
        type: e.type as 'start' | 'ping' | 'end',
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
      }))

      const result = await syncTrackingEvents({ data: { events: payload } })

      if (result.success) {
        await TrackingStorage.markAsSynced(events.map(e => e.id))
      }
    }
    catch (e) {
      console.error('Sync failed', e)
    }
    finally {
      this.isSyncing = false
    }
  }

  /**
   * Starts tracking for a session.
   * Captures start event with GPS and corrected time.
   */
  async startSession(sessionId: string, teacherId: string, schoolId: string, schoolLocation?: SchoolLocation): Promise<boolean> {
    this.currentSessionId = sessionId
    this.teacherId = teacherId
    this.schoolId = schoolId
    this.schoolLocation = schoolLocation || null

    this.persistState()

    await TimeSync.init()

    try {
      const position = await getCurrentPosition()
      const timestamp = TimeSync.getCorrectedTime()

      let metadata: TrackingMetadata = { status: 'unknown' }

      if (this.schoolLocation) {
        const { isValid, distance } = validateLocation(position, this.schoolLocation)
        metadata = {
          distance,
          isValid,
          schoolLat: this.schoolLocation.latitude,
          schoolLon: this.schoolLocation.longitude,
        }
      }

      await TrackingStorage.saveEvent({
        sessionId,
        teacherId,
        schoolId,
        timestamp: new Date(timestamp),
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString(),
        accuracy: position.accuracy.toString(),
        type: 'start',
        metadata: JSON.stringify(metadata),
      })

      this.scheduleNextPing()
      return true
    }
    catch (e) {
      console.error('Failed to track start session', e)
      return false
    }
  }

  /**
   * Ends tracking for the current session.
   */
  async endSession(): Promise<void> {
    if (!this.currentSessionId || !this.teacherId || !this.schoolId)
      return

    this.clearPing()

    try {
      const timestamp = TimeSync.getCorrectedTime()
      let position: Coordinates = { latitude: 0, longitude: 0, accuracy: 0 }

      try {
        position = await getCurrentPosition({ timeout: 5000 })
      }
      catch {}

      await TrackingStorage.saveEvent({
        sessionId: this.currentSessionId,
        teacherId: this.teacherId,
        schoolId: this.schoolId,
        timestamp: new Date(timestamp),
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString(),
        accuracy: position.accuracy.toString(),
        type: 'end',
      })
    }
    catch (e) {
      console.error('Failed to track end session', e)
    }

    this.currentSessionId = null
    this.teacherId = null
    this.schoolId = null
    this.schoolLocation = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  private scheduleNextPing() {
    if (!this.currentSessionId)
      return

    const interval = Math.floor(Math.random() * (PING_MAX_INTERVAL - PING_MIN_INTERVAL + 1) + PING_MIN_INTERVAL)

    this.pingTimeout = setTimeout(async () => {
      await this.performPing()
      this.scheduleNextPing()
    }, interval)
  }

  private clearPing() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
  }

  private persistState() {
    if (typeof window === 'undefined')
      return

    if (!this.currentSessionId || !this.teacherId || !this.schoolId)
      return

    const state: PersistedState = {
      currentSessionId: this.currentSessionId,
      teacherId: this.teacherId,
      schoolId: this.schoolId,
      schoolLocation: this.schoolLocation,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  private async performPing() {
    if (!this.currentSessionId || !this.teacherId || !this.schoolId)
      return

    try {
      const position = await getCurrentPosition()
      const timestamp = TimeSync.getCorrectedTime()

      let metadata: TrackingMetadata = {}
      if (this.schoolLocation) {
        const { isValid, distance } = validateLocation(position, this.schoolLocation)
        metadata = { isValid, distance }
      }

      await TrackingStorage.saveEvent({
        sessionId: this.currentSessionId,
        teacherId: this.teacherId,
        schoolId: this.schoolId,
        timestamp: new Date(timestamp),
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString(),
        accuracy: position.accuracy.toString(),
        type: 'ping',
        metadata: JSON.stringify(metadata),
      })
    }
    catch (e) {
      console.error('Ping failed', e)
    }
  }
}

export const teacherPresenceTracker = TeacherPresenceTracker.getInstance()
