export interface Coordinates {
  latitude: number
  longitude: number
  accuracy: number
}

/**
 * Calculates the geodesic distance between two points using the Haversine formula.
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3 // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

  const a
    = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)
      + Math.cos(phi1) * Math.cos(phi2)
      * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Gets the current position using the Geolocation API.
 * @returns Promise resolving to Coordinates
 */
export function getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      },
    )
  })
}

/**
 * Validates if the current location is within the allowed distance from the target.
 * @param current Current coordinates
 * @param target Target coordinates
 * @param target.latitude Target latitude
 * @param target.longitude Target longitude
 * @param maxDistance Maximum allowed distance in meters
 * @returns Object containing distance and validity
 */
export function validateLocation(
  current: Coordinates,
  target: { latitude: number, longitude: number },
  maxDistance = 200,
): { isValid: boolean, distance: number } {
  const distance = calculateDistance(
    current.latitude,
    current.longitude,
    target.latitude,
    target.longitude,
  )

  return {
    isValid: distance <= maxDistance,
    distance,
  }
}
