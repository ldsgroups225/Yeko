import { z } from 'zod'

export function getFeeStructureSchema(t: (key: string) => string) {
  return z.object({
    feeTypeId: z.string().min(1, t('finance.feeStructures.errors.feeTypeRequired')),
    gradeId: z.string().optional().nullable(),
    seriesId: z.string().optional().nullable(),
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, t('finance.feeStructures.errors.invalidAmount'))
      .min(1, t('finance.feeStructures.errors.amountRequired')),
    currency: z.string(),
    newStudentAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, t('finance.feeStructures.errors.invalidAmount'))
      .optional()
      .nullable(),
    effectiveDate: z.string().optional().nullable(),
  })
}

export type FeeStructureFormData = z.infer<ReturnType<typeof getFeeStructureSchema>>
