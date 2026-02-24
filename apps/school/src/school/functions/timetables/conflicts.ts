import { Result as R } from '@praha/byethrow'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import { detectConflictsSchema } from '@/schemas/timetable'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Detect conflicts for a potential session
 */
export const detectConflicts = authServerFn
  .inputValidator(detectConflictsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const result = await timetableQueries.detectConflicts(data)
    if (R.isFailure(result))
      return { success: false as const, error: 'Échec de la vérification des conflits' }
    return { success: true as const, data: result.value }
  })

/**
 * Get all existing conflicts for a school and year
 */
export const getAllConflicts = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const result = await timetableQueries.getAllConflictsForSchool(data.schoolId, data.schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la récupération des conflits' }
    return { success: true as const, data: result.value }
  })
