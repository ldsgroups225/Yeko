import type { Conflict } from '../conflict-indicator'
import { z } from 'zod'

export const sessionFormSchema = z.object({
  subjectId: z.string().min(1, 'Matière requise'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  classroomId: z.string().optional(),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format invalide'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format invalide'),
  notes: z.string().max(500).optional(),
  color: z.string().optional(),
}).refine(
  data => data.endTime > data.startTime,
  { message: 'L\'heure de fin doit être après l\'heure de début', path: ['endTime'] },
)

export type SessionFormInput = z.infer<typeof sessionFormSchema>

export interface Subject {
  id: string
  name: string
}

export interface Teacher {
  id: string
  name: string
}

export interface Classroom {
  id: string
  name: string
}

export interface TimetableSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: Partial<SessionFormInput> & { id?: string }
  subjects: Subject[]
  teachers: Teacher[]
  classrooms: Classroom[]
  conflicts?: Conflict[]
  onSubmit: (data: SessionFormInput & { id?: string }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  isSubmitting?: boolean
  isDeleting?: boolean
}
