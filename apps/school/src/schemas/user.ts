import { z } from 'zod'

// IconUser validation schema
export const userCreateSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  email: z.email('Email invalide'),
  phone: z.string().optional().nullable(),
  avatarUrl: z.url('URL invalide').or(z.literal('')).optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended'], {
    message: 'Statut invalide',
  }),
  roleIds: z.array(z.string()),
})

export const userUpdateSchema = userCreateSchema.partial().extend({
  roleIds: z.array(z.string()).optional(),
})

// Bulk import schema
export const bulkImportUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  roles: z.string(), // Comma-separated role slugs
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
})

export type UserFormData = z.infer<typeof userCreateSchema>
export type CreateUserData = z.infer<typeof userCreateSchema>
export type UpdateUserData = z.infer<typeof userUpdateSchema>
export type BulkImportUserData = z.infer<typeof bulkImportUserSchema>
