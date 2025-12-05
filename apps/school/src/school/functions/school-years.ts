import { getSchoolYearsBySchool } from '@repo/data-ops/queries/school-admin/school-years'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSchoolContext } from '../middleware/school-context'

export const getActiveSchoolYear = createServerFn()
  .inputValidator(z.object({}))
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const schoolYears = await getSchoolYearsBySchool(context.schoolId, { isActive: true, limit: 1 })
    return schoolYears[0] || null
  })
