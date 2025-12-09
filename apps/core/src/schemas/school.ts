import { z } from 'zod'

export const CreateSchoolSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  code: z.string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(20, 'Le code ne doit pas dépasser 20 caractères')
    .regex(/^[A-Z0-9-_]+$/, 'Le code ne doit contenir que des lettres majuscules, chiffres, tirets et underscores'),
  address: z.string()
    .optional(),
  phone: z.string()
    .optional()
    .refine(val => !val || /^\+?[\d\s()-]*$/.test(val), 'Le numéro de téléphone doit être valide'),
  email: z.string()
    .optional()
    .refine(val => !val || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(val), 'Email invalide'),
  logoUrl: z.string()
    .optional()
    .refine(
      val => !val || /^https?:\/\/.+/.test(val) || /^data:image\/.+;base64,.+/.test(val),
      'URL ou image invalide pour le logo',
    ),
  status: z.enum(['active', 'inactive', 'suspended'])
    .default('active'),
  settings: z.record(z.string(), z.unknown()).default({}),
})

export const UpdateSchoolSchema = CreateSchoolSchema.partial().merge(z.object({
  id: z.string().min(1, 'L\'ID est requis'),
}))

export const GetSchoolsSchema = z.object({
  page: z.number()
    .int()
    .min(1, 'La page doit être supérieure à 0')
    .default(1),
  limit: z.number()
    .int()
    .min(1, 'La limite doit être supérieure à 0')
    .max(1000, 'La limite ne doit pas dépasser 1000')
    .default(10),
  search: z.string()
    .optional(),
  status: z.enum(['active', 'inactive', 'suspended'])
    .optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
})

export const SchoolIdSchema = z.object({
  id: z.string()
    .min(1, 'L\'ID est requis'),
})

export const BulkUpdateSchoolsSchema = z.object({
  schoolIds: z.array(z.string())
    .min(1, 'Au moins une école doit être sélectionnée'),
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string()
    .optional(),
})

export const ImportSchoolsSchema = z.object({
  schools: z.array(z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })).min(1, 'Au moins une école est requise'),
  skipDuplicates: z.boolean().optional().default(true),
  generateCodes: z.boolean().optional().default(false),
})

export const SchoolFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
})

export const SchoolStatsSchema = z.object({
  schoolId: z.string(),
  metric: z.enum(['students', 'teachers', 'classes', 'programs']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
})

export type CreateSchoolInput = z.infer<typeof CreateSchoolSchema>
export type UpdateSchoolInput = z.infer<typeof UpdateSchoolSchema>
export type GetSchoolsInput = z.infer<typeof GetSchoolsSchema>
export type SchoolIdInput = z.infer<typeof SchoolIdSchema>
export type BulkUpdateSchoolsInput = z.infer<typeof BulkUpdateSchoolsSchema>
export type ImportSchoolsInput = z.infer<typeof ImportSchoolsSchema>
export type SchoolFiltersInput = z.infer<typeof SchoolFiltersSchema>
export type SchoolStatsInput = z.infer<typeof SchoolStatsSchema>

export const SchoolStatusEnum = z.enum(['active', 'inactive', 'suspended'])
export type SchoolStatus = z.infer<typeof SchoolStatusEnum>
