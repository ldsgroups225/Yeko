import type { z } from 'zod'
import {
  deleteUser,
  updateUser,
} from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { removeUserSchema, suspendUserSchema } from '@/schemas/user'

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
      await updateUser(data.userId, data.schoolId, { status: 'suspended' })

      return {
        success: true,
        message: 'Utilisateur suspendu avec succès',
      }
    }
    catch (error: any) {
      console.error('Error suspending user:', error)
      throw new Error(
        error.message || 'Erreur lors de la suspension de l\'utilisateur',
      )
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
      await deleteUser(data.userId, data.schoolId)

      return {
        success: true,
        message: 'Utilisateur supprimé avec succès',
      }
    }
    catch (error: any) {
      console.error('Error removing user:', error)
      throw new Error(
        error.message || 'Erreur lors de la suppression de l\'utilisateur',
      )
    }
  })
