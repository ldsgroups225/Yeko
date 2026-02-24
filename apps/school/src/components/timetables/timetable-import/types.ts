import type { TimetableConflict } from '@repo/data-ops/queries/timetables'

export interface ConflictEntry {
  index: number
  conflicts: TimetableConflict[]
}

export interface ImportResult {
  success: number
  failed: number
  conflicts: ConflictEntry[]
}

export interface TimetableImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
}
