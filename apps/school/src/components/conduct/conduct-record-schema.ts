import { z } from 'zod'

export const conductTypes = ['incident', 'sanction', 'reward', 'note'] as const
export const conductCategories = [
  'behavior',
  'academic',
  'attendance',
  'uniform',
  'property',
  'violence',
  'bullying',
  'cheating',
  'achievement',
  'improvement',
  'other',
] as const
export const severityLevels = ['low', 'medium', 'high', 'critical'] as const

export const conductRecordFormSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  type: z.enum(conductTypes),
  category: z.enum(conductCategories),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  severity: z.enum(severityLevels).optional(),
  incidentDate: z.date().optional(),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  witnesses: z.string().optional(),
})

export type ConductRecordFormData = z.infer<typeof conductRecordFormSchema>
