import type { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { removeUserSchema, suspendUserSchema } from '@/schemas/user'

// Helper to load queries dynamically
const loadUserQueries = () => import('@repo/data-ops/queries/school-admin/users')

/**
 * Suspend a user (update status to suspended)
 */
export const suspendUser = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: z.infer<typeof suspendUserSchema>) => {
    return suspendUserSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { updateUser } = await loadUserQueries()
      await updateUser(data.userId, data.schoolId, { status: 'suspended' })

      return {
        success: true,
        message: 'Utilisateur suspendu avec succès',
      }
    }
    catch (error: unknown) {
      console.error('Error suspending user:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la suspension de l\'utilisateur'
      throw new Error(message)
    }
  })

/**
 * Remove a user (soft delete)
 */
export const removeUser = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: z.infer<typeof removeUserSchema>) => {
    return removeUserSchema.parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { deleteUser } = await loadUserQueries()
      await deleteUser(data.userId, data.schoolId)

      return {
        success: true,
        message: 'Utilisateur supprimé avec succès',
      }
    }
    catch (error: unknown) {
      console.error('Error removing user:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur'
      throw new Error(message)
    }
  })
