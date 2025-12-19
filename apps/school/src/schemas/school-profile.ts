import { z } from 'zod'

// Grading scale thresholds
export const gradingThresholdSchema = z.object({
  min: z.number().min(0).max(20),
  max: z.number().min(0).max(20),
  label: z.string().min(1),
})

// Grading scale configuration
export const gradingScaleSchema = z.object({
  excellent: gradingThresholdSchema,
  good: gradingThresholdSchema,
  average: gradingThresholdSchema,
  fail: gradingThresholdSchema,
})

// Notification settings
export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  paymentReminders: z.boolean().default(true),
  attendanceAlerts: z.boolean().default(true),
})

// Academic settings
export const academicSettingsSchema = z.object({
  passingGrade: z.number().min(0).max(20).default(10),
  maxAbsences: z.number().min(0).default(10),
  termWeights: z.object({
    term1: z.number().min(0).max(10).default(1),
    term2: z.number().min(0).max(10).default(1),
    term3: z.number().min(0).max(10).default(1),
  }),
})

// Display settings
export const displaySettingsSchema = z.object({
  currency: z.enum(['XOF', 'EUR', 'USD']).default('XOF'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY']).default('DD/MM/YYYY'),
  language: z.enum(['fr', 'en']).default('fr'),
})

// Complete school settings JSONB structure
export const schoolSettingsSchema = z.object({
  gradingScale: gradingScaleSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  academic: academicSettingsSchema.optional(),
  display: displaySettingsSchema.optional(),
})

export type SchoolSettings = z.infer<typeof schoolSettingsSchema>
export type GradingScale = z.infer<typeof gradingScaleSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type AcademicSettings = z.infer<typeof academicSettingsSchema>
export type DisplaySettings = z.infer<typeof displaySettingsSchema>

// Default grading scale for Ivory Coast
export const defaultGradingScale: GradingScale = {
  excellent: { min: 16, max: 20, label: 'Excellent' },
  good: { min: 14, max: 15.99, label: 'Bien' },
  average: { min: 10, max: 13.99, label: 'Passable' },
  fail: { min: 0, max: 9.99, label: 'Insuffisant' },
}

// Default school settings
export const defaultSchoolSettings: SchoolSettings = {
  gradingScale: defaultGradingScale,
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    paymentReminders: true,
    attendanceAlerts: true,
  },
  academic: {
    passingGrade: 10,
    maxAbsences: 10,
    termWeights: { term1: 1, term2: 1, term3: 1 },
  },
  display: {
    currency: 'XOF',
    dateFormat: 'DD/MM/YYYY',
    language: 'fr',
  },
}

// School profile update schema
export const updateSchoolProfileSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.email('Email invalide').optional().nullable().or(z.literal('')),
})

export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>

// School settings update schema
export const updateSchoolSettingsSchema = schoolSettingsSchema.partial()

export type UpdateSchoolSettingsInput = z.infer<typeof updateSchoolSettingsSchema>
