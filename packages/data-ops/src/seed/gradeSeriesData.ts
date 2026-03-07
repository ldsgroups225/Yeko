/**
 * Grade-Series mapping data (Ivorian education system)
 *
 * Business rules:
 * - 1er cycle (6ème, 5ème, 4ème, 3ème): NO series
 * - 2nde: Série A, Série C
 * - 1ère: Série A, Série A1, Série A2, Série C, Série D
 * - Terminale: Série A, Série A1, Série A2, Série C, Série D
 */

/** Grade codes that have series in the 2nd cycle */
const GRADE_SERIES_MAP: Record<string, string[]> = {
  // 1er cycle — aucune série
  '6EME': [],
  '5EME': [],
  '4EME': [],
  '3EME': [],
  // 2nd cycle
  '2NDE': ['A', 'C'],
  '1ERE': ['A', 'A1', 'A2', 'C', 'D'],
  'TERM': ['A', 'A1', 'A2', 'C', 'D'],
}

interface GradeRecord { id: string, code: string }
interface SeriesRecord { id: string, code: string }

export function gradeSeriesData(
  grades: GradeRecord[],
  seriesList: SeriesRecord[],
): Array<{ gradeId: string, seriesId: string }> {
  const seriesByCode = new Map(seriesList.map(s => [s.code, s.id]))
  const entries: Array<{ gradeId: string, seriesId: string }> = []

  for (const grade of grades) {
    const allowedSeriesCodes = GRADE_SERIES_MAP[grade.code]
    if (!allowedSeriesCodes) {
      continue
    }

    for (const seriesCode of allowedSeriesCodes) {
      const seriesId = seriesByCode.get(seriesCode)
      if (seriesId) {
        entries.push({ gradeId: grade.id, seriesId })
      }
    }
  }

  return entries
}
