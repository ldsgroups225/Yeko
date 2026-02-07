import { z } from 'zod'

// Fee categories
export const feeCategories = ['tuition', 'registration', 'exam', 'transport', 'uniform', 'books', 'meals', 'activities', 'other'] as const
export type FeeCategory = (typeof feeCategories)[number]

// Fee type status
export const feeTypeStatuses = ['active', 'inactive'] as const
export type FeeTypeStatus = (typeof feeTypeStatuses)[number]

// Create fee type schema
export const createFeeTypeSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  category: z.enum(feeCategories, { message: 'Catégorie invalide' }),
  isMandatory: z.boolean().default(true),
  isRecurring: z.boolean().default(true),
  revenueAccountId: z.string().optional().nullable(),
  receivableAccountId: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  feeTypeTemplateId: z.string().optional().nullable(),
})

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>

// Update fee type schema
export const updateFeeTypeSchema = createFeeTypeSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(feeTypeStatuses).optional(),
})

export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>

// Fee category labels (French)
export const feeCategoryLabels: Record<FeeCategory, string> = {
  tuition: 'Scolarité',
  registration: 'Inscription',
  exam: 'Examen',
  transport: 'Transport',
  uniform: 'Uniforme',
  books: 'Fournitures',
  meals: 'Cantine',
  activities: 'Activités',
  other: 'Autre',
}
