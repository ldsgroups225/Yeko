import { calculateDistance } from '@/lib/utils/geo'

export interface ReliabilityComponents {
  startPunctualityScore: number // 0-100
  presenceContinuityScore: number // 0-100
  positionStabilityScore: number // 0-100
  overallScore: number // 0-100
}

export interface SessionPing {
  timestamp: number
  isValid: boolean
  latitude: number
  longitude: number
}

export interface SessionData {
  officialStartTime: number
  actualStartTime: number
  pings: SessionPing[]
  endTime: number
}

/**
 * Calculates the teacher reliability score based on session data.
 */
export function calculateReliabilityScore(session: SessionData): ReliabilityComponents {
  // 1. Start Punctuality (40% weight)
  // On time (<= 0 min delay) = 100
  // Linearly decays: 5 points per minute relative to tolerance
  // Let's assume 10 min tolerance window before significant penalty?
  // User Prompt: "Since 10 minutes before official start time." "On time: timestamp <= official start". "Late: > start".
  const delayMinutes = Math.max(0, (session.actualStartTime - session.officialStartTime) / 60000)
  let startScore = 100
  if (delayMinutes > 0) {
    // Lose 5 points per minute late
    startScore = Math.max(0, 100 - (delayMinutes * 5))
  }

  // 2. Presence Continuity (40% weight)
  // Percentage of valid pings (distance <= 200m)
  // If no pings but session duration > 20min (min ping interval)? -> assume missed pings = 0 valid
  let validPingsCount = 0

  const durationMinutes = (session.endTime - session.actualStartTime) / 60000

  // If actual pings < expected, treat missing as invalid? Or just ratio of captured?
  // "Presence Continuity: Percentage of valid pings during session."
  // implies ratio of captured pings that are VALID. Missed pings (app closed) are hard to distinguish from network.
  // But requirement says "Must recover ping scheduling after app resume".
  // Let's stick to ratio of recorded pings.
  let presenceScore = 100
  if (session.pings.length > 0) {
    validPingsCount = session.pings.filter(p => p.isValid).length
    presenceScore = (validPingsCount / session.pings.length) * 100
  }
  else if (durationMinutes > 20) {
    // If long session and 0 pings -> 0 score
    presenceScore = 0
  }

  // 3. Position Stability (20% weight)
  // Analysis of GPS variance. If they jump around excessively (spoofing or extreme movement).
  // Calculate average movement between pings.
  // If average speed > walking speed (e.g. 5km/h)?
  // Or just variance from centroid.
  // Simple check: Average distance between consecutive pings should be low if they are in class.
  let stabilityScore = 100
  if (session.pings.length > 1) {
    let totalDistance = 0
    for (let i = 1; i < session.pings.length; i++) {
      const prev = session.pings[i - 1]
      const curr = session.pings[i]
      if (prev && curr) {
        totalDistance += calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude,
        )
      }
    }
    const avgDistance = totalDistance / (session.pings.length - 1)

    // If average movement between 15min pings > 500m -> penalty
    // 500m in 15min = 2km/h (very slow walking). In class they should be < 50m.
    if (avgDistance > 100) { // 100 meters
      // Decay: 1 point per meter over 100?
      stabilityScore = Math.max(0, 100 - ((avgDistance - 100) / 10))
    }
  }

  // Weighted Average
  const overallScore = Math.round(
    (startScore * 0.4)
    + (presenceScore * 0.4)
    + (stabilityScore * 0.2),
  )

  return {
    startPunctualityScore: Math.round(startScore),
    presenceContinuityScore: Math.round(presenceScore),
    positionStabilityScore: Math.round(stabilityScore),
    overallScore,
  }
}
