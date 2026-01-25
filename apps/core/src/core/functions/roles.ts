import { createRole, deleteRole, getAllRoles, updateRole } from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * Fetch all platform roles
 */
export const getPlatformRoles = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: any) => z.object({
      search: z.string().optional(),
      scope: z.enum(['school', 'system']).optional(),
    }).optional().parse(data),
  )
  .handler(async ({ data }) => {
    return getAllRoles(data)
  })

/**
 * Create a new platform role
 */
export const createPlatformRole = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: any) => z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional(),
      permissions: z.record(z.string(), z.array(z.string())),
      scope: z.enum(['school', 'system']),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    return createRole(data as any)
  })

/**
 * Update an existing platform role
 */
export const updatePlatformRole = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: any) => z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      permissions: z.record(z.string(), z.array(z.string())).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data
    return updateRole(id, updates as any)
  })

/**
 * Delete a platform role
 */
export const deletePlatformRole = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return deleteRole(data.id)
  })
