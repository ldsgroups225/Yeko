import type { NewTrackingEvent, TrackingEvent } from '@/lib/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { clientDatabaseManager } from '@/lib/db/client-db'
import { trackingEventsTable } from '@/lib/db/schema'

export class TrackingStorage {
  /**
   * Saves a tracking event to the local database.
   */
  static async saveEvent(event: Omit<NewTrackingEvent, 'id' | 'createdAt' | 'isSynced'>): Promise<string> {
    const db = await clientDatabaseManager.getDb()
    const id = crypto.randomUUID()

    await db.insert(trackingEventsTable).values({
      ...event,
      id,
      isSynced: false,
    })

    return id
  }

  /**
   * Retrieves all unsynced events for a specific session or globally.
   */
  static async getUnsyncedEvents(sessionId?: string): Promise<TrackingEvent[]> {
    const db = await clientDatabaseManager.getDb()

    if (sessionId) {
      return db.select()
        .from(trackingEventsTable)
        .where(and(
          eq(trackingEventsTable.isSynced, false),
          eq(trackingEventsTable.sessionId, sessionId),
        ))
    }

    return db.select()
      .from(trackingEventsTable)
      .where(eq(trackingEventsTable.isSynced, false))
  }

  /**
   * Marks events as synced.
   */
  static async markAsSynced(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0)
      return

    const db = await clientDatabaseManager.getDb()

    await db.update(trackingEventsTable)
      .set({ isSynced: true })
      .where(inArray(trackingEventsTable.id, eventIds))
  }

  /**
   * Gets session summary metrics locally.
   */
  static async getSessionMetrics(sessionId: string): Promise<{
    starts: TrackingEvent[]
    pings: TrackingEvent[]
    ends: TrackingEvent[]
  }> {
    const db = await clientDatabaseManager.getDb()

    const events = await db.select()
      .from(trackingEventsTable)
      .where(eq(trackingEventsTable.sessionId, sessionId))

    return {
      starts: events.filter(e => e.type === 'start'),
      pings: events.filter(e => e.type === 'ping'),
      ends: events.filter(e => e.type === 'end'),
    }
  }
}
