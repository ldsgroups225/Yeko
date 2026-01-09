import { z } from 'zod'

// IconPhone validation regex for Ivory Coast format
const phoneRegex = /^(\+225)?\d{10}$/

// Student import row schema
export const studentImportRowSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format date invalide (JJ/MM/AAAA)'),
  gender: z.enum(['M', 'F']),
  gradeCode: z.string().min(1, 'Code niveau requis'),
  seriesCode: z.string().optional(),
  section: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().regex(phoneRegex, 'Format téléphone invalide').optional().or(z.literal('')),
  parentEmail: z.string().email('Email invalide').optional().or(z.literal('')),
})

export type StudentImportRow = z.infer<typeof studentImportRowSchema>

// Bulk enrollment schema
export const bulkEnrollmentSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'Au moins un élève requis'),
  classId: z.string().min(1, 'Classe requise'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  autoConfirm: z.boolean().default(false),
})

export type BulkEnrollmentInput = z.infer<typeof bulkEnrollmentSchema>

// Bulk re-enrollment schema
export const bulkReEnrollmentSchema = z.object({
  fromSchoolYearId: z.string().min(1, 'Année source requise'),
  toSchoolYearId: z.string().min(1, 'Année cible requise'),
  gradeMapping: z.record(z.string(), z.string()).optional(), // oldGradeId -> newGradeId
  autoConfirm: z.boolean().default(false),
})

export type BulkReEnrollmentInput = z.infer<typeof bulkReEnrollmentSchema>

// Bulk fee assignment schema
export const bulkFeeAssignmentSchema = z.object({
  gradeId: z.string().optional(),
  classId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  feeTypeIds: z.array(z.string()).optional(), // If empty, assign all applicable fees
})

export type BulkFeeAssignmentInput = z.infer<typeof bulkFeeAssignmentSchema>

// Bulk transfer schema
export const bulkTransferSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'Au moins un élève requis'),
  newClassId: z.string().min(1, 'Nouvelle classe requise'),
  reason: z.string().optional(),
})

export type BulkTransferInput = z.infer<typeof bulkTransferSchema>

// Bulk operation progress
export const bulkOperationProgressSchema = z.object({
  operationId: z.string(),
  type: z.enum(['enrollment', 'fee_assignment', 'import', 'transfer']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  total: z.number(),
  processed: z.number(),
  succeeded: z.number(),
  failed: z.number(),
  errors: z.array(z.object({
    row: z.number().optional(),
    studentId: z.string().optional(),
    message: z.string(),
  })),
  startedAt: z.date(),
  completedAt: z.date().optional(),
})

export type BulkOperationProgress = z.infer<typeof bulkOperationProgressSchema>

// Import validation result
export const importValidationResultSchema = z.object({
  isValid: z.boolean(),
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    message: z.string(),
  })),
  preview: z.array(studentImportRowSchema).max(10),
})

export type ImportValidationResult = z.infer<typeof importValidationResultSchema>
