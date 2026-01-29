import type { SystemPermissions } from '@repo/data-ops/auth/permissions'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * Fetch all platform roles
 */
export const getPlatformRoles = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: unknown) => z.object({
      search: z.string().optional(),
      scope: z.enum(['school', 'system']).optional(),
    }).optional().parse(data),
  )
  .handler(async ({ data }) => {
    const { getAllRoles } = await import('@repo/data-ops/queries/school-admin/roles')
    const result = await getAllRoles(data)
    return result
  })

/**
 * Create a new platform role
 */
export const createPlatformRole = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: unknown) => z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional(),
      permissions: z.record(z.string(), z.array(z.string())),
      scope: z.enum(['school', 'system']),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { createRole } = await import('@repo/data-ops/queries/school-admin/roles')
    const result = await createRole({
      ...data,
      permissions: data.permissions as SystemPermissions,
    })
    return result
  })

/**
 * Update an existing platform role
 */
export const updatePlatformRole = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: unknown) => z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      permissions: z.record(z.string(), z.array(z.string())).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { updateRole } = await import('@repo/data-ops/queries/school-admin/roles')
    const { id, ...updates } = data
    const result = await updateRole(id, {
      ...updates,
      permissions: updates.permissions as SystemPermissions,
    })
    return result
  })

/**
 * Delete a platform role
 */
export const deletePlatformRole = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { deleteRole } = await import('@repo/data-ops/queries/school-admin/roles')
    const result = await deleteRole(data.id)
    return result
  })
