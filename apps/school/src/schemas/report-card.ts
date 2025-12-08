import { z } from 'zod'

// ============================================
// REPORT CARD STATUS TYPES
// ============================================

export const reportCardStatuses = ['draft', 'generated', 'sent', 'delivered', 'viewed'] as const
export type ReportCardStatus = typeof reportCardStatuses[number]

export const deliveryMethods = ['email', 'in_app', 'sms', 'print'] as const
export type DeliveryMethod = typeof deliveryMethods[number]

// ============================================
// REPORT CARD TEMPLATE SCHEMAS
// ============================================

export const reportCardTemplateConfigSchema = z.object({
  showRank: z.boolean().optional(),
  showAttendance: z.boolean().optional(),
  showConduct: z.boolean().optional(),
  showComments: z.boolean().optional(),
  sections: z.array(z.string()).optional(),
  gradingScale: z.array(z.object({
    min: z.number(),
    max: z.number(),
    label: z.string(),
  })).optional(),
})

export const createReportCardTemplateSchema = z.object({
  schoolId: z.string().min(1, 'École requise'),
  name: z.string().min(1, 'Nom requis').max(100),
  isDefault: z.boolean().optional(),
  config: reportCardTemplateConfigSchema.optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide').optional(),
  fontFamily: z.string().optional(),
})

export type CreateReportCardTemplateInput = z.infer<typeof createReportCardTemplateSchema>

export const updateReportCardTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  config: reportCardTemplateConfigSchema.optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  fontFamily: z.string().optional(),
})

export type UpdateReportCardTemplateInput = z.infer<typeof updateReportCardTemplateSchema>

// ============================================
// REPORT CARD SCHEMAS
// ============================================

export const getReportCardsSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  termId: z.string().min(1, 'Trimestre requis'),
  status: z.enum(reportCardStatuses).optional(),
})

export type GetReportCardsInput = z.infer<typeof getReportCardsSchema>

export const generateReportCardSchema = z.object({
  studentId: z.string().min(1, 'Élève requis'),
  classId: z.string().min(1, 'Classe requise'),
  termId: z.string().min(1, 'Trimestre requis'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  templateId: z.string().optional(),
  homeroomComment: z.string().max(1000, 'Commentaire trop long').optional(),
})

export type GenerateReportCardInput = z.infer<typeof generateReportCardSchema>

export const bulkGenerateReportCardsSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  termId: z.string().min(1, 'Trimestre requis'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  templateId: z.string().optional(),
  studentIds: z.array(z.string()).optional(), // If empty, generate for all enrolled students
})

export type BulkGenerateReportCardsInput = z.infer<typeof bulkGenerateReportCardsSchema>

export const sendReportCardSchema = z.object({
  reportCardId: z.string().min(1, 'Bulletin requis'),
  deliveryMethod: z.enum(deliveryMethods),
  recipientEmail: z.string().email('Email invalide').optional(),
  recipientPhone: z.string().optional(),
})

export type SendReportCardInput = z.infer<typeof sendReportCardSchema>

export const bulkSendReportCardsSchema = z.object({
  reportCardIds: z.array(z.string()).min(1, 'Sélectionnez au moins un bulletin'),
  deliveryMethod: z.enum(deliveryMethods),
})

export type BulkSendReportCardsInput = z.infer<typeof bulkSendReportCardsSchema>

export const updateHomeroomCommentSchema = z.object({
  reportCardId: z.string().min(1),
  homeroomComment: z.string().max(1000, 'Commentaire trop long'),
})

export type UpdateHomeroomCommentInput = z.infer<typeof updateHomeroomCommentSchema>

// ============================================
// TEACHER COMMENT SCHEMAS
// ============================================

export const createTeacherCommentSchema = z.object({
  reportCardId: z.string().min(1, 'Bulletin requis'),
  subjectId: z.string().min(1, 'Matière requise'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  comment: z.string().min(1, 'Commentaire requis').max(500, 'Commentaire trop long'),
})

export type CreateTeacherCommentInput = z.infer<typeof createTeacherCommentSchema>

export const updateTeacherCommentSchema = z.object({
  id: z.string().min(1),
  comment: z.string().min(1).max(500),
})

export type UpdateTeacherCommentInput = z.infer<typeof updateTeacherCommentSchema>

// ============================================
// STATUS LABELS (French)
// ============================================

export const reportCardStatusLabels: Record<ReportCardStatus, string> = {
  draft: 'Brouillon',
  generated: 'Généré',
  sent: 'Envoyé',
  delivered: 'Livré',
  viewed: 'Vu',
}

export const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  email: 'Email',
  in_app: 'Application',
  sms: 'SMS',
  print: 'Impression',
}
