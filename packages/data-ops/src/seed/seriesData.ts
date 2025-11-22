import type { SerieData } from '../drizzle/core-schema'

export function seriesData(generalTrackId: string): SerieData[] {
  return [
    { name: 'Série A', code: 'A', trackId: generalTrackId },
    { name: 'Série A1', code: 'A1', trackId: generalTrackId },
    { name: 'Série A2', code: 'A2', trackId: generalTrackId },
    { name: 'Série C', code: 'C', trackId: generalTrackId },
    { name: 'Série D', code: 'D', trackId: generalTrackId },
  ]
}
