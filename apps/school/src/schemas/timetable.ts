import { z } from 'zod'

// ============================================
// TIME VALIDATION
// ============================================

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const timeSchema = z.string().regex(timeRegex, 'Format horaire invalide (HH:MM)')

// ============================================
// TIMETABLE SESSION SCHEMAS
// ============================================

export const getTimetableByClassSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
})

export type GetTimetableByClassInput = z.infer<typeof getTimetableByClassSchema>

export const getTimetableByTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Enseignant requis'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
})

export type GetTimetableByTeacherInput = z.infer<typeof getTimetableByTeacherSchema>

export const getTimetableByClassroomSchema = z.object({
  classroomId: z.string().min(1, 'Salle requise'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
})

export type GetTimetableByClassroomInput = z.infer<typeof getTimetableByClassroomSchema>

export const createTimetableSessionSchema = z.object({
  schoolId: z.string().min(1, 'École requise'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  classroomId: z.string().optional(),
  dayOfWeek: z.number().int().min(1, 'Jour invalide').max(7, 'Jour invalide'),
  startTime: timeSchema,
  endTime: timeSchema,
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isRecurring: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
}).refine(
  data => data.endTime > data.startTime,
  { message: 'L\'heure de fin doit être après l\'heure de début', path: ['endTime'] },
)

export type CreateTimetableSessionInput = z.infer<typeof createTimetableSessionSchema>

export const updateTimetableSessionSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  classroomId: z.string().nullable().optional(),
  dayOfWeek: z.number().int().min(1).max(7).optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  isRecurring: z.boolean().optional(),
  notes: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable().optional(),
})

export type UpdateTimetableSessionInput = z.infer<typeof updateTimetableSessionSchema>

// ============================================
// IMPORT SCHEMAS
// ============================================

export const importTimetableSessionSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  classroomId: z.string().optional(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().optional(),
  color: z.string().optional(),
})

export const importTimetableSchema = z.object({
  schoolId: z.string().min(1),
  schoolYearId: z.string().min(1),
  sessions: z.array(importTimetableSessionSchema).min(1, 'Au moins une séance requise'),
  replaceExisting: z.boolean().optional(), // If true, delete existing sessions for the class
})

export type ImportTimetableInput = z.infer<typeof importTimetableSchema>

// ============================================
// CONFLICT DETECTION SCHEMAS
// ============================================

export const detectConflictsSchema = z.object({
  schoolId: z.string().min(1),
  schoolYearId: z.string().min(1),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: timeSchema,
  endTime: timeSchema,
  teacherId: z.string().optional(),
  classroomId: z.string().optional(),
  classId: z.string().optional(),
  excludeSessionId: z.string().optional(),
})

export type DetectConflictsInput = z.infer<typeof detectConflictsSchema>

// ============================================
// DAY OF WEEK LABELS (French)
// ============================================

export const dayOfWeekLabels: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
}

export const dayOfWeekShortLabels: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
  7: 'Dim',
}

// ============================================
// TIME SLOT HELPERS
// ============================================

export const defaultTimeSlots = [
  { start: '07:00', end: '08:00' },
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
]

// Subject colors for timetable display
export const subjectColors: Record<string, string> = {
  Scientifique: '#ef4444', // Red
  Littéraire: '#3b82f6', // Blue
  Sportif: '#22c55e', // Green
  Autre: '#a855f7', // Purple
}
