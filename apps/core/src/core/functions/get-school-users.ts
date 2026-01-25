import type { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { getSchoolUsersSchema } from '@/schemas/user'

// Helper to load queries dynamically
const loadUserQueries = () => import('@repo/data-ops/queries/school-admin/users')

/**
 * Get users for a specific school
 */
export const getSchoolUsers = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: z.infer<typeof getSchoolUsersSchema>) => {
    return getSchoolUsersSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const { schoolId, ...options } = data

    try {
      // Get users and total count
      const { getUsersBySchool, countUsersBySchool } = await loadUserQueries()
      const [users, total] = await Promise.all([
        getUsersBySchool(schoolId, options),
        countUsersBySchool(schoolId, options),
      ])

      return {
        success: true,
        data: {
          users,
          total,
          limit: options.limit || 50,
          offset: options.offset || 0,
        },
      }
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Error fetching school users:', error)
      throw new Error(message || 'Erreur lors de la récupération des utilisateurs')
    }
  })
