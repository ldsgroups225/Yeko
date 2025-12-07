import { getTermsBySchoolYear } from '@repo/data-ops/queries/school-admin/terms'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

export const getTerms = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')
    return await getTermsBySchoolYear(data.schoolYearId, context.schoolId)
  })
