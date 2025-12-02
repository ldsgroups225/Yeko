import { z } from 'zod'

// Role validation schema
export const roleSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères'),
  slug: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères').regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  description: z.string().optional().nullable(),
  permissions: z.record(z.string(), z.array(z.string())),
  scope: z.enum(['school', 'system'], {
    message: 'Portée invalide',
  }).default('school'),
})

export const createRoleSchema = roleSchema

export const updateRoleSchema = roleSchema.partial().extend({
  // Cannot update slug or scope after creation
  slug: z.never().optional(),
  scope: z.never().optional(),
})

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
}

export type RoleFormData = z.infer<typeof roleSchema>
export type CreateRoleData = z.infer<typeof createRoleSchema>
export type UpdateRoleData = z.infer<typeof updateRoleSchema>
