// ============================================================================
// Note Type Constants
// ============================================================================

export const NOTE_TYPE = {
  WRITING_QUESTION: 'WRITING_QUESTION',
  CLASS_TEST: 'CLASS_TEST',
  LEVEL_TEST: 'LEVEL_TEST',
  HOMEWORK: 'HOMEWORK',
  PARTICIPATION: 'PARTICIPATION',
} as const

export type NoteTypeValue = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE]

// ============================================================================
// Note Type Labels (French)
// ============================================================================

export const NOTE_TYPE_LABELS: Record<NoteTypeValue, string> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'Interrogation écrite',
  [NOTE_TYPE.CLASS_TEST]: 'Devoir en classe',
  [NOTE_TYPE.LEVEL_TEST]: 'Devoir de niveau',
  [NOTE_TYPE.HOMEWORK]: 'Devoir maison',
  [NOTE_TYPE.PARTICIPATION]: 'Participation',
}

// ============================================================================
// Note Type Short Labels (French)
// ============================================================================

export const NOTE_TYPE_SHORT_LABELS: Record<NoteTypeValue, string> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'I.E.',
  [NOTE_TYPE.CLASS_TEST]: 'D.C.',
  [NOTE_TYPE.LEVEL_TEST]: 'D.N.',
  [NOTE_TYPE.HOMEWORK]: 'D.M.',
  [NOTE_TYPE.PARTICIPATION]: 'Part.',
}

// ============================================================================
// Note Type Colors
// ============================================================================

export const NOTE_TYPE_COLORS: Record<NoteTypeValue, string> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'hsl(220, 70%, 50%)', // Blue
  [NOTE_TYPE.CLASS_TEST]: 'hsl(280, 70%, 50%)', // Purple
  [NOTE_TYPE.LEVEL_TEST]: 'hsl(340, 70%, 50%)', // Pink
  [NOTE_TYPE.HOMEWORK]: 'hsl(160, 70%, 40%)', // Green
  [NOTE_TYPE.PARTICIPATION]: 'hsl(40, 70%, 50%)', // Orange
}

// ============================================================================
// Note Type Badge Variants
// ============================================================================

export const NOTE_TYPE_BADGE_VARIANTS: Record<
  NoteTypeValue,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'default',
  [NOTE_TYPE.CLASS_TEST]: 'secondary',
  [NOTE_TYPE.LEVEL_TEST]: 'destructive',
  [NOTE_TYPE.HOMEWORK]: 'outline',
  [NOTE_TYPE.PARTICIPATION]: 'secondary',
}

// ============================================================================
// Graded vs Non-Graded Types
// ============================================================================

export const GRADED_NOTE_TYPES: NoteTypeValue[] = [
  NOTE_TYPE.WRITING_QUESTION,
  NOTE_TYPE.CLASS_TEST,
  NOTE_TYPE.LEVEL_TEST,
  NOTE_TYPE.HOMEWORK,
]

export const NON_GRADED_NOTE_TYPES: NoteTypeValue[] = [NOTE_TYPE.PARTICIPATION]

// ============================================================================
// Helper Functions
// ============================================================================

export function isGradedNoteType(type: NoteTypeValue): boolean {
  return GRADED_NOTE_TYPES.includes(type)
}

export function getNoteTypeLabel(type: NoteTypeValue): string {
  return NOTE_TYPE_LABELS[type] || type
}

export function getNoteTypeShortLabel(type: NoteTypeValue): string {
  return NOTE_TYPE_SHORT_LABELS[type] || type
}

export function getNoteTypeColor(type: NoteTypeValue): string {
  return NOTE_TYPE_COLORS[type] || 'hsl(0, 0%, 50%)'
}

// ============================================================================
// Default Note Configuration
// ============================================================================

export const DEFAULT_NOTE_CONFIG = {
  totalPoints: 20,
  weight: 1,
  isGraded: true,
} as const

export const NOTE_TYPE_DEFAULT_POINTS: Record<NoteTypeValue, number> = {
  [NOTE_TYPE.WRITING_QUESTION]: 20,
  [NOTE_TYPE.CLASS_TEST]: 20,
  [NOTE_TYPE.LEVEL_TEST]: 20,
  [NOTE_TYPE.HOMEWORK]: 20,
  [NOTE_TYPE.PARTICIPATION]: 10,
}

export const NOTE_TYPE_DEFAULT_WEIGHTS: Record<NoteTypeValue, number> = {
  [NOTE_TYPE.WRITING_QUESTION]: 1,
  [NOTE_TYPE.CLASS_TEST]: 2,
  [NOTE_TYPE.LEVEL_TEST]: 3,
  [NOTE_TYPE.HOMEWORK]: 1,
  [NOTE_TYPE.PARTICIPATION]: 1,
}
