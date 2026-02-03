import type { TimetableSessionData } from '@/components/timetables/timetable-session-card'

/**
 * Detects time conflicts in a list of timetable sessions.
 * A conflict occurs when two sessions on the same day have overlapping time intervals.
 *
 * @param sessions List of timetable sessions to check
 * @returns Updated list of sessions with hasConflict and conflictsWith fields
 */
export function detectConflicts(sessions: TimetableSessionData[]): TimetableSessionData[] {
  const results = sessions.map(s => ({
    ...s,
    hasConflict: false,
    conflictsWith: [] as string[],
  }))

  const sessionsByDay = new Map<number, typeof results>()

  // Group by day
  results.forEach((session) => {
    if (!sessionsByDay.has(session.dayOfWeek)) {
      sessionsByDay.set(session.dayOfWeek, [])
    }
    sessionsByDay.get(session.dayOfWeek)!.push(session)
  })

  // Check conflicts within each day
  sessionsByDay.forEach((daySessions) => {
    for (let i = 0; i < daySessions.length; i++) {
      for (let j = i + 1; j < daySessions.length; j++) {
        const a = daySessions[i]
        const b = daySessions[j]

        // Skip if either session is missing (type safety)
        if (!a || !b)
          continue

        // Check for overlap: (startA < endB) && (endA > startB)
        // Note: startTime and endTime are in "HH:MM" format, so string comparison works
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          a.hasConflict = true
          b.hasConflict = true

          if (!a.conflictsWith)
            a.conflictsWith = []
          if (!b.conflictsWith)
            b.conflictsWith = []

          if (!a.conflictsWith.includes(b.id))
            a.conflictsWith.push(b.id)
          if (!b.conflictsWith.includes(a.id))
            b.conflictsWith.push(a.id)
        }
      }
    }
  })

  return results
}
