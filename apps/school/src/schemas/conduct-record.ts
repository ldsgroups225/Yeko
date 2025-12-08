import { z } from 'zod'

export const conductTypes = ['incident', 'sanction', 'reward', 'note'] as const
export type ConductType = (typeof conductTypes)[number]

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
export type ConductCategory = (typeof conductCategories)[number]

export const severityLevels = ['low', 'medium', 'high', 'critical'] as const
export type SeverityLevel = (typeof severityLevels)[number]

export const sanctionTypes = [
  'verbal_warning',
  'written_warning',
  'detention',
  'suspension',
  'community_service',
  'parent_meeting',
  'expulsion',
  'other',
] as const
export type SanctionType = (typeof sanctionTypes)[number]

export const rewardTypes = [
  'certificate',
  'merit_points',
  'public_recognition',
  'prize',
  'scholarship',
  'other',
] as const
export type RewardType = (typeof rewardTypes)[number]

export const conductStatuses = ['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed'] as const
export type ConductStatus = (typeof conductStatuses)[number]

export const conductRecordSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  classId: z.string().optional().nullable(),
  schoolYearId: z.string().min(1, 'School year is required'),
  type: z.enum(conductTypes),
  category: z.enum(conductCategories),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  severity: z.enum(severityLevels).optional().nullable(),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  incidentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  witnesses: z.array(z.string()).optional().nullable(),
  sanctionType: z.enum(sanctionTypes).optional().nullable(),
  sanctionStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  sanctionEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  sanctionDetails: z.string().max(2000).optional().nullable(),
  rewardType: z.enum(rewardTypes).optional().nullable(),
  pointsAwarded: z.number().int().min(0).optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional().nullable(),
})

export const conductFollowUpSchema = z.object({
  conductRecordId: z.string().min(1),
  action: z.string().min(1, 'Action is required').max(500),
  notes: z.string().max(2000).optional().nullable(),
  outcome: z.string().max(1000).optional().nullable(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

export const updateConductStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(conductStatuses),
  resolutionNotes: z.string().optional().nullable(),
})

export type ConductRecordInput = z.infer<typeof conductRecordSchema>
export type ConductFollowUpInput = z.infer<typeof conductFollowUpSchema>
export type UpdateConductStatusInput = z.infer<typeof updateConductStatusSchema>
