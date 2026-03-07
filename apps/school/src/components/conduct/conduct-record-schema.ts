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
  incidentPresetId: z.string().optional(),
  type: z.enum(conductTypes),
  category: z.enum(conductCategories).optional(),
  title: z.string().max(200).optional(),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(severityLevels).optional(),
  incidentDate: z.date().optional(),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  witnesses: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'incident') {
    if (!data.incidentPresetId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Incident type is required',
        path: ['incidentPresetId'],
      })
    }
    return
  }

  if (!data.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Category is required',
      path: ['category'],
    })
  }

  if (!data.title?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Title is required',
      path: ['title'],
    })
  }
})

export type ConductRecordFormData = z.infer<typeof conductRecordFormSchema>
