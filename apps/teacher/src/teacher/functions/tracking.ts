import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

interface TrackingMetadata {
  serverCalculatedDistance?: number
  serverVerified?: boolean
  serverVerificationTime?: string
  isValid?: boolean
  reliabilityScore?: import('@/lib/tracking/reliability').ReliabilityComponents
  [key: string]: unknown
}

const trackingMetadataSchema = z.record(z.string(), z.unknown()).nullable()

const trackingEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  teacherId: z.string(),
  schoolId: z.string(),
  timestamp: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  accuracy: z.string().nullable(),
  type: z.enum(['start', 'ping', 'end']),
  metadata: trackingMetadataSchema,
})

export const syncTrackingEvents = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ events: z.array(trackingEventSchema) }))
  .handler(async ({ data }) => {
    // 1. Authenticate Teacher
    const { getTeacherContext } = await import('@/teacher/middleware/teacher-context')
    const context = await getTeacherContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No active teacher session', count: 0, reliabilityScore: null }
    }

    const { eq, getDb } = await import('@repo/data-ops/database/setup')
    const { schools } = await import('@repo/data-ops/drizzle/core-schema')
    const { trackingEvents, classSessions } = await import('@repo/data-ops/drizzle/school-schema')
    const { calculateDistance } = await import('@/lib/utils/geo')

    const db = getDb()

    // 2. Fetch School Location for Validation
    const schoolList = await db
      .select({
        id: schools.id,
        latitude: schools.latitude,
        longitude: schools.longitude,
      })
      .from(schools)
      .where(eq(schools.id, context.schoolId))
      .limit(1)

    const school = schoolList[0]

    if (!school) {
      return { success: false, error: 'School not found', count: 0, reliabilityScore: null }
    }

    const validEvents = []

    // 3. Process and Validate Events
    for (const event of data.events) {
      if (event.teacherId !== context.teacherId || event.schoolId !== context.schoolId) {
        continue
      }

      let metadata: z.infer<typeof trackingMetadataSchema> = {}
      try {
        if (typeof event.metadata === 'string') {
          metadata = JSON.parse(event.metadata)
        }
        else if (typeof event.metadata === 'object' && event.metadata !== null) {
          metadata = event.metadata as z.infer<typeof trackingMetadataSchema>
        }
      }
      catch {
        // ignore
      }

      if (school.latitude && school.longitude) {
        const dist = calculateDistance(
          Number.parseFloat(event.latitude),
          Number.parseFloat(event.longitude),
          Number.parseFloat(String(school.latitude)),
          Number.parseFloat(String(school.longitude)),
        )

        metadata = {
          ...metadata,
          serverCalculatedDistance: dist,
          serverVerified: true,
          serverVerificationTime: new Date().toISOString(),
          schoolLat: Number.parseFloat(String(school.latitude)),
          schoolLon: Number.parseFloat(String(school.longitude)),
        }
      }

      validEvents.push({
        id: event.id,
        sessionId: event.sessionId,
        teacherId: event.teacherId,
        schoolId: event.schoolId,
        timestamp: new Date(event.timestamp),
        latitude: event.latitude,
        longitude: event.longitude,
        accuracy: event.accuracy,
        type: event.type,
        metadata,
      })
    }

    // 4. Batch Insert
    if (validEvents.length > 0) {
      try {
        await db.insert(trackingEvents).values(validEvents).onConflictDoNothing()
      }
      catch (e) {
        console.error('Failed to insert tracking events', e)
        return { success: false, error: 'Failed to persist events', count: 0, reliabilityScore: null }
      }
    }

    let reliabilityScore = null
    const endEvent = validEvents.find(e => e.type === 'end')

    if (endEvent) {
      const sessionEvents = await db
        .select()
        .from(trackingEvents)
        .where(eq(trackingEvents.sessionId, endEvent.sessionId))

      sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      const startEvent = sessionEvents.find(e => e.type === 'start') || sessionEvents[0]
      const pings = sessionEvents.filter(e => e.type === 'ping')

      if (startEvent) {
        const { calculateReliabilityScore } = await import('@/lib/tracking/reliability')

        // Fetch official start time from class session
        const classSessionList = await db
          .select({
            date: classSessions.date,
            startTime: classSessions.startTime,
          })
          .from(classSessions)
          .where(eq(classSessions.id, endEvent.sessionId))
          .limit(1)

        let officialStartTime = startEvent.timestamp.getTime()
        const classSession = classSessionList[0]
        if (classSession) {
          const { date, startTime } = classSession
          try {
            const dateStr = String(date)
            const scheduleDate = new Date(`${dateStr}T${startTime}:00`)
            if (!Number.isNaN(scheduleDate.getTime())) {
              officialStartTime = scheduleDate.getTime()
            }
          }
          catch {
            // Fall back to tracking event timestamp
          }
        }

        const sessionData = {
          officialStartTime,
          actualStartTime: startEvent.timestamp.getTime(),
          pings: pings.map((p) => {
            const meta = p.metadata as TrackingMetadata | null
            let isValid = false
            if (meta?.serverVerified) {
              isValid = (meta.serverCalculatedDistance ?? 9999) <= 200
            }
            else {
              isValid = meta?.isValid ?? false
            }
            return {
              timestamp: p.timestamp.getTime(),
              isValid,
              latitude: Number(p.latitude),
              longitude: Number(p.longitude),
            }
          }),
          endTime: endEvent.timestamp.getTime(),
        }

        reliabilityScore = calculateReliabilityScore(sessionData)

        // Save score to end event metadata
        const endMeta = (endEvent.metadata as TrackingMetadata | null) ?? {}
        await db
          .update(trackingEvents)
          .set({
            metadata: {
              ...endMeta,
              reliabilityScore,
            },
          })
          .where(eq(trackingEvents.id, endEvent.id))
      }
    }

    return { success: true, count: validEvents.length, reliabilityScore }
  })
