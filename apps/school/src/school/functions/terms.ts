import { getTermsBySchoolYear } from '@repo/data-ops/queries/school-admin/terms'
import { z } from 'zod'

import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getTerms = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const result = await getTermsBySchoolYear(data.schoolYearId, context.school.schoolId)
    return { success: true as const, data: result }
  })
