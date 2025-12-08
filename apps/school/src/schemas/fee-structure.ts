import { z } from 'zod'

// Amount validation (positive decimal)
export const amountSchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide')
  .refine(val => Number.parseFloat(val) > 0, 'Le montant doit être positif')

// Create fee structure schema
export const createFeeStructureSchema = z.object({
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  feeTypeId: z.string().min(1, 'Type de frais requis'),
  gradeId: z.string().optional().nullable(),
  seriesId: z.string().optional().nullable(),
  amount: amountSchema,
  currency: z.string().default('XOF'),
  newStudentAmount: amountSchema.optional().nullable(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>

// Update fee structure schema
export const updateFeeStructureSchema = createFeeStructureSchema.partial().extend({
  id: z.string().min(1),
})

export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>

// Bulk create fee structures
export const bulkCreateFeeStructuresSchema = z.object({
  schoolYearId: z.string().min(1),
  feeTypeId: z.string().min(1),
  structures: z.array(z.object({
    gradeId: z.string().min(1),
    seriesId: z.string().optional().nullable(),
    amount: amountSchema,
    newStudentAmount: amountSchema.optional().nullable(),
  })).min(1, 'Au moins une structure requise'),
})

export type BulkCreateFeeStructuresInput = z.infer<typeof bulkCreateFeeStructuresSchema>
