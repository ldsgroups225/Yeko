import { z } from 'zod'

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url('URL invalide').optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended'], {
    message: 'Statut invalide',
  }),
  roleIds: z.array(z.string()).min(1, 'Au moins un rôle requis'),
})

export const createUserSchema = userSchema

export const updateUserSchema = userSchema.partial().extend({
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

export type UserFormData = z.infer<typeof userSchema>
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type BulkImportUserData = z.infer<typeof bulkImportUserSchema>
